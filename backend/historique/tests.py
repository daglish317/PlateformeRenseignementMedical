from datetime import date, timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from stock.models import Medicament, StockItem
from structures.models import (
    EquipeStructure,
    RoleEquipeStructure,
    StatutEquipeStructure,
    StatutStructure,
    Structure,
    TypeStructure,
)
from utilisateurs.models import RoleUtilisateur, TypeAuthentification, Utilisateur

from inventaires.models import Inventaire
from ventes.models import EtatVente, MotifRetour, RetourCaisse, Vente

from .exports import generer_historique_excel, generer_historique_pdf
from .models import EvenementHistorique, TypeEvenementHistorique


class HistoriqueBaseTestCase(TestCase):

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
            email="gestionnaire-historique@test.com",
            password="password123",
            nom="Paul N",
            role=RoleUtilisateur.GESTIONNAIRE,
            type_authentification=TypeAuthentification.EMAIL,
            email_verifie=True,
        )
        EquipeStructure.objects.create(
            structure=self.structure,
            utilisateur=self.gestionnaire,
            role=RoleEquipeStructure.GESTIONNAIRE,
            statut=StatutEquipeStructure.ACTIF,
        )

        self.proprietaire = Utilisateur.objects.create_user(
            email="proprietaire-historique@test.com",
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

        self.caissier = Utilisateur.objects.create_user(
            email="caissier-historique@test.com",
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

        self.client.force_authenticate(user=self.gestionnaire)

    def payload_approvisionnement(self):
        return {
            "structure_id": str(self.structure.id),
            "date_reception": "2026-08-07",
            "fournisseur": "Grossiste Test",
            "reference_bon": "BL-001",
            "lignes": [
                {
                    "nom": "Paracetamol 500mg",
                    "forme_pharmaceutique": "COMPRIME",
                    "quantite": 20,
                    "prix_achat": "100.00",
                    "prix_vente": "250.00",
                    "date_peremption": "2027-08-07",
                }
            ],
        }

    def _creer_appro(self):
        return self.client.post(
            "/api/stocks/approvisionnements/",
            self.payload_approvisionnement(),
            format="json",
        )

    def _creer_inventaire(self):
        Medicament.objects.get_or_create(
            structure=self.structure,
            nom="Paracetamol 500mg",
            defaults={
                "forme_pharmaceutique": "COMPRIME",
                "prix_vente": 250.00,
            },
        )
        StockItem.objects.get_or_create(
            structure=self.structure,
            nom="Paracetamol 500mg",
            type_item=StockItem.TYPE_MEDICAMENT,
            defaults={
                "quantite": 20,
                "seuil_alerte": 5,
            },
        )
        return self.client.post(
            "/api/inventaires/generer/",
            {"structure_id": str(self.structure.id)},
            format="json",
        )

    def _cycle_vente_payee(self):
        self.client.force_authenticate(user=self.gestionnaire)
        response = self.client.post(
            "/api/ventes/",
            {"structure_id": str(self.structure.id)},
        )
        vente = Vente.objects.get(id=response.data["id"])
        Medicament.objects.get_or_create(
            structure=self.structure,
            nom="Paracetamol 500mg",
            defaults={
                "forme_pharmaceutique": "COMPRIME",
                "prix_vente": 250.00,
            },
        )
        StockItem.objects.get_or_create(
            structure=self.structure,
            nom="Paracetamol 500mg",
            type_item=StockItem.TYPE_MEDICAMENT,
            defaults={
                "quantite": 100,
            },
        )
        self.client.post(
            f"/api/ventes/{vente.id}/lignes/",
            {
                "medicament_id": str(
                    Medicament.objects.get(structure=self.structure).id
                ),
                "quantite": 2,
            },
        )
        self.client.post(f"/api/ventes/{vente.id}/envoyer-caisse/")

        self.client.force_authenticate(user=self.caissier)
        self.client.post(f"/api/ventes/caisse/{vente.id}/ouvrir/")
        self.client.post(
            f"/api/ventes/caisse/{vente.id}/paiement/",
            {"mode": "ESPECES"},
        )

        ligne = vente.lignes.get()
        response = self.client.post(
            "/api/ventes/caisse/retours/",
            {
                "vente_id": str(vente.id),
                "motif": MotifRetour.ERREUR_QUANTITE,
                "items": [{"ligne_id": str(ligne.id), "quantite": 1}],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        return vente, RetourCaisse.objects.get(vente=vente)


class HistoriqueEnregistrementTests(HistoriqueBaseTestCase):

    def test_creation_approvisionnement_enregistre_evenement(self):
        response = self._creer_appro()
        self.assertEqual(response.status_code, 201)

        evenement = EvenementHistorique.objects.get(
            type=TypeEvenementHistorique.APPROVISIONNEMENT_CREE,
        )
        self.assertEqual(evenement.structure, self.structure)
        self.assertEqual(evenement.utilisateur, self.gestionnaire)
        self.assertEqual(evenement.role, RoleUtilisateur.GESTIONNAIRE)
        self.assertEqual(evenement.donnees["nb_produits"], 1)
        self.assertEqual(evenement.donnees["fournisseur"], "Grossiste Test")
        self.assertEqual(
            evenement.donnees["medicaments"][0]["nom"],
            "Paracetamol 500mg",
        )
        self.assertTrue(evenement.donnees["numero"].startswith("AP"))

    def test_generation_inventaire_enregistre_evenement(self):
        response = self._creer_inventaire()
        self.assertEqual(response.status_code, 201)

        evenement = EvenementHistorique.objects.get(
            type=TypeEvenementHistorique.INVENTAIRE_GENERE,
        )
        self.assertEqual(evenement.utilisateur, self.gestionnaire)
        self.assertEqual(evenement.donnees["numero"], Inventaire.objects.get().numero)
        self.assertEqual(evenement.donnees["nb_produits"], 1)
        self.assertEqual(evenement.donnees["nb_disponibles"], 1)

    def test_retour_caisse_enregistre_evenement(self):
        vente, retour = self._cycle_vente_payee()

        evenement = EvenementHistorique.objects.get(
            type=TypeEvenementHistorique.CAISSE_RETOUR,
        )
        self.assertEqual(evenement.structure, self.structure)
        self.assertEqual(evenement.utilisateur, self.caissier)
        self.assertEqual(evenement.role, RoleUtilisateur.CAISSIER)
        self.assertEqual(evenement.donnees["numero_retour"], retour.numero)
        self.assertEqual(evenement.donnees["numero_vente"], vente.numero)
        self.assertEqual(
            evenement.donnees["numero_facture"],
            vente.facture.numero,
        )
        self.assertEqual(evenement.donnees["nb_articles"], 1)
        self.assertEqual(
            evenement.donnees["medicaments"][0]["nom"],
            "Paracetamol 500mg",
        )

    def test_evenement_immuable_pas_de_mise_a_jour_ni_suppression(self):
        self._creer_appro()
        evenement = EvenementHistorique.objects.get()

        self.client.force_authenticate(user=self.proprietaire)
        patch = self.client.patch(
            f"/api/historique/{evenement.id}/",
            {"type": "CAISSE_RETOUR"},
            format="json",
        )
        self.assertIn(patch.status_code, (405, 404))

        delete = self.client.delete(f"/api/historique/{evenement.id}/")
        self.assertIn(delete.status_code, (405, 404))

        self.assertEqual(EvenementHistorique.objects.count(), 1)
        evenement.refresh_from_db()
        self.assertEqual(
            evenement.type,
            TypeEvenementHistorique.APPROVISIONNEMENT_CREE,
        )

    def test_approvisionnement_numero_unique_et_successif(self):
        self._creer_appro()
        self._creer_appro()
        numeros = list(
            EvenementHistorique.objects.filter(
                type=TypeEvenementHistorique.APPROVISIONNEMENT_CREE,
            ).values_list("donnees__numero", flat=True)
        )
        self.assertEqual(len(set(numeros)), 2)


class HistoriqueConsultationTests(HistoriqueBaseTestCase):

    def setUp(self):
        super().setUp()
        self._creer_appro()
        self._creer_inventaire()
        self._cycle_vente_payee()
        self.client.force_authenticate(user=self.gestionnaire)

    def test_gestionnaire_consulte_historique_chronologique(self):
        response = self.client.get(
            "/api/historique/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 200)
        types = [e["type"] for e in response.data]
        self.assertEqual(
            set(types),
            {
                TypeEvenementHistorique.APPROVISIONNEMENT_CREE,
                TypeEvenementHistorique.INVENTAIRE_GENERE,
                TypeEvenementHistorique.CAISSE_RETOUR,
            },
        )
        dates = [e["cree_le"] for e in response.data]
        self.assertEqual(dates, sorted(dates, reverse=True))

    def test_caissier_n_a_aucun_acces(self):
        self.client.force_authenticate(user=self.caissier)
        response = self.client.get(
            "/api/historique/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 403)

    def test_non_authentifie_refuse(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(
            "/api/historique/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 401)

    def test_proprietaire_consulte(self):
        self.client.force_authenticate(user=self.proprietaire)
        response = self.client.get(
            "/api/historique/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)

    def test_structure_id_requis(self):
        response = self.client.get("/api/historique/")
        self.assertEqual(response.status_code, 400)

    def test_detail_evenement(self):
        evenement = EvenementHistorique.objects.get(
            type=TypeEvenementHistorique.CAISSE_RETOUR,
        )
        response = self.client.get(f"/api/historique/{evenement.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(evenement.id))
        self.assertIn("numero_facture", response.data["donnees"])

    def test_detail_introuvable(self):
        response = self.client.get("/api/historique/00000000-0000-0000-0000-000000000000/")
        self.assertEqual(response.status_code, 404)


class HistoriqueRechercheTests(HistoriqueBaseTestCase):

    def setUp(self):
        super().setUp()
        self._creer_appro()
        self._creer_inventaire()
        self.vente, self.retour = self._cycle_vente_payee()
        self.client.force_authenticate(user=self.gestionnaire)

    def _recherche(self, recherche):
        return self.client.get(
            "/api/historique/",
            {"structure_id": str(self.structure.id), "recherche": recherche},
        )

    def test_recherche_par_type(self):
        response = self._recherche("Retour caisse")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["type"], TypeEvenementHistorique.CAISSE_RETOUR)

    def test_recherche_par_nom_medicament(self):
        response = self._recherche("Paracetamol")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_recherche_par_numero_approvisionnement(self):
        numero = EvenementHistorique.objects.get(
            type=TypeEvenementHistorique.APPROVISIONNEMENT_CREE,
        ).donnees["numero"]
        response = self._recherche(numero)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_recherche_par_numero_facture(self):
        response = self._recherche(self.vente.facture.numero)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["type"], TypeEvenementHistorique.CAISSE_RETOUR)

    def test_recherche_par_nom_utilisateur(self):
        response = self._recherche("Paul N")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) >= 2)

    def test_recherche_sans_resultat(self):
        response = self._recherche("introuvable-xyz")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])


class HistoriqueFiltresTests(HistoriqueBaseTestCase):

    def test_filtre_periode_aujourdhui(self):
        self._creer_appro()
        evenement = EvenementHistorique.objects.get()
        EvenementHistorique.objects.filter(pk=evenement.pk).update(
            cree_le=timezone.now() - timedelta(days=2),
        )
        self._creer_inventaire()

        response = self.client.get(
            "/api/historique/",
            {
                "structure_id": str(self.structure.id),
                "periode": "aujourdhui",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["type"], TypeEvenementHistorique.INVENTAIRE_GENERE)

    def test_filtre_type(self):
        self._creer_appro()
        self._creer_inventaire()
        response = self.client.get(
            "/api/historique/",
            {
                "structure_id": str(self.structure.id),
                "type": TypeEvenementHistorique.INVENTAIRE_GENERE,
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["type"], TypeEvenementHistorique.INVENTAIRE_GENERE)

    def test_filtre_periode_personnalisee(self):
        self._creer_appro()
        evenement = EvenementHistorique.objects.get()
        passe = timezone.now() - timedelta(days=10)
        EvenementHistorique.objects.filter(pk=evenement.pk).update(cree_le=passe)

        response = self.client.get(
            "/api/historique/",
            {
                "structure_id": str(self.structure.id),
                "periode": "personnalisee",
                "date_debut": (timezone.localdate() - timedelta(days=5)).isoformat(),
                "date_fin": timezone.localdate().isoformat(),
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    def test_periode_invalide(self):
        self._creer_appro()
        response = self.client.get(
            "/api/historique/",
            {
                "structure_id": str(self.structure.id),
                "periode": "personnalisee",
                "date_debut": "date-invalide",
            },
        )
        self.assertEqual(response.status_code, 400)


class HistoriqueResumeTests(HistoriqueBaseTestCase):

    def test_resume_indicateurs(self):
        self._creer_appro()
        self._creer_inventaire()
        self._cycle_vente_payee()
        self.client.force_authenticate(user=self.gestionnaire)

        response = self.client.get(
            "/api/historique/resume/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["approvisionnements"], 1)
        self.assertEqual(response.data["inventaires_generes"], 1)
        self.assertEqual(response.data["retours_caisse"], 1)
        self.assertEqual(response.data["evenements_aujourdhui"], 3)


class HistoriqueExportTests(HistoriqueBaseTestCase):

    def test_gestionnaire_ne_peut_pas_exporter(self):
        self._creer_appro()
        response = self.client.get(
            "/api/historique/exporter/pdf/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 403)
        response = self.client.get(
            "/api/historique/exporter/excel/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 403)

    def test_proprietaire_exporte_pdf(self):
        self._creer_appro()
        self._creer_inventaire()
        self.client.force_authenticate(user=self.proprietaire)
        response = self.client.get(
            "/api/historique/exporter/pdf/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/pdf")
        evenements = EvenementHistorique.objects.filter(structure=self.structure)
        contenu = generer_historique_pdf(self.structure, evenements)
        self.assertTrue(contenu.startswith(b"%PDF"))

    def test_proprietaire_exporte_excel(self):
        self._creer_appro()
        self._creer_inventaire()
        self.client.force_authenticate(user=self.proprietaire)
        response = self.client.get(
            "/api/historique/exporter/excel/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn(
            "spreadsheetml",
            response["Content-Type"],
        )
        evenements = EvenementHistorique.objects.filter(structure=self.structure)
        contenu = generer_historique_excel(self.structure, evenements)
        self.assertTrue(contenu.startswith(b"PK"))

    def test_proprietaire_autre_structure_interdit(self):
        self._creer_appro()
        autre = Structure.objects.create(
            nom="Autre Pharmacie",
            type=TypeStructure.PHARMACIE,
            statut=StatutStructure.ACTIVE,
            adresse="Yopougon",
            telephone="0998877665",
        )
        EquipeStructure.objects.create(
            structure=autre,
            utilisateur=self.proprietaire,
            role=RoleEquipeStructure.GESTIONNAIRE,
            statut=StatutEquipeStructure.ACTIF,
        )
        self.client.force_authenticate(user=self.proprietaire)
        response = self.client.get(
            "/api/historique/exporter/pdf/",
            {"structure_id": str(autre.id)},
        )
        self.assertEqual(response.status_code, 403)
