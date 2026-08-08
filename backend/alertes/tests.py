from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from stock.models import StockItem
from structures.models import (
    EquipeStructure,
    RoleEquipeStructure,
    StatutEquipeStructure,
    StatutStructure,
    Structure,
    TypeStructure,
)
from utilisateurs.models import RoleUtilisateur, TypeAuthentification, Utilisateur

from ventes.models import EtatVente, RetourCaisse, Vente

from .exports import generer_alertes_excel, generer_alertes_pdf
from .models import Alerte, CategorieAlerte, ModuleAlerte, PrioriteAlerte, TypeAlerte
from .services import AlertesService


class AlertesBaseTestCase(TestCase):

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
            email="gestionnaire-alertes@test.com",
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
            email="proprietaire-alertes@test.com",
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
            email="caissier-alertes@test.com",
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

    # ------------------------------------------------------------------
    # Utilitaires de création
    # ------------------------------------------------------------------

    def _item(self, nom="Paracetamol 500mg", quantite=0, seuil=5, reservee=0):
        item, _ = StockItem.objects.get_or_create(
            structure=self.structure,
            nom=nom,
            type_item=StockItem.TYPE_MEDICAMENT,
            defaults={
                "quantite": quantite,
                "seuil_alerte": seuil,
            },
        )
        item.quantite = quantite
        item.quantite_reservee = reservee
        item.seuil_alerte = seuil
        item.save()
        return item

    def _vente(self, numero="V-1"):
        return Vente.objects.create(
            structure=self.structure,
            numero=numero,
            prepare_par=self.gestionnaire,
        )

    def _retour(self, vente, numero="R-1", par=None, quantite=1):
        return RetourCaisse.objects.create(
            structure=self.structure,
            vente=vente,
            numero=numero,
            motif="ERREUR_QUANTITE",
            effectue_par=par or self.caissier,
            montant_total=1000,
            nb_articles=quantite,
        )

    def _vente_annulee(self, numero="A-1", par=None):
        return Vente.objects.create(
            structure=self.structure,
            numero=numero,
            prepare_par=self.gestionnaire,
            etat=EtatVente.ANNULEE,
            annulee_le=timezone.now(),
            annulee_par=par or self.gestionnaire,
            motif_annulation="Test",
        )

    def _creer_rupture(self):
        item = self._item(quantite=0)
        AlertesService.analyser_item(item)
        return item

    def _creer_stock_faible(self):
        item = self._item(nom="Vitamine C 1000mg", quantite=8, seuil=10)
        AlertesService.analyser_item(item)
        return item

    def _creer_retours_anormaux(self):
        for i in range(5):
            self._retour(self._vente(f"VR-{i}"), numero=f"RR-{i}")
        AlertesService.analyser_supervision(self.structure)


