from datetime import timedelta
from decimal import Decimal

from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from stock.models import Medicament, StockItem, StockMovement
from structures.models import (
    EquipeStructure,
    RoleEquipeStructure,
    StatutEquipeStructure,
    StatutStructure,
    Structure,
    TypeStructure,
)
from utilisateurs.models import RoleUtilisateur, TypeAuthentification, Utilisateur

from .models import (
    ActionCaisse,
    EtatVente,
    Facture,
    ImpressionFacture,
    MotifRetour,
    OperationCaisse,
    Paiement,
    RetourCaisse,
    Vente,
)
from .receipts import generer_reçu_pdf
from .services import VenteService


class VenteBaseTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.structure = Structure.objects.create(
            nom="Pharmacie Test",
            type=TypeStructure.PHARMACIE,
            statut=StatutStructure.ACTIVE,
            adresse="Abidjan",
            telephone="0102030405",
        )

        self.gestionnaire = Utilisateur.objects.create_user(
            email="gestionnaire@test.com",
            password="password123",
            nom="Gest",
            role=RoleUtilisateur.GESTIONNAIRE,
            type_authentification=TypeAuthentification.EMAIL,
            email_verifie=True,
        )
        self.structure.gestionnaire = self.gestionnaire
        self.structure.save(update_fields=["gestionnaire"])
        EquipeStructure.objects.create(
            structure=self.structure,
            utilisateur=self.gestionnaire,
            role=RoleEquipeStructure.GESTIONNAIRE,
            statut=StatutEquipeStructure.ACTIF,
        )

        self.caissier = Utilisateur.objects.create_user(
            email="caissier@test.com",
            password="password123",
            nom="Cais",
            role=RoleUtilisateur.CAISSIER,
            type_authentification=TypeAuthentification.EMAIL,
            email_verifie=True,
        )
        EquipeStructure.objects.create(
            structure=self.structure,
            utilisateur=self.caissier,
            role=RoleEquipeStructure.CAISSIER,
            statut=StatutEquipeStructure.ACTIF,
        )

        self.caissier_autre = Utilisateur.objects.create_user(
            email="caissier-autre@test.com",
            password="password123",
            nom="Cais Autre",
            role=RoleUtilisateur.CAISSIER,
            type_authentification=TypeAuthentification.EMAIL,
            email_verifie=True,
        )

        self.proprietaire = Utilisateur.objects.create_user(
            email="proprietaire@test.com",
            password="password123",
            nom="Proprio",
            role=RoleUtilisateur.PROPRIETAIRE,
            type_authentification=TypeAuthentification.EMAIL,
            email_verifie=True,
        )
        EquipeStructure.objects.create(
            structure=self.structure,
            utilisateur=self.proprietaire,
            role=RoleEquipeStructure.PROPRIETAIRE,
            statut=StatutEquipeStructure.ACTIF,
        )

        self.medicament = Medicament.objects.create(
            structure=self.structure,
            nom="Paracétamol 500mg",
            forme_pharmaceutique="COMPRIME",
            prix_vente=Decimal("500.00"),
        )
        self.item = StockItem.objects.create(
            structure=self.structure,
            nom=self.medicament.nom,
            type_item=StockItem.TYPE_MEDICAMENT,
            quantite=100,
            quantite_reservee=0,
        )

        self.client.force_authenticate(user=self.gestionnaire)
        response = self.client.post(
            "/api/ventes/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 201)
        self.vente = Vente.objects.get(id=response.data["id"])

    def _creer_vente_avec_ligne(self, quantite=5):
        response = self.client.post(
            f"/api/ventes/{self.vente.id}/lignes/",
            {
                "medicament_id": str(self.medicament.id),
                "quantite": quantite,
            },
        )
        self.assertEqual(response.status_code, 200)
        return response

    def _envoyer_a_la_caisse(self):
        self._creer_vente_avec_ligne()
        return self.client.post(f"/api/ventes/{self.vente.id}/envoyer-caisse/")

    def _as_caissier(self, user=None):
        self.client.force_authenticate(user=user or self.caissier)


# ---------------------------------------------------------------------------
# Gestionnaire — préparation
# ---------------------------------------------------------------------------


class PreparationVenteTests(VenteBaseTestCase):

    def test_creer_vente(self):
        self.assertEqual(self.vente.etat, EtatVente.EN_PREPARATION)
        self.assertTrue(self.vente.numero.startswith("V"))
        self.assertEqual(self.vente.prepare_par, self.gestionnaire)

    def test_ajouter_ligne_calcule_montants(self):
        self._creer_vente_avec_ligne(quantite=3)
        self.vente.refresh_from_db()
        self.assertEqual(self.vente.nb_articles, 3)
        self.assertEqual(self.vente.montant_total, Decimal("1500.00"))
        ligne = self.vente.lignes.get()
        self.assertEqual(ligne.prix_unitaire, Decimal("500.00"))
        self.assertEqual(ligne.montant, Decimal("1500.00"))

    def test_ajouter_ligne_doublon_accumule(self):
        self._creer_vente_avec_ligne(quantite=3)
        self._creer_vente_avec_ligne(quantite=2)
        self.vente.refresh_from_db()
        self.assertEqual(self.vente.lignes.count(), 1)
        self.assertEqual(self.vente.nb_articles, 5)
        self.assertEqual(self.vente.montant_total, Decimal("2500.00"))

    def test_ajouter_ligne_stock_insuffisant(self):
        response = self.client.post(
            f"/api/ventes/{self.vente.id}/lignes/",
            {
                "medicament_id": str(self.medicament.id),
                "quantite": 101,
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Stock disponible insuffisant", response.data["detail"])

    def test_ajouter_ligne_medicament_sans_prix(self):
        medicament = Medicament.objects.create(
            structure=self.structure,
            nom="Médicament Gratuit",
            forme_pharmaceutique="SIROP",
            prix_vente=None,
        )
        StockItem.objects.create(
            structure=self.structure,
            nom=medicament.nom,
            type_item=StockItem.TYPE_MEDICAMENT,
            quantite=50,
        )
        response = self.client.post(
            f"/api/ventes/{self.vente.id}/lignes/",
            {
                "medicament_id": str(medicament.id),
                "quantite": 2,
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Prix de vente invalide", response.data["detail"])

    def test_modifier_ligne(self):
        self._creer_vente_avec_ligne(quantite=3)
        ligne = self.vente.lignes.get()
        response = self.client.patch(
            f"/api/ventes/{self.vente.id}/lignes/{ligne.id}/",
            {"quantite": 10},
        )
        self.assertEqual(response.status_code, 200)
        self.vente.refresh_from_db()
        self.assertEqual(self.vente.nb_articles, 10)
        self.assertEqual(self.vente.montant_total, Decimal("5000.00"))

    def test_supprimer_ligne(self):
        self._creer_vente_avec_ligne(quantite=3)
        ligne = self.vente.lignes.get()
        response = self.client.delete(
            f"/api/ventes/{self.vente.id}/lignes/{ligne.id}/supprimer/"
        )
        self.assertEqual(response.status_code, 200)
        self.vente.refresh_from_db()
        self.assertEqual(self.vente.lignes.count(), 0)
        self.assertEqual(self.vente.montant_total, Decimal("0"))

    def test_vente_preparation_recuperable(self):
        self._creer_vente_avec_ligne()
        response = self.client.get(
            "/api/ventes/preparation/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(self.vente.id))

    def test_proprietaire_ne_prepare_pas_une_vente(self):
        self._as_caissier(self.proprietaire)

        response_create = self.client.post(
            "/api/ventes/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response_create.status_code, 403)

        response_preparation = self.client.get(
            "/api/ventes/preparation/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response_preparation.status_code, 403)

    def test_proprietaire_ne_modifie_pas_une_vente(self):
        self._creer_vente_avec_ligne()
        ligne = self.vente.lignes.get()
        self._as_caissier(self.proprietaire)

        response_add = self.client.post(
            f"/api/ventes/{self.vente.id}/lignes/",
            {
                "medicament_id": str(self.medicament.id),
                "quantite": 1,
            },
        )
        self.assertEqual(response_add.status_code, 403)

        response_patch = self.client.patch(
            f"/api/ventes/{self.vente.id}/lignes/{ligne.id}/",
            {"quantite": 2},
        )
        self.assertEqual(response_patch.status_code, 403)

        response_delete = self.client.delete(
            f"/api/ventes/{self.vente.id}/lignes/{ligne.id}/supprimer/"
        )
        self.assertEqual(response_delete.status_code, 403)

        response_send = self.client.post(
            f"/api/ventes/{self.vente.id}/envoyer-caisse/"
        )
        self.assertEqual(response_send.status_code, 403)

    def test_recherche_medicaments_propose_uniquement_le_stock_vendable(self):
        sans_prix = Medicament.objects.create(
            structure=self.structure,
            nom="Produit sans prix",
            forme_pharmaceutique="SIROP",
            prix_vente=None,
        )
        StockItem.objects.create(
            structure=self.structure,
            nom=sans_prix.nom,
            type_item=StockItem.TYPE_MEDICAMENT,
            quantite=10,
        )

        rupture = Medicament.objects.create(
            structure=self.structure,
            nom="Produit rupture",
            forme_pharmaceutique="SIROP",
            prix_vente=Decimal("1000.00"),
        )
        StockItem.objects.create(
            structure=self.structure,
            nom=rupture.nom,
            type_item=StockItem.TYPE_MEDICAMENT,
            quantite=0,
        )

        reserve = Medicament.objects.create(
            structure=self.structure,
            nom="Produit reserve",
            forme_pharmaceutique="SIROP",
            prix_vente=Decimal("1000.00"),
            en_reserve=True,
        )
        StockItem.objects.create(
            structure=self.structure,
            nom=reserve.nom,
            type_item=StockItem.TYPE_MEDICAMENT,
            quantite=5,
            quantite_reservee=0,
        )

        totalement_reserve = Medicament.objects.create(
            structure=self.structure,
            nom="Produit totalement reserve",
            forme_pharmaceutique="SIROP",
            prix_vente=Decimal("1000.00"),
        )
        StockItem.objects.create(
            structure=self.structure,
            nom=totalement_reserve.nom,
            type_item=StockItem.TYPE_MEDICAMENT,
            quantite=5,
            quantite_reservee=5,
        )

        response = self.client.get(
            "/api/stocks/medicaments/",
            {
                "structure_id": str(self.structure.id),
                "search": "Produit",
                "vendable": "true",
            },
        )

        self.assertEqual(response.status_code, 200)
        noms = {item["nom"] for item in response.data}
        self.assertNotIn("Produit sans prix", noms)
        self.assertNotIn("Produit rupture", noms)
        self.assertNotIn("Produit reserve", noms)
        self.assertNotIn("Produit totalement reserve", noms)


# ---------------------------------------------------------------------------
# Transmission à la caisse — réservation
# ---------------------------------------------------------------------------


class TransmissionCaisseTests(VenteBaseTestCase):

    def test_envoyer_caisse_reserve_sans_toucher_stock_physique(self):
        response = self._envoyer_a_la_caisse()
        self.assertEqual(response.status_code, 200)

        self.item.refresh_from_db()
        self.assertEqual(self.item.quantite, 100)
        self.assertEqual(self.item.quantite_reservee, 5)

        self.vente.refresh_from_db()
        self.assertEqual(self.vente.etat, EtatVente.EN_ATTENTE_PAIEMENT)
        self.assertIsNotNone(self.vente.transmise_le)
        self.assertIsNotNone(self.vente.date_expiration)

    def test_envoyer_caisse_vente_vide_refusee(self):
        response = self.client.post(f"/api/ventes/{self.vente.id}/envoyer-caisse/")
        self.assertEqual(response.status_code, 400)
        self.assertIn("aucun médicament", response.data["detail"])

    def test_envoyer_caisse_verrouille_les_modifications(self):
        self._envoyer_a_la_caisse()
        ligne = self.vente.lignes.get()

        response_add = self.client.post(
            f"/api/ventes/{self.vente.id}/lignes/",
            {
                "medicament_id": str(self.medicament.id),
                "quantite": 2,
            },
        )
        self.assertEqual(response_add.status_code, 400)
        self.assertIn("transmise", response_add.data["detail"])

        response_patch = self.client.patch(
            f"/api/ventes/{self.vente.id}/lignes/{ligne.id}/",
            {"quantite": 1},
        )
        self.assertEqual(response_patch.status_code, 400)

    def test_envoyer_caisse_depassement_reservation_existante(self):
        self._creer_vente_avec_ligne(quantite=5)
        self.item.quantite_reservee = 97
        self.item.save(update_fields=["quantite_reservee"])
        response = self.client.post(f"/api/ventes/{self.vente.id}/envoyer-caisse/")
        self.assertEqual(response.status_code, 400)
        self.item.refresh_from_db()
        self.assertEqual(self.item.quantite_reservee, 97)
        self.vente.refresh_from_db()
        self.assertEqual(self.vente.etat, EtatVente.EN_PREPARATION)


# ---------------------------------------------------------------------------
# Caissier — encaissement
# ---------------------------------------------------------------------------


class EncaissementTests(VenteBaseTestCase):

    def test_caissier_voit_les_ventes_en_attente(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        response = self.client.get("/api/ventes/caisse/attente/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["structure"]["id"], str(self.structure.id))
        self.assertEqual(len(response.data["results"]), 1)

    def test_valider_paiement(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        response = self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/paiement/",
            {"mode": "ESPECES"},
        )
        self.assertEqual(response.status_code, 201)

        self.vente.refresh_from_db()
        self.assertEqual(self.vente.etat, EtatVente.PAYEE)
        self.assertIsNotNone(self.vente.validee_le)

        self.item.refresh_from_db()
        self.assertEqual(self.item.quantite, 95)
        self.assertEqual(self.item.quantite_reservee, 0)

        self.assertTrue(Paiement.objects.filter(vente=self.vente).exists())
        facture = Facture.objects.get(vente=self.vente)
        self.assertTrue(facture.numero.startswith("F"))
        self.assertEqual(facture.montant_total, Decimal("2500.00"))

        mouvement = StockMovement.objects.get(item=self.item)
        self.assertEqual(mouvement.type_mouvement, StockMovement.TYPE_SORTIE)
        self.assertEqual(mouvement.quantite, 5)
        self.assertIn(self.vente.numero, mouvement.motif)

    def test_valider_paiement_stock_zero_desactive_disponible(self):
        self.item.quantite = 5
        self.item.save(update_fields=["quantite"])
        self._envoyer_a_la_caisse()
        self._as_caissier()
        response = self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/paiement/",
            {"mode": "MOBILE_MONEY"},
        )
        self.assertEqual(response.status_code, 201)
        self.item.refresh_from_db()
        self.assertEqual(self.item.quantite, 0)
        self.assertFalse(self.item.disponible)

    def test_alerte_stock_faible_declenchee_apres_vente(self):
        from notifications.models import Notification

        self.item.quantite = 5
        self.item.seuil_alerte = 5
        self.item.save(update_fields=["quantite", "seuil_alerte"])
        self._envoyer_a_la_caisse()
        self._as_caissier()
        response = self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/paiement/",
            {"mode": "ESPECES"},
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            Notification.objects.filter(
                titre="Alerte stock faible",
                message__icontains=self.item.nom,
            ).exists()
        )

    def test_aucune_alerte_si_stock_au_dessus_du_seuil(self):
        from notifications.models import Notification

        self.item.quantite = 100
        self.item.seuil_alerte = 5
        self.item.save(update_fields=["quantite", "seuil_alerte"])
        self._envoyer_a_la_caisse()
        self._as_caissier()
        response = self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/paiement/",
            {"mode": "ESPECES"},
        )
        self.assertEqual(response.status_code, 201)
        self.assertFalse(
            Notification.objects.filter(
                titre="Alerte stock faible",
                message__icontains=self.item.nom,
            ).exists()
        )

    def test_paiement_impossible_sur_vente_non_transmise(self):
        self._creer_vente_avec_ligne()
        self._as_caissier()
        response = self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/paiement/",
            {"mode": "ESPECES"},
        )
        self.assertEqual(response.status_code, 400)

    def test_caissier_annule_et_libère_la_reservation(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        response = self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/annuler/",
            {"motif": "Client parti"},
        )
        self.assertEqual(response.status_code, 200)

        self.vente.refresh_from_db()
        self.assertEqual(self.vente.etat, EtatVente.ANNULEE)
        self.assertEqual(self.vente.motif_annulation, "Client parti")

        self.item.refresh_from_db()
        self.assertEqual(self.item.quantite, 100)
        self.assertEqual(self.item.quantite_reservee, 0)

        self.assertFalse(Facture.objects.filter(vente=self.vente).exists())

    def test_caissier_d_une_autre_structure_interdit(self):
        autre_structure = Structure.objects.create(
            nom="Autre Pharmacie",
            type=TypeStructure.PHARMACIE,
            statut=StatutStructure.ACTIVE,
        )
        EquipeStructure.objects.create(
            structure=autre_structure,
            utilisateur=self.caissier_autre,
            role=RoleEquipeStructure.CAISSIER,
            statut=StatutEquipeStructure.ACTIF,
        )
        self._envoyer_a_la_caisse()
        self._as_caissier(self.caissier_autre)
        response = self.client.get(f"/api/ventes/caisse/{self.vente.id}/")
        self.assertEqual(response.status_code, 403)


# ---------------------------------------------------------------------------
# Expiration automatique
# ---------------------------------------------------------------------------


class ExpirationTests(VenteBaseTestCase):

    def test_expiration_liberer_reservation_et_motif(self):
        self._envoyer_a_la_caisse()
        Vente.objects.filter(id=self.vente.id).update(
            date_expiration=timezone.now() - timedelta(minutes=1)
        )

        count = VenteService.expirer_ventes()
        self.assertEqual(count, 1)

        self.vente.refresh_from_db()
        self.assertEqual(self.vente.etat, EtatVente.EXPIREE)
        self.assertEqual(
            self.vente.motif_annulation,
            "Expiration du délai de paiement",
        )

        self.item.refresh_from_db()
        self.assertEqual(self.item.quantite, 100)
        self.assertEqual(self.item.quantite_reservee, 0)

        self.assertFalse(Facture.objects.filter(vente=self.vente).exists())

    def test_command_management_expire_les_ventes(self):
        self._envoyer_a_la_caisse()
        Vente.objects.filter(id=self.vente.id).update(
            date_expiration=timezone.now() - timedelta(minutes=5)
        )
        call_command("expirer_ventes")
        self.vente.refresh_from_db()
        self.assertEqual(self.vente.etat, EtatVente.EXPIREE)

    def test_expiration_deplace_la_vente_vers_le_filtre_expirees(self):
        self._envoyer_a_la_caisse()
        Vente.objects.filter(id=self.vente.id).update(
            date_expiration=timezone.now() - timedelta(minutes=5)
        )
        self._as_caissier()
        response = self.client.get("/api/ventes/caisse/attente/?statut=attente")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 0)

        response = self.client.get("/api/ventes/caisse/attente/?statut=expirees")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["etat"], EtatVente.EXPIREE)


# ---------------------------------------------------------------------------
# Permissions croisées et facturation
# ---------------------------------------------------------------------------


class PermissionsEtFacturationTests(VenteBaseTestCase):

    def test_gestionnaire_ne_peut_pas_encaisser(self):
        self._envoyer_a_la_caisse()
        response = self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/paiement/",
            {"mode": "ESPECES"},
        )
        self.assertEqual(response.status_code, 403)

    def test_caissier_ne_peut_pas_preparer(self):
        self._as_caissier()
        response = self.client.post(
            "/api/ventes/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 403)

    def test_caissier_ne_peut_pas_modifier_les_lignes(self):
        self._creer_vente_avec_ligne()
        ligne = self.vente.lignes.get()
        self._as_caissier()
        response = self.client.patch(
            f"/api/ventes/{self.vente.id}/lignes/{ligne.id}/",
            {"quantite": 2},
        )
        self.assertEqual(response.status_code, 403)

    def test_impression_et_reimpression_facture(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        response = self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/paiement/",
            {"mode": "CARTE"},
        )
        self.assertEqual(response.status_code, 201)
        self.vente.refresh_from_db()
        facture = self.vente.facture

        response = self.client.get(
            f"/api/ventes/caisse/{self.vente.id}/facture/"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["facture"]["numero"], facture.numero)

        response = self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/facture/imprimer/"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_impressions"], 1)

        response = self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/facture/imprimer/"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_impressions"], 2)
        self.assertEqual(ImpressionFacture.objects.count(), 2)

    def test_pas_de_facture_sans_paiement(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        response = self.client.get(
            f"/api/ventes/caisse/{self.vente.id}/facture/"
        )
        self.assertEqual(response.status_code, 404)

    def test_historique_et_statistiques(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/paiement/",
            {"mode": "ESPECES"},
        )
        self._as_caissier(self.gestionnaire)

        response = self.client.get(
            "/api/ventes/historique/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["etat"], EtatVente.PAYEE)

    def test_statistiques_financieres_reservees_au_proprietaire(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/paiement/",
            {"mode": "ESPECES"},
        )

        self._as_caissier(self.gestionnaire)
        response = self.client.get(
            "/api/ventes/statistiques/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 403)

        self._as_caissier(self.caissier)
        response = self.client.get(
            "/api/ventes/statistiques/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 403)

        self._as_caissier(self.proprietaire)
        response = self.client.get(
            "/api/ventes/statistiques/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["ventes_payees"], 1)
        self.assertEqual(response.data["ca_total"], 2500)
        self.assertEqual(response.data["retours_total"], 0)

    def test_proprietaire_consulte_la_caisse_en_lecture_seule(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/paiement/",
            {"mode": "ESPECES"},
        )
        self._as_caissier(self.proprietaire)

        response = self.client.get("/api/ventes/caisse/attente/")
        self.assertEqual(response.status_code, 400)

        params = {"structure_id": str(self.structure.id)}

        response = self.client.get("/api/ventes/caisse/attente/", params)
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/ventes/caisse/paiements/", params)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

        response = self.client.get("/api/ventes/caisse/retours/", params)
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/ventes/caisse/historique/", params)
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 1)

        response = self.client.get(f"/api/ventes/caisse/{self.vente.id}/facture/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["facture"]["numero"],
            Facture.objects.get(vente=self.vente).numero,
        )

    def test_proprietaire_ne_peut_pas_modifier_la_caisse(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/paiement/",
            {"mode": "ESPECES"},
        )
        self._as_caissier(self.proprietaire)

        response = self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/paiement/",
            {"mode": "ESPECES"},
        )
        self.assertEqual(response.status_code, 403)

        response = self.client.post(f"/api/ventes/caisse/{self.vente.id}/ouvrir/")
        self.assertEqual(response.status_code, 403)

        response = self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/annuler/",
            {"motif": "test"},
        )
        self.assertEqual(response.status_code, 403)

        ligne = self.vente.lignes.first()
        response = self.client.post(
            "/api/ventes/caisse/retours/",
            {
                "vente_id": str(self.vente.id),
                "motif": "PRODUIT_RETIRE",
                "items": [{"ligne_id": str(ligne.id), "quantite": 1}],
            },
        )
        self.assertEqual(response.status_code, 403)


# ---------------------------------------------------------------------------
# Ouverture de la vente par le caissier — état « En cours »
# ---------------------------------------------------------------------------


class OuvertureCaisseTests(VenteBaseTestCase):

    def test_ouvrir_vente_passe_en_cours_et_journalise(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        response = self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/ouvrir/"
        )
        self.assertEqual(response.status_code, 200)
        self.vente.refresh_from_db()
        self.assertEqual(self.vente.etat, EtatVente.EN_COURS)
        self.assertTrue(
            OperationCaisse.objects.filter(
                vente=self.vente,
                action=ActionCaisse.OUVERTURE,
                utilisateur=self.caissier,
            ).exists()
        )

    def test_ouvrir_vente_non_transmise_refusee(self):
        self._creer_vente_avec_ligne()
        self._as_caissier()
        response = self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/ouvrir/"
        )
        self.assertEqual(response.status_code, 400)

    def test_valider_paiement_apres_ouverture(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        self.client.post(f"/api/ventes/caisse/{self.vente.id}/ouvrir/")
        response = self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/paiement/",
            {"mode": "ESPECES"},
        )
        self.assertEqual(response.status_code, 201)
        self.vente.refresh_from_db()
        self.assertEqual(self.vente.etat, EtatVente.PAYEE)

    def test_annuler_vente_en_cours_libere_reservation(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        self.client.post(f"/api/ventes/caisse/{self.vente.id}/ouvrir/")
        response = self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/annuler/",
            {"motif": "Client sans argent"},
        )
        self.assertEqual(response.status_code, 200)
        self.vente.refresh_from_db()
        self.assertEqual(self.vente.etat, EtatVente.ANNULEE)
        self.item.refresh_from_db()
        self.assertEqual(self.item.quantite_reservee, 0)

    def test_vente_en_cours_expire_aussi(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        self.client.post(f"/api/ventes/caisse/{self.vente.id}/ouvrir/")
        Vente.objects.filter(id=self.vente.id).update(
            date_expiration=timezone.now() - timedelta(minutes=1)
        )
        VenteService.expirer_ventes()
        self.vente.refresh_from_db()
        self.assertEqual(self.vente.etat, EtatVente.EXPIREE)
        self.assertEqual(
            self.vente.motif_annulation,
            "Expiration du délai de paiement",
        )


# ---------------------------------------------------------------------------
# Liste d'attente : filtres et recherche intelligente
# ---------------------------------------------------------------------------


class AttenteFiltresRechercheTests(VenteBaseTestCase):

    def test_filtre_attente_contient_les_ventes_a_encaisser(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        response = self.client.get("/api/ventes/caisse/attente/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(
            response.data["results"][0]["etat"],
            EtatVente.EN_ATTENTE_PAIEMENT,
        )

    def test_filtre_en_cours(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        self.client.post(f"/api/ventes/caisse/{self.vente.id}/ouvrir/")
        response = self.client.get("/api/ventes/caisse/attente/?statut=cours")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["etat"], EtatVente.EN_COURS)

        response = self.client.get("/api/ventes/caisse/attente/?statut=attente")
        self.assertEqual(len(response.data["results"]), 0)

    def test_filtre_expirees(self):
        self._envoyer_a_la_caisse()
        Vente.objects.filter(id=self.vente.id).update(
            date_expiration=timezone.now() - timedelta(minutes=5)
        )
        self._as_caissier()
        response = self.client.get("/api/ventes/caisse/attente/?statut=expirees")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["etat"], EtatVente.EXPIREE)

    def test_recherche_par_numero_vente(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        response = self.client.get(
            "/api/ventes/caisse/attente/",
            {"recherche": self.vente.numero},
        )
        self.assertEqual(len(response.data["results"]), 1)

        response = self.client.get(
            "/api/ventes/caisse/attente/",
            {"recherche": "ZZZZ-INTROUVABLE"},
        )
        self.assertEqual(len(response.data["results"]), 0)

    def test_recherche_par_client_et_telephone(self):
        self._envoyer_a_la_caisse()
        self.vente.nom_client = "Kouassi Jean"
        self.vente.telephone_client = "0708091011"
        self.vente.save(update_fields=["nom_client", "telephone_client"])
        self._as_caissier()

        response = self.client.get(
            "/api/ventes/caisse/attente/",
            {"recherche": "Kouassi"},
        )
        self.assertEqual(len(response.data["results"]), 1)

        response = self.client.get(
            "/api/ventes/caisse/attente/",
            {"recherche": "0708091011"},
        )
        self.assertEqual(len(response.data["results"]), 1)

    def test_liste_attente_ne_montre_ni_payees_ni_annulees(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/paiement/",
            {"mode": "ESPECES"},
        )
        response = self.client.get("/api/ventes/caisse/attente/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 0)

        response = self.client.get("/api/ventes/caisse/paiements/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["etat"], EtatVente.PAYEE)

    def test_recherche_par_numero_facture_dans_paiements(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/paiement/",
            {"mode": "ESPECES"},
        )
        facture = Facture.objects.get(vente=self.vente)
        response = self.client.get(
            "/api/ventes/caisse/paiements/",
            {"recherche": facture.numero},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)


# ---------------------------------------------------------------------------
# Retours en caisse
# ---------------------------------------------------------------------------


class RetourCaisseTests(VenteBaseTestCase):

    def _vente_payee(self, quantite=5):
        self._creer_vente_avec_ligne(quantite=quantite)
        response = self.client.post(f"/api/ventes/{self.vente.id}/envoyer-caisse/")
        self.assertEqual(response.status_code, 200)
        self._as_caissier()
        response = self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/paiement/",
            {"mode": "ESPECES"},
        )
        self.assertEqual(response.status_code, 201)
        self.vente.refresh_from_db()
        return self.vente.lignes.get()

    def test_retour_reintegre_le_stock_et_reste_lie_a_la_facture(self):
        ligne = self._vente_payee(quantite=5)
        self.item.refresh_from_db()
        self.assertEqual(self.item.quantite, 95)

        response = self.client.post(
            "/api/ventes/caisse/retours/",
            {
                "vente_id": str(self.vente.id),
                "motif": MotifRetour.PRODUIT_RETIRE,
                "items": [{"ligne_id": str(ligne.id), "quantite": 2}],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)

        retour = RetourCaisse.objects.get(vente=self.vente)
        self.assertTrue(retour.numero.startswith("R"))
        self.assertEqual(retour.motif, MotifRetour.PRODUIT_RETIRE)
        self.assertEqual(retour.nb_articles, 2)
        self.assertEqual(retour.montant_total, Decimal("1000.00"))

        # La facture d'origine est conservée et liée au retour.
        facture = Facture.objects.get(vente=self.vente)
        self.assertEqual(retour.vente, self.vente)
        self.assertTrue(facture)

        self.item.refresh_from_db()
        self.assertEqual(self.item.quantite, 97)
        self.assertEqual(self.item.quantite_reservee, 0)

        mouvement = StockMovement.objects.get(
            item=self.item,
            type_mouvement=StockMovement.TYPE_ENTREE,
        )
        self.assertIn(retour.numero, mouvement.motif)

    def test_retour_motif_obligatoire(self):
        ligne = self._vente_payee()
        response = self.client.post(
            "/api/ventes/caisse/retours/",
            {
                "vente_id": str(self.vente.id),
                "items": [{"ligne_id": str(ligne.id), "quantite": 1}],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_retour_motif_autre_impose_commentaire(self):
        ligne = self._vente_payee()
        response = self.client.post(
            "/api/ventes/caisse/retours/",
            {
                "vente_id": str(self.vente.id),
                "motif": MotifRetour.AUTRE,
                "items": [{"ligne_id": str(ligne.id), "quantite": 1}],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("commentaire", response.data["detail"])

        response = self.client.post(
            "/api/ventes/caisse/retours/",
            {
                "vente_id": str(self.vente.id),
                "motif": MotifRetour.AUTRE,
                "commentaire": "Client mécontent du produit.",
                "items": [{"ligne_id": str(ligne.id), "quantite": 1}],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)

    def test_retour_quantite_depassant_la_vente_refusee(self):
        ligne = self._vente_payee(quantite=3)
        response = self.client.post(
            "/api/ventes/caisse/retours/",
            {
                "vente_id": str(self.vente.id),
                "motif": MotifRetour.ERREUR_QUANTITE,
                "items": [{"ligne_id": str(ligne.id), "quantite": 4}],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("dépasse", response.data["detail"])

    def test_retour_sans_items_refuse(self):
        self._vente_payee()
        response = self.client.post(
            "/api/ventes/caisse/retours/",
            {
                "vente_id": str(self.vente.id),
                "motif": MotifRetour.RETOUR_ACCEPTE,
                "items": [],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_retour_impossible_sur_vente_non_payee(self):
        self._envoyer_a_la_caisse()
        ligne = self.vente.lignes.get()
        self._as_caissier()
        response = self.client.post(
            "/api/ventes/caisse/retours/",
            {
                "vente_id": str(self.vente.id),
                "motif": MotifRetour.PRODUIT_RETIRE,
                "items": [{"ligne_id": str(ligne.id), "quantite": 1}],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_gestionnaire_ne_peut_pas_creer_un_retour(self):
        ligne = self._vente_payee()
        self._as_caissier(self.gestionnaire)
        response = self.client.post(
            "/api/ventes/caisse/retours/",
            {
                "vente_id": str(self.vente.id),
                "motif": MotifRetour.RETOUR_ACCEPTE,
                "items": [{"ligne_id": str(ligne.id), "quantite": 1}],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_liste_des_retours_en_caisse(self):
        ligne = self._vente_payee()
        self.client.post(
            "/api/ventes/caisse/retours/",
            {
                "vente_id": str(self.vente.id),
                "motif": MotifRetour.PRODUIT_RETIRE,
                "items": [{"ligne_id": str(ligne.id), "quantite": 1}],
            },
            format="json",
        )
        response = self.client.get("/api/ventes/caisse/retours/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["facture_numero"],
            self.vente.facture.numero,
        )


# ---------------------------------------------------------------------------
# Reçu PDF et journal d'audit
# ---------------------------------------------------------------------------


class ReceptionPDFTests(VenteBaseTestCase):

    def test_reception_pdf_telechargeable(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/paiement/",
            {"mode": "ESPECES"},
        )
        response = self.client.get(
            f"/api/ventes/caisse/{self.vente.id}/reception/pdf/"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/pdf")

        vente = Vente.objects.get(pk=self.vente.pk)
        contenu = generer_reçu_pdf(vente)
        self.assertTrue(contenu.startswith(b"%PDF"))
        self.assertIn(b"/Type /Catalog", contenu)

    def test_reception_pdf_impossible_sans_facture(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        response = self.client.get(
            f"/api/ventes/caisse/{self.vente.id}/reception/pdf/"
        )
        self.assertEqual(response.status_code, 404)

    def test_mode_cheque_accepte(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        response = self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/paiement/",
            {"mode": "CHEQUE"},
        )
        self.assertEqual(response.status_code, 201)


class JournalCaisseTests(VenteBaseTestCase):

    def _parcourir_cycle_complet(self):
        """Exécute le cycle complet et retourne la vente payée."""
        self._creer_vente_avec_ligne()
        self.client.post(f"/api/ventes/{self.vente.id}/envoyer-caisse/")
        self._as_caissier()
        self.client.post(f"/api/ventes/caisse/{self.vente.id}/ouvrir/")
        self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/paiement/",
            {"mode": "ESPECES"},
        )
        return self.vente.lignes.get()

    def test_cycle_complet_journalise_chaque_operation(self):
        ligne = self._parcourir_cycle_complet()
        self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/facture/imprimer/"
        )
        self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/facture/imprimer/"
        )
        self.client.post(
            "/api/ventes/caisse/retours/",
            {
                "vente_id": str(self.vente.id),
                "motif": MotifRetour.ERREUR_QUANTITE,
                "items": [{"ligne_id": str(ligne.id), "quantite": 1}],
            },
            format="json",
        )

        actions = list(
            OperationCaisse.objects.filter(
                structure=self.structure
            ).values_list("action", flat=True)
        )
        for action in [
            ActionCaisse.CREATION,
            ActionCaisse.TRANSMISSION,
            ActionCaisse.OUVERTURE,
            ActionCaisse.VALIDATION,
            ActionCaisse.IMPRESSION,
            ActionCaisse.REIMPRESSION,
            ActionCaisse.RETOUR_CAISSE,
        ]:
            self.assertIn(action, actions)

        operations = OperationCaisse.objects.filter(
            structure=self.structure
        ).order_by("cree_le")
        for op in operations:
            self.assertTrue(op.utilisateur)
            self.assertTrue(op.role)
            self.assertEqual(op.resultat, "SUCCES")

    def test_annulation_caissier_journalisee(self):
        self._envoyer_a_la_caisse()
        self._as_caissier()
        self.client.post(
            f"/api/ventes/caisse/{self.vente.id}/annuler/",
            {"motif": "Client sans argent"},
        )
        self.assertTrue(
            OperationCaisse.objects.filter(
                vente=self.vente,
                action=ActionCaisse.ANNULATION,
                utilisateur=self.caissier,
            ).exists()
        )

    def test_historique_caissier_liste_le_journal(self):
        self._parcourir_cycle_complet()
        response = self.client.get("/api/ventes/caisse/historique/")
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 4)
        self.assertIn("utilisateur_nom", response.data[0])
        self.assertIn("action_label", response.data[0])

    def test_gestionnaire_interdit_sur_le_journal_caissier(self):
        self._as_caissier(self.gestionnaire)
        response = self.client.get("/api/ventes/caisse/historique/")
        self.assertEqual(response.status_code, 403)
