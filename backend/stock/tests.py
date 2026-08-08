from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from structures.models import (
    EquipeStructure,
    RoleEquipeStructure,
    StatutEquipeStructure,
    StatutStructure,
    Structure,
    TypeStructure,
)
from utilisateurs.models import RoleUtilisateur, TypeAuthentification, Utilisateur

from .models import Approvisionnement, Medicament, StockItem, StockMovement


class ApprovisionnementBaseTestCase(TestCase):

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
            email="gestionnaire-stock@test.com",
            password="password123",
            nom="Gestionnaire",
            role=RoleUtilisateur.GESTIONNAIRE,
            type_authentification=TypeAuthentification.EMAIL,
            email_verifie=True,
        )
        self.proprietaire = Utilisateur.objects.create_user(
            email="proprietaire-stock@test.com",
            password="password123",
            nom="Proprietaire",
            role=RoleUtilisateur.PROPRIETAIRE,
            type_authentification=TypeAuthentification.EMAIL,
            email_verifie=True,
        )
        EquipeStructure.objects.create(
            structure=self.structure,
            utilisateur=self.gestionnaire,
            role=RoleEquipeStructure.GESTIONNAIRE,
            statut=StatutEquipeStructure.ACTIF,
        )
        EquipeStructure.objects.create(
            structure=self.structure,
            utilisateur=self.proprietaire,
            role=RoleEquipeStructure.PROPRIETAIRE,
            statut=StatutEquipeStructure.ACTIF,
        )
        self.client.force_authenticate(user=self.gestionnaire)

    def payload(self):
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
                    "tva": False,
                    "en_reserve": False,
                },
                {
                    "nom": "Amoxicilline",
                    "forme_pharmaceutique": "GELULE",
                    "quantite": 10,
                    "prix_achat": "500.00",
                    "prix_vente": "900.00",
                    "date_peremption": "2027-08-07",
                    "tva": False,
                    "en_reserve": True,
                },
            ],
        }


class ApprovisionnementTests(ApprovisionnementBaseTestCase):

    def test_gestionnaire_enregistre_une_livraison_complete(self):
        response = self.client.post(
            "/api/stocks/approvisionnements/",
            self.payload(),
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Approvisionnement.objects.count(), 1)
        self.assertEqual(Medicament.objects.count(), 2)
        self.assertEqual(StockMovement.objects.count(), 2)

        item = StockItem.objects.get(nom="Paracetamol 500mg")
        self.assertEqual(item.quantite, 20)
        self.assertEqual(item.quantite_reservee, 0)

        reserve = Medicament.objects.get(nom="Amoxicilline")
        self.assertTrue(reserve.en_reserve)

    def test_livraison_atomique_si_une_ligne_est_invalide(self):
        payload = self.payload()
        payload["lignes"][1]["quantite"] = 0

        response = self.client.post(
            "/api/stocks/approvisionnements/",
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Approvisionnement.objects.count(), 0)
        self.assertEqual(Medicament.objects.count(), 0)
        self.assertEqual(StockItem.objects.count(), 0)
        self.assertEqual(StockMovement.objects.count(), 0)

    def test_proprietaire_ne_cree_pas_approvisionnement(self):
        self.client.force_authenticate(user=self.proprietaire)

        response = self.client.post(
            "/api/stocks/approvisionnements/",
            self.payload(),
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_autocomplete_approvisionnement_retourne_medicaments_connus_non_vendables(self):
        Medicament.objects.create(
            structure=self.structure,
            nom="Produit sans prix",
            forme_pharmaceutique="SIROP",
            prix_vente=None,
        )
        Medicament.objects.create(
            structure=self.structure,
            nom="Produit reserve sans stock",
            forme_pharmaceutique="SIROP",
            prix_vente=Decimal("1000.00"),
            en_reserve=True,
        )

        response = self.client.get(
            "/api/stocks/medicaments/",
            {"structure_id": str(self.structure.id), "search": "Produit"},
        )

        self.assertEqual(response.status_code, 200)
        noms = {item["nom"] for item in response.data}
        self.assertIn("Produit sans prix", noms)
        self.assertIn("Produit reserve sans stock", noms)