class AlerteServicesTests(AlertesBaseTestCase):

    def test_rupture_de_stock_creee(self):
        item = self._item(quantite=0)
        AlertesService.analyser_item(item)

        alerte = Alerte.objects.get(type=TypeAlerte.RUPTURE_STOCK)
        self.assertEqual(alerte.structure, self.structure)
        self.assertEqual(alerte.categorie, CategorieAlerte.OPERATIONNELLE)
        self.assertEqual(alerte.priorite, PrioriteAlerte.CRITIQUE)
        self.assertEqual(alerte.module, ModuleAlerte.APPROVISIONNEMENT)
        self.assertEqual(alerte.donnees["medicament_nom"], item.nom)
        self.assertEqual(alerte.donnees["stock_disponible"], 0)
        self.assertFalse(alerte.est_resolue)
        self.assertIn("rupture", alerte.texte_recherche)
        self.assertIn("paracetamol", alerte.texte_recherche)

    def test_stock_faible_creee(self):
        item = self._item(quantite=8, seuil=10)
        AlertesService.analyser_item(item)

        alerte = Alerte.objects.get(type=TypeAlerte.STOCK_FAIBLE)
        self.assertEqual(alerte.categorie, CategorieAlerte.OPERATIONNELLE)
        self.assertEqual(alerte.priorite, PrioriteAlerte.MOYENNE)
        self.assertEqual(alerte.module, ModuleAlerte.APPROVISIONNEMENT)
        self.assertEqual(alerte.donnees["stock_disponible"], 8)
        self.assertEqual(alerte.donnees["seuil_alerte"], 10)

    def test_pas_d_alerte_quand_stock_suffisant(self):
        self._item(quantite=100, seuil=5)
        AlertesService.analyser_stock(self.structure)
        self.assertEqual(Alerte.objects.count(), 0)

    def test_pas_de_doublon(self):
        item = self._item(quantite=0)
        AlertesService.analyser_item(item)
        AlertesService.analyser_item(item)
        self.assertEqual(
            Alerte.objects.filter(type=TypeAlerte.RUPTURE_STOCK).count(),
            1,
        )

    def test_resolution_quand_stock_reconstitue(self):
        item = self._creer_rupture()
        item.quantite = 20
        item.save()
        AlertesService.analyser_item(item)

        alerte = Alerte.objects.get(type=TypeAlerte.RUPTURE_STOCK)
        self.assertTrue(alerte.est_resolue)

    def test_rupture_supersede_stock_faible(self):
        item = self._creer_stock_faible()
        item.quantite = 0
        item.save()
        AlertesService.analyser_item(item)

        self.assertTrue(
            Alerte.objects.get(type=TypeAlerte.STOCK_FAIBLE).est_resolue
        )
        alerte = Alerte.objects.get(type=TypeAlerte.RUPTURE_STOCK)
        self.assertFalse(alerte.est_resolue)

    def test_resolution_du_stock_faible_puis_rupture_retablie(self):
        item = self._creer_rupture()
        item.seuil_alerte = 10
        item.quantite = 8
        item.save()
        AlertesService.analyser_item(item)

        self.assertTrue(
            Alerte.objects.get(type=TypeAlerte.RUPTURE_STOCK).est_resolue
        )
        self.assertFalse(
            Alerte.objects.get(type=TypeAlerte.STOCK_FAIBLE).est_resolue
        )

    def test_retours_caisse_anormaux(self):
        self._creer_retours_anormaux()

        alerte = Alerte.objects.get(
            type=TypeAlerte.RETOURS_CAISSE_ANORMAUX,
        )
        self.assertEqual(alerte.categorie, CategorieAlerte.SUPERVISION)
        self.assertEqual(alerte.priorite, PrioriteAlerte.MOYENNE)
        self.assertEqual(alerte.module, ModuleAlerte.CAISSE)
        self.assertEqual(alerte.donnees["nombre"], 5)
        self.assertEqual(alerte.utilisateur_concerne, self.caissier)
        self.assertIn("cais", alerte.texte_recherche)

    def test_retours_caisse_normaux_pas_d_alerte(self):
        self._retour(self._vente(), numero="R-1")
        AlertesService.analyser_supervision(self.structure)
        self.assertEqual(
            Alerte.objects.filter(
                type=TypeAlerte.RETOURS_CAISSE_ANORMAUX
            ).count(),
            0,
        )

    def test_retours_caisse_resolution(self):
        self._creer_retours_anormaux()
        alerte = Alerte.objects.get(
            type=TypeAlerte.RETOURS_CAISSE_ANORMAUX,
        )
        self.assertFalse(alerte.est_resolue)

        hier = timezone.now() - timezone.timedelta(days=2)
        RetourCaisse.objects.filter(structure=self.structure).update(
            effectue_le=hier,
        )
        AlertesService.analyser_supervision(self.structure)
        alerte.refresh_from_db()
        self.assertTrue(alerte.est_resolue)

    def test_ventes_annulees_resolution(self):
        for i in range(5):
            self._vente_annulee(numero=f"A-{i}")
        AlertesService.analyser_supervision(self.structure)
        alerte = Alerte.objects.get(
            type=TypeAlerte.VENTES_ANNULEES_ANORMALES,
        )
        self.assertFalse(alerte.est_resolue)

        hier = timezone.now() - timezone.timedelta(days=2)
        Vente.objects.filter(structure=self.structure).update(
            annulee_le=hier,
        )
        AlertesService.analyser_supervision(self.structure)
        alerte.refresh_from_db()
        self.assertTrue(alerte.est_resolue)

    def test_ventes_annulees_anormales(self):
        for i in range(5):
            self._vente_annulee(numero=f"A-{i}")
        AlertesService.analyser_supervision(self.structure)

        alerte = Alerte.objects.get(
            type=TypeAlerte.VENTES_ANNULEES_ANORMALES,
        )
        self.assertEqual(alerte.categorie, CategorieAlerte.SUPERVISION)
        self.assertEqual(alerte.priorite, PrioriteAlerte.INFORMATION)
        self.assertEqual(alerte.module, ModuleAlerte.VENTE)
        self.assertEqual(alerte.donnees["nombre"], 5)
        self.assertEqual(alerte.utilisateur_concerne, self.gestionnaire)

    def test_ventes_annulees_normales_pas_d_alerte(self):
        self._vente_annulee(numero="A-1")
        AlertesService.analyser_supervision(self.structure)
        self.assertEqual(
            Alerte.objects.filter(
                type=TypeAlerte.VENTES_ANNULEES_ANORMALES
            ).count(),
            0,
        )

    def test_marquer_lue(self):
        self._creer_rupture()
        alerte = Alerte.objects.get(type=TypeAlerte.RUPTURE_STOCK)
        self.assertFalse(alerte.est_lue_par(self.gestionnaire))
        AlertesService.marquer_lue(alerte, self.gestionnaire)
        alerte.refresh_from_db()
        self.assertTrue(alerte.est_lue_par(self.gestionnaire))
        self.assertFalse(alerte.est_lue_par(self.proprietaire))


class AlertePermissionsTests(AlertesBaseTestCase):

    def setUp(self):
        super().setUp()
        self._creer_rupture()
        self._creer_retours_anormaux()
        self.client.force_authenticate(user=self.gestionnaire)

    def _liste(self, utilisateur=None):
        if utilisateur is not None:
            self.client.force_authenticate(user=utilisateur)
        return self.client.get(
            "/api/alertes/",
            {"structure_id": str(self.structure.id)},
        )

    def test_gestionnaire_voit_seulement_les_operationnelles(self):
        response = self._liste()
        self.assertEqual(response.status_code, 200)
        types = {a["type"] for a in response.data}
        self.assertEqual(types, {TypeAlerte.RUPTURE_STOCK})
        self.assertNotIn(TypeAlerte.RETOURS_CAISSE_ANORMAUX, types)

    def test_proprietaire_voit_toutes_les_alertes(self):
        response = self._liste(self.proprietaire)
        self.assertEqual(response.status_code, 200)
        types = {a["type"] for a in response.data}
        self.assertEqual(
            types,
            {
                TypeAlerte.RUPTURE_STOCK,
                TypeAlerte.RETOURS_CAISSE_ANORMAUX,
            },
        )

    def test_caissier_aucun_acces(self):
        response = self._liste(self.caissier)
        self.assertEqual(response.status_code, 403)

    def test_non_authentifie_refuse(self):
        self.client.force_authenticate(user=None)
        response = self._liste(None)
        self.assertEqual(response.status_code, 401)

    def test_structure_id_requis(self):
        response = self.client.get("/api/alertes/")
        self.assertEqual(response.status_code, 400)

    def test_gestionnaire_ne_voit_pas_detail_supervision(self):
        supervision = Alerte.objects.get(
            type=TypeAlerte.RETOURS_CAISSE_ANORMAUX,
        )
        response = self.client.get(f"/api/alertes/{supervision.id}/")
        self.assertEqual(response.status_code, 404)

    def test_proprietaire_consulte_detail(self):
        self.client.force_authenticate(user=self.proprietaire)
        alerte = Alerte.objects.get(type=TypeAlerte.RUPTURE_STOCK)
        response = self.client.get(f"/api/alertes/{alerte.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(alerte.id))
        self.assertIn("medicament_nom", response.data["donnees"])

    def test_detail_introuvable(self):
        response = self.client.get(
            "/api/alertes/00000000-0000-0000-0000-000000000000/"
        )
        self.assertEqual(response.status_code, 404)

    def test_gestionnaire_structure_autre_interdit(self):
        autre = Structure.objects.create(
            nom="Autre Pharmacie",
            type=TypeStructure.PHARMACIE,
            statut=StatutStructure.ACTIVE,
        )
        response = self._liste_gestionnaire_autre(autre)
        self.assertEqual(response.status_code, 403)

    def _liste_gestionnaire_autre(self, structure):
        return self.client.get(
            "/api/alertes/",
            {"structure_id": str(structure.id)},
        )


class AlerteFiltresTests(AlertesBaseTestCase):

    def setUp(self):
        super().setUp()
        self._creer_rupture()
        self._creer_stock_faible()
        self._creer_retours_anormaux()
        self.client.force_authenticate(user=self.gestionnaire)

    def _liste(self, params=None, utilisateur=None):
        if utilisateur is not None:
            self.client.force_authenticate(user=utilisateur)
        query = {"structure_id": str(self.structure.id)}
        if params:
            query.update(params)
        return self.client.get("/api/alertes/", query)

    def test_filtre_critiques(self):
        response = self._liste({"filtre": "critiques"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [a["type"] for a in response.data],
            [TypeAlerte.RUPTURE_STOCK],
        )

    def test_filtre_stock_faible(self):
        response = self._liste({"filtre": "stock_faible"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [a["type"] for a in response.data],
            [TypeAlerte.STOCK_FAIBLE],
        )

    def test_filtre_rupture(self):
        response = self._liste({"filtre": "rupture"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [a["type"] for a in response.data],
            [TypeAlerte.RUPTURE_STOCK],
        )

    def test_filtre_supervision_gestionnaire_vide(self):
        response = self._liste({"filtre": "supervision"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    def test_filtre_supervision_proprietaire(self):
        response = self._liste(
            {"filtre": "supervision"},
            utilisateur=self.proprietaire,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [a["type"] for a in response.data],
            [TypeAlerte.RETOURS_CAISSE_ANORMAUX],
        )

    def test_filtre_non_lues(self):
        alerte = Alerte.objects.get(type=TypeAlerte.RUPTURE_STOCK)
        AlertesService.marquer_lue(alerte, self.gestionnaire)
        response = self._liste({"filtre": "non_lues"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [a["type"] for a in response.data],
            [TypeAlerte.STOCK_FAIBLE],
        )

    def test_recherche_par_medicament(self):
        response = self._liste({"recherche": "paracetamol"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [a["type"] for a in response.data],
            [TypeAlerte.RUPTURE_STOCK],
        )

    def test_recherche_par_type_alerte(self):
        response = self._liste({"recherche": "rupture"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_recherche_par_utilisateur_proprietaire(self):
        response = self._liste(
            {"recherche_utilisateur": "Cais"},
            utilisateur=self.proprietaire,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [a["type"] for a in response.data],
            [TypeAlerte.RETOURS_CAISSE_ANORMAUX],
        )

    def test_recherche_sans_resultat(self):
        response = self._liste({"recherche": "introuvable-xyz"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])


class AlerteLectureTests(AlertesBaseTestCase):

    def test_marquer_comme_lue_propre_a_chaque_utilisateur(self):
        self._creer_rupture()
        alerte = Alerte.objects.get(type=TypeAlerte.RUPTURE_STOCK)

        response = self.client.post(f"/api/alertes/{alerte.id}/marquer-lue/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["est_lue"])

        alerte.refresh_from_db()
        self.assertTrue(alerte.est_lue_par(self.gestionnaire))
        self.assertFalse(alerte.est_lue_par(self.proprietaire))

        self.client.force_authenticate(user=self.proprietaire)
        response = self.client.get(f"/api/alertes/{alerte.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["est_lue"])

    def test_resume_indicateurs(self):
        self._creer_rupture()
        self._creer_retours_anormaux()

        response = self.client.get(
            "/api/alertes/resume/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total"], 1)
        self.assertEqual(response.data["critiques"], 1)
        self.assertEqual(response.data["non_lues"], 1)
        self.assertEqual(response.data["resolues"], 0)

        alerte = Alerte.objects.get(type=TypeAlerte.RUPTURE_STOCK)
        self.client.post(f"/api/alertes/{alerte.id}/marquer-lue/")
        response = self.client.get(
            "/api/alertes/resume/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.data["non_lues"], 0)

    def test_resume_proprietaire_compte_supervision(self):
        self._creer_retours_anormaux()
        self.client.force_authenticate(user=self.proprietaire)
        response = self.client.get(
            "/api/alertes/resume/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total"], 1)
        self.assertEqual(response.data["critiques"], 0)


class AlerteImmutabiliteTests(AlertesBaseTestCase):

    def test_aucune_creation_manuelle_possible(self):
        response = self.client.post(
            "/api/alertes/",
            {
                "structure_id": str(self.structure.id),
                "titre": "Alerte manuelle",
                "description": "Interdit",
            },
            format="json",
        )
        self.assertIn(response.status_code, (404, 405))
        self.assertEqual(Alerte.objects.count(), 0)

    def test_aucune_modification_ni_suppression(self):
        self._creer_rupture()
        alerte = Alerte.objects.get(type=TypeAlerte.RUPTURE_STOCK)

        self.client.force_authenticate(user=self.proprietaire)
        patch = self.client.patch(
            f"/api/alertes/{alerte.id}/",
            {"titre": "Modifié"},
            format="json",
        )
        self.assertIn(patch.status_code, (404, 405))

        delete = self.client.delete(f"/api/alertes/{alerte.id}/")
        self.assertIn(delete.status_code, (404, 405))

        alerte.refresh_from_db()
        self.assertEqual(alerte.titre, "Rupture de stock")


class AlerteExportTests(AlertesBaseTestCase):

    def test_gestionnaire_ne_peut_pas_exporter(self):
        self._creer_rupture()
        for endpoint in ("pdf", "excel"):
            response = self.client.get(
                f"/api/alertes/exporter/{endpoint}/",
                {"structure_id": str(self.structure.id)},
            )
            self.assertEqual(response.status_code, 403)

    def test_proprietaire_exporte_pdf(self):
        self._creer_rupture()
        self._creer_retours_anormaux()
        self.client.force_authenticate(user=self.proprietaire)
        response = self.client.get(
            "/api/alertes/exporter/pdf/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/pdf")
        evenements = Alerte.objects.filter(structure=self.structure)
        contenu = generer_alertes_pdf(
            self.structure,
            evenements,
            libelle_filtre="Toutes",
        )
        self.assertTrue(contenu.startswith(b"%PDF"))

    def test_proprietaire_exporte_excel(self):
        self._creer_rupture()
        self.client.force_authenticate(user=self.proprietaire)
        response = self.client.get(
            "/api/alertes/exporter/excel/",
            {"structure_id": str(self.structure.id)},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("spreadsheetml", response["Content-Type"])
        evenements = Alerte.objects.filter(structure=self.structure)
        contenu = generer_alertes_excel(
            self.structure,
            evenements,
            libelle_filtre="Toutes",
        )
        self.assertTrue(contenu.startswith(b"PK"))

    def test_proprietaire_autre_structure_interdit(self):
        self._creer_rupture()
        autre = Structure.objects.create(
            nom="Autre Pharmacie",
            type=TypeStructure.PHARMACIE,
            statut=StatutStructure.ACTIVE,
        )
        EquipeStructure.objects.create(
            structure=autre,
            utilisateur=self.proprietaire,
            role=RoleEquipeStructure.GESTIONNAIRE,
            statut=StatutEquipeStructure.ACTIF,
        )
        self.client.force_authenticate(user=self.proprietaire)
        response = self.client.get(
            "/api/alertes/exporter/pdf/",
            {"structure_id": str(autre.id)},
        )
        self.assertEqual(response.status_code, 403)
