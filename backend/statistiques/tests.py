"""Tests du module Statistiques (outil de pilotage du propriétaire).

Couvre :
- la sécurité au niveau du système (propriétaire uniquement) ;
- la résolution des périodes et de la période précédente ;
- les agrégats de chaque section (vue générale, ventes, produits,
  approvisionnements, stock, caisse, financier, comparaison, détails) ;
- les filtres et les exports PDF/Excel ;
- le caractère strictement en lecture du module.
"""

from datetime import date, timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from alertes.models import Alerte, TypeAlerte
from stock.models import (
    Approvisionnement,
    LigneApprovisionnement,
    Medicament,
    StockItem,
)
from structures.models import (
    EquipeStructure,
    RoleEquipeStructure,
    StatutEquipeStructure,
    StatutStructure,
    Structure,
    TypeStructure,
)
from utilisateurs.models import RoleUtilisateur, TypeAuthentification, Utilisateur

from ventes.models import (
    EtatVente,
    LigneVente,
    Paiement,
    RetourCaisse,
    RetourCaisseLigne,
    Vente,
)

from .services import StatistiquesService, resoudre_periode


class StatistiquesBaseTestCase(TestCase):

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
            email="gestionnaire-stats@test.com",
            password="password123",
            nom="Gest Stats",
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
            email="proprietaire-stats@test.com",
            password="password123",
            nom="Proprio Stats",
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
            email="caissier-stats@test.com",
            password="password123",
            nom="Cais Stats",
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

        self.client.force_authenticate(user=self.proprietaire)

    # ------------------------------------------------------------------
    # Utilitaires de création de données
    # ------------------------------------------------------------------

    def _medicament(self, nom, prix_vente, quantite=10, seuil=5):
        med, _ = Medicament.objects.get_or_create(
            structure=self.structure,
            nom=nom,
            defaults={
                "forme_pharmaceutique": "COMPRIME",
                "prix_vente": prix_vente,
            },
        )
        item, _ = StockItem.objects.get_or_create(
            structure=self.structure,
            nom=nom,
            type_item=StockItem.TYPE_MEDICAMENT,
            defaults={"quantite": quantite, "seuil_alerte": seuil},
        )
        item.quantite = quantite
        item.seuil_alerte = seuil
        item.save(update_fields=["quantite", "seuil_alerte"])
        return med, item

    def _appro(self, jour, fournisseur="Distri", lignes=None, augmenter_stock=True):
        appro = Approvisionnement.objects.create(
            structure=self.structure,
            date_reception=jour,
            cree_par=self.gestionnaire,
            fournisseur=fournisseur,
        )
        for nom, quantite, prix_achat, prix_vente in lignes or []:
            med, _ = Medicament.objects.get_or_create(
                structure=self.structure,
                nom=nom,
                defaults={
                    "forme_pharmaceutique": "COMPRIME",
                    "prix_vente": prix_vente,
                },
            )
            LigneApprovisionnement.objects.create(
                approvisionnement=appro,
                medicament=med,
                forme_pharmaceutique="COMPRIME",
                quantite=quantite,
                prix_achat=prix_achat,
                prix_vente=prix_vente,
                date_peremption=jour + timedelta(days=365),
            )
            item, _ = StockItem.objects.get_or_create(
                structure=self.structure,
                nom=nom,
                type_item=StockItem.TYPE_MEDICAMENT,
                defaults={"quantite": 0},
            )
            if augmenter_stock:
                item.quantite += quantite
                item.save(update_fields=["quantite"])
        return appro

    def _vente_payee(self, numero, jour, lignes, mode="ESPECES"):
        montant = sum(quantite * prix for _, quantite, prix in lignes)
        nb_articles = sum(quantite for _, quantite, _ in lignes)
        vente = Vente.objects.create(
            structure=self.structure,
            numero=numero,
            prepare_par=self.gestionnaire,
            etat=EtatVente.PAYEE,
            cree_le=jour,
            validee_le=jour,
            montant_total=montant,
            nb_articles=nb_articles,
        )
        for nom, quantite, prix in lignes:
            med = Medicament.objects.get(
                structure=self.structure, nom=nom
            )
            LigneVente.objects.create(
                vente=vente,
                medicament=med,
                designation=nom,
                forme_pharmaceutique="COMPRIME",
                prix_unitaire=prix,
                quantite=quantite,
                montant=prix * quantite,
            )
        paiement = Paiement.objects.create(
            vente=vente,
            mode=mode,
            montant=montant,
            encaisse_par=self.caissier,
        )
        if jour.date() != timezone.localdate():
            Paiement.objects.filter(pk=paiement.pk).update(effectue_le=jour)
        return vente

    def _retour(self, vente, numero, jour, montant=0, nb_articles=1, lignes=None):
        retour = RetourCaisse.objects.create(
            structure=self.structure,
            vente=vente,
            numero=numero,
            motif="ERREUR_QUANTITE",
            effectue_par=self.caissier,
            montant_total=montant,
            nb_articles=nb_articles,
        )
        for nom, quantite, prix in lignes or []:
            med = Medicament.objects.get(
                structure=self.structure, nom=nom
            )
            RetourCaisseLigne.objects.create(
                retour=retour,
                medicament=med,
                designation=nom,
                prix_unitaire=prix,
                quantite=quantite,
                montant=prix * quantite,
            )
        if jour.date() != timezone.localdate():
            RetourCaisse.objects.filter(pk=retour.pk).update(effectue_le=jour)
        return retour

    def _annulation(self, numero, jour, motif="Client sans argent"):
        vente = Vente.objects.create(
            structure=self.structure,
            numero=numero,
            prepare_par=self.gestionnaire,
            etat=EtatVente.ANNULEE,
            cree_le=jour,
            annulee_le=jour,
            annulee_par=self.caissier,
            motif_annulation=motif,
        )
        return vente

    def _stock_alerte_rupture(self, nom):
        Alerte.objects.create(
            structure=self.structure,
            categorie="OPERATIONNELLE",
            type=TypeAlerte.RUPTURE_STOCK,
            priorite="CRITIQUE",
            module="APPROVISIONNEMENT",
            titre="Rupture de stock",
            description="Rupture",
            donnees={"medicament_nom": nom, "stock_disponible": 0},
        )

    def _url(self, endpoint, periode="aujourdhui", **params):
        base = {
            "structure_id": str(self.structure.id),
            "periode": periode,
        }
        base.update(params)
        return f"/api/statistiques/{endpoint}/", base


class PermissionsStatistiquesTests(StatistiquesBaseTestCase):
    """La sécurité est contrôlée au niveau du système (§17)."""

    def test_gestionnaire_acces_refuse(self):
        self.client.force_authenticate(user=self.gestionnaire)
        for endpoint in ("generale", "ventes", "financier", "details"):
            url, params = self._url(endpoint)
            response = self.client.get(url, params)
            self.assertEqual(response.status_code, 403, endpoint)

    def test_caissier_acces_refuse(self):
        self.client.force_authenticate(user=self.caissier)
        url, params = self._url("financier")
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, 403)

    def test_non_authentifie(self):
        self.client.force_authenticate(user=None)
        url, params = self._url("generale")
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, 401)

    def test_proprietaire_non_membre_refuse(self):
        autre = Utilisateur.objects.create_user(
            email="proprietaire-autre@test.com",
            password="password123",
            nom="Autre",
            role=RoleUtilisateur.PROPRIETAIRE,
            type_authentification=TypeAuthentification.EMAIL,
            email_verifie=True,
        )
        self.client.force_authenticate(user=autre)
        url, params = self._url("generale")
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, 403)

    def test_proprietaire_membre_accede(self):
        url, params = self._url("generale")
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, 200)

    def test_module_strictement_lecture(self):
        url, _ = self._url("generale")
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, 405)

    def test_structure_id_requis(self):
        response = self.client.get(
            "/api/statistiques/generale/", {"periode": "aujourdhui"}
        )
        self.assertEqual(response.status_code, 400)


class PeriodesStatistiquesTests(StatistiquesBaseTestCase):

    def test_aujourdhui(self):
        periode = resoudre_periode("aujourdhui")
        aujourdhui = timezone.localdate()
        self.assertEqual(periode.debut, aujourdhui)
        self.assertEqual(periode.fin, aujourdhui)
        self.assertIn("Aujourd'hui", periode.libelle)
        self.assertEqual(periode.precedente.debut, aujourdhui - timedelta(days=1))

    def test_hier(self):
        periode = resoudre_periode("hier")
        hier = timezone.localdate() - timedelta(days=1)
        self.assertEqual(periode.debut, hier)
        self.assertEqual(periode.fin, hier)

    def test_semaine_et_precedente(self):
        aujourdhui = timezone.localdate()
        periode = resoudre_periode("semaine")
        self.assertEqual(periode.debut, aujourdhui - timedelta(days=aujourdhui.weekday()))
        self.assertEqual(periode.fin, aujourdhui)
        self.assertEqual(
            periode.precedente.fin,
            periode.debut - timedelta(days=1),
        )

    def test_mois(self):
        aujourdhui = timezone.localdate()
        periode = resoudre_periode("mois")
        self.assertEqual(periode.debut, aujourdhui.replace(day=1))
        self.assertEqual(periode.precedente.fin, periode.debut - timedelta(days=1))

    def test_mois_precedent(self):
        aujourdhui = timezone.localdate()
        periode = resoudre_periode("mois_precedent")
        premier_mois = aujourdhui.replace(day=1)
        self.assertEqual(periode.fin, premier_mois - timedelta(days=1))
        self.assertEqual(periode.debut, periode.fin.replace(day=1))

    def test_annee(self):
        aujourdhui = timezone.localdate()
        periode = resoudre_periode("annee")
        self.assertEqual(periode.debut, date(aujourdhui.year, 1, 1))
        self.assertEqual(periode.precedente.fin, date(aujourdhui.year - 1, 12, 31))

    def test_personnalisee_avec_precedente(self):
        periode = resoudre_periode(
            "personnalisee",
            date_debut=date(2026, 7, 1),
            date_fin=date(2026, 7, 31),
        )
        self.assertEqual(periode.debut, date(2026, 7, 1))
        self.assertEqual(periode.fin, date(2026, 7, 31))
        self.assertEqual(periode.precedente.debut, date(2026, 6, 1))
        self.assertEqual(periode.precedente.fin, date(2026, 6, 30))

    def test_periode_inconnue_non_bornee(self):
        periode = resoudre_periode("inconnu")
        self.assertIsNone(periode.debut)
        self.assertIsNone(periode.fin)
        self.assertIsNone(periode.precedente)


class VueGeneraleStatistiquesTests(StatistiquesBaseTestCase):

    def setUp(self):
        super().setUp()
        aujourdhui = timezone.localdate()
        hier = aujourdhui - timedelta(days=1)

        self._medicament("Paracétamol 500mg", prix_vente=500, quantite=10)
        self._appro(aujourdhui, lignes=[("Paracétamol 500mg", 50, 300, 500)])
        self._appro(hier, lignes=[("Paracétamol 500mg", 20, 300, 500)])

        self._vente_payee("V-100", timezone.now(), [("Paracétamol 500mg", 2, 500)])
        self._vente_payee(
            "V-101",
            timezone.now() - timedelta(hours=2),
            [("Paracétamol 500mg", 1, 500)],
        )
        self._vente_payee(
            "V-102",
            timezone.now() - timedelta(days=1),
            [("Paracétamol 500mg", 3, 500)],
        )

    def test_vue_generale_aujourdhui(self):
        url, params = self._url("generale", periode="aujourdhui")
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, 200)
        donnees = response.data

        self.assertEqual(donnees["ventes"]["nb_validees"], 2)
        self.assertEqual(donnees["ventes"]["nb_produits_vendus"], 3)
        self.assertEqual(donnees["ventes"]["ca"], 1500)

        self.assertEqual(donnees["approvisionnements"]["nombre"], 1)
        self.assertEqual(donnees["approvisionnements"]["quantite_totale"], 50)

        self.assertEqual(donnees["stock"]["nb_references"], 1)
        self.assertEqual(donnees["stock"]["nb_references_disponibles"], 1)
        self.assertEqual(donnees["stock"]["nb_ruptures"], 0)

        self.assertEqual(donnees["caisse"]["nb_paiements_valides"], 2)
        self.assertEqual(donnees["caisse"]["nb_retours"], 0)
        self.assertEqual(donnees["caisse"]["nb_annulations"], 0)

    def test_vue_generale_hier_et_evolution(self):
        url, params = self._url("generale", periode="hier")
        response = self.client.get(url, params)
        donnees = response.data
        self.assertEqual(donnees["ventes"]["nb_validees"], 1)
        self.assertEqual(donnees["approvisionnements"]["nombre"], 1)
        self.assertIsNotNone(donnees["ventes"]["evolution_ventes"])

    def test_vue_generale_annulations_et_retours(self):
        self._annulation(
            "V-A1", timezone.now(), motif="Erreur de prix"
        )
        vente = self._vente_payee(
            "V-103",
            timezone.now() - timedelta(hours=1),
            [("Paracétamol 500mg", 1, 500)],
        )
        self._retour(vente, "R-1", timezone.now(), montant=500)

        url, params = self._url("generale", periode="aujourdhui")
        response = self.client.get(url, params)
        donnees = response.data
        self.assertEqual(donnees["caisse"]["nb_annulations"], 1)
        self.assertEqual(donnees["caisse"]["nb_retours"], 1)
        self.assertEqual(donnees["caisse"]["montant_retours"], 500)


class AnalyseVentesTests(StatistiquesBaseTestCase):

    def test_analyse_ventes_series(self):
        aujourdhui = timezone.localdate()
        self._medicament("Doliprane 1g", prix_vente=1000, quantite=20)
        self._vente_payee(
            "V-1", timezone.now(), [("Doliprane 1g", 2, 1000)]
        )
        self._vente_payee(
            "V-2",
            timezone.now() - timedelta(days=2),
            [("Doliprane 1g", 4, 1000)],
        )

        url, params = self._url("ventes", periode="semaine")
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, 200)
        donnees = response.data
        self.assertEqual(donnees["nb_ventes"], 2)
        self.assertEqual(donnees["nb_produits_vendus"], 6)
        self.assertTrue(donnees["series_ventes"])
        self.assertEqual(
            sum(s["valeur"] for s in donnees["series_ventes"]),
            2,
        )
        self.assertEqual(
            sum(s["valeur"] for s in donnees["series_produits"]),
            6,
        )
        self.assertTrue(donnees["meilleures_periodes"])
        self.assertTrue(donnees["plus_faibles_periodes"])


class ProduitsVendusTests(StatistiquesBaseTestCase):

    def test_classement_produits(self):
        aujourdhui = timezone.localdate()
        self._medicament("Paracétamol 500mg", prix_vente=500, quantite=100)
        self._medicament("Amoxicilline 500mg", prix_vente=1000, quantite=100)
        self._medicament("Doliprane 1g", prix_vente=800, quantite=100)

        self._vente_payee(
            "V-1",
            timezone.now(),
            [("Paracétamol 500mg", 10, 500)],
        )
        self._vente_payee(
            "V-2",
            timezone.now(),
            [("Amoxicilline 500mg", 5, 1000)],
        )
        self._vente_payee(
            "V-3",
            timezone.now(),
            [("Paracétamol 500mg", 4, 500), ("Doliprane 1g", 2, 800)],
        )

        url, params = self._url("produits", periode="aujourdhui")
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, 200)
        donnees = response.data

        self.assertEqual(donnees["plus_vendus"][0]["nom"], "Paracétamol 500mg")
        self.assertEqual(donnees["plus_vendus"][0]["quantite"], 14)
        self.assertEqual(donnees["plus_vendus"][1]["nom"], "Amoxicilline 500mg")
        self.assertEqual(donnees["plus_vendus"][2]["nom"], "Doliprane 1g")

    def test_retours_deduits_du_classement(self):
        aujourdhui = timezone.localdate()
        self._medicament("Paracétamol 500mg", prix_vente=500, quantite=100)
        vente = self._vente_payee(
            "V-1",
            timezone.now(),
            [("Paracétamol 500mg", 10, 500)],
        )
        self._retour(
            vente,
            "R-1",
            timezone.now(),
            montant=1500,
            nb_articles=3,
            lignes=[("Paracétamol 500mg", 3, 500)],
        )

        url, params = self._url("produits", periode="aujourdhui")
        response = self.client.get(url, params)
        donnees = response.data
        self.assertEqual(donnees["plus_vendus"][0]["quantite"], 7)


class ApprovisionnementsTests(StatistiquesBaseTestCase):

    def test_analyse_approvisionnements(self):
        aujourdhui = timezone.localdate()
        self._medicament("Paracétamol 500mg", prix_vente=500)
        self._appro(
            aujourdhui,
            lignes=[("Paracétamol 500mg", 100, 300, 500)],
        )
        self._appro(
            aujourdhui - timedelta(days=3),
            fournisseur="PharmaDistri",
            lignes=[("Paracétamol 500mg", 50, 300, 500)],
        )

        url, params = self._url("approvisionnements", periode="mois")
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, 200)
        donnees = response.data
        self.assertEqual(donnees["nombre"], 2)
        self.assertEqual(donnees["quantite_totale"], 150)
        self.assertEqual(donnees["montant_total"], 45000)
        self.assertEqual(donnees["produits_frequents"][0]["nom"], "Paracétamol 500mg")
        self.assertEqual(
            donnees["produits_frequents"][0]["nb_approvisionnements"], 2
        )


class StockStatistiquesTests(StatistiquesBaseTestCase):

    def test_analyse_et_valeur_stock(self):
        self._medicament("Paracétamol 500mg", prix_vente=500, quantite=10, seuil=5)
        self._medicament("Amoxicilline 500mg", prix_vente=1000, quantite=0, seuil=5)
        self._medicament("Doliprane 1g", prix_vente=800, quantite=3, seuil=5)
        self._medicament("Vitamine C", prix_vente=2000, quantite=30, seuil=5)

        self._appro(
            timezone.localdate(),
            lignes=[("Paracétamol 500mg", 10, 300, 500)],
            augmenter_stock=False,
        )
        self._appro(
            timezone.localdate(),
            lignes=[("Doliprane 1g", 3, 400, 800)],
            augmenter_stock=False,
        )

        url, params = self._url("stock")
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, 200)
        donnees = response.data

        self.assertEqual(donnees["nb_references"], 4)
        self.assertEqual(donnees["nb_disponibles"], 3)
        self.assertEqual(donnees["nb_ruptures"], 1)
        self.assertEqual(donnees["nb_stocks_faibles"], 1)

        # Valeur d'achat : Paracétamol 10×300 + Doliprane 3×400 = 4200.
        self.assertEqual(donnees["valeur"]["achat"], 4200)
        # Valeur de vente : 10×500 + 3×800 + Vitamine C 30×2000 = 67400.
        self.assertEqual(donnees["valeur"]["vente"], 67400)

    def test_produits_en_rupture_et_evolution(self):
        self._stock_alerte_rupture("Paracétamol 500mg")
        url, params = self._url("stock")
        response = self.client.get(url, params)
        donnees = response.data
        self.assertEqual(
            donnees["produits_ruptures"][0]["nom"], "Paracétamol 500mg"
        )
        self.assertEqual(donnees["evolution_ruptures"]["actuel"], 1)


class CaisseStatistiquesTests(StatistiquesBaseTestCase):

    def test_analyse_caisse(self):
        aujourdhui = timezone.localdate()
        self._medicament("Doliprane 1g", prix_vente=1000, quantite=50)

        v1 = self._vente_payee(
            "V-1", timezone.now(), [("Doliprane 1g", 2, 1000)], mode="ESPECES"
        )
        self._vente_payee(
            "V-2",
            timezone.now() - timedelta(hours=1),
            [("Doliprane 1g", 1, 1000)],
            mode="CARTE",
        )
        self._retour(v1, "R-1", timezone.now(), montant=1000, nb_articles=1)
        self._annulation("V-A1", timezone.now())

        url, params = self._url("caisse", periode="aujourdhui")
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, 200)
        donnees = response.data

        self.assertEqual(donnees["paiements"]["nombre"], 2)
        self.assertEqual(donnees["paiements"]["montant"], 3000)
        self.assertEqual(len(donnees["paiements_par_mode"]), 2)
        self.assertEqual(donnees["retours"]["nombre"], 1)
        self.assertEqual(donnees["retours"]["montant"], 1000)
        self.assertEqual(donnees["annulations"]["nombre"], 1)


class FinancierStatistiquesTests(StatistiquesBaseTestCase):

    def test_analyse_financiere(self):
        aujourdhui = timezone.localdate()
        self._medicament("Doliprane 1g", prix_vente=1000, quantite=50)
        self._appro(
            aujourdhui,
            lignes=[("Doliprane 1g", 50, 600, 1000)],
        )
        v1 = self._vente_payee(
            "V-1",
            timezone.now(),
            [("Doliprane 1g", 10, 1000)],
            mode="ESPECES",
        )
        self._retour(v1, "R-1", timezone.now(), montant=2000, nb_articles=2)

        url, params = self._url("financier", periode="aujourdhui")
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, 200)
        donnees = response.data

        self.assertEqual(donnees["chiffre_affaires"]["brut"], 10000)
        self.assertEqual(donnees["chiffre_affaires"]["retours"], 2000)
        self.assertEqual(donnees["chiffre_affaires"]["net"], 8000)
        self.assertEqual(donnees["nb_ventes_encaissees"], 1)
        self.assertEqual(donnees["nb_produits_vendus"], 10)
        self.assertEqual(donnees["panier_moyen"], 10000)
        self.assertEqual(donnees["cout_marchandises"], 6000)
        self.assertEqual(donnees["benefice_brut"], 4000)
        self.assertEqual(donnees["marge_pourcentage"], 40)
        self.assertEqual(len(donnees["par_mode"]), 1)


class ComparaisonTests(StatistiquesBaseTestCase):

    def test_comparaison_periodes(self):
        aujourdhui = timezone.localdate()
        hier = timezone.now() - timedelta(days=1)
        self._medicament("Doliprane 1g", prix_vente=1000, quantite=50)
        self._vente_payee(
            "V-1", timezone.now(), [("Doliprane 1g", 2, 1000)]
        )
        self._vente_payee(
            "V-2",
            timezone.now() - timedelta(hours=1),
            [("Doliprane 1g", 1, 1000)],
        )
        self._vente_payee(
            "V-3",
            hier.replace(hour=12),
            [("Doliprane 1g", 1, 1000)],
        )

        url, params = self._url("comparaison", periode="aujourdhui")
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, 200)
        donnees = response.data

        self.assertEqual(donnees["ventes"]["actuel"], 2)
        self.assertEqual(donnees["ventes"]["precedent"], 1)
        self.assertEqual(donnees["ventes"]["variation"], 100)
        self.assertEqual(donnees["periode_precedente"]["libelle"], "Hier")


class DetailsStatistiquesTests(StatistiquesBaseTestCase):

    def test_details_ventes_approvisionnements_retours_annulations(self):
        aujourdhui = timezone.localdate()
        self._medicament("Doliprane 1g", prix_vente=1000, quantite=50)
        self._appro(aujourdhui, fournisseur="Distri", lignes=[("Doliprane 1g", 50, 600, 1000)])
        v1 = self._vente_payee(
            "V-1",
            timezone.now(),
            [("Doliprane 1g", 2, 1000)],
        )
        self._retour(v1, "R-1", timezone.now(), montant=1000, nb_articles=1)
        self._annulation("V-A1", timezone.now())

        url, params = self._url("details", periode="aujourdhui")
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, 200)
        donnees = response.data

        self.assertEqual(donnees["ventes"]["total"], 1)
        self.assertEqual(donnees["ventes"]["items"][0]["numero"], "V-1")
        self.assertEqual(donnees["ventes"]["items"][0]["mode_label"], "Espèces")
        self.assertEqual(donnees["approvisionnements"]["total"], 1)
        self.assertEqual(donnees["approvisionnements"]["items"][0]["quantite_totale"], 50)
        self.assertEqual(donnees["retours"]["total"], 1)
        self.assertEqual(donnees["annulations"]["total"], 1)
        self.assertEqual(
            donnees["annulations"]["items"][0]["motif_annulation"],
            "Client sans argent",
        )


class FiltresStatistiquesTests(StatistiquesBaseTestCase):

    def test_filtre_produit(self):
        aujourdhui = timezone.localdate()
        self._medicament("Paracétamol 500mg", prix_vente=500, quantite=100)
        self._medicament("Doliprane 1g", prix_vente=1000, quantite=100)
        self._vente_payee(
            "V-1",
            timezone.now(),
            [("Paracétamol 500mg", 4, 500), ("Doliprane 1g", 2, 1000)],
        )

        url, params = self._url(
            "ventes", periode="aujourdhui", produit="Paracétamol"
        )
        response = self.client.get(url, params)
        donnees = response.data
        self.assertEqual(donnees["nb_ventes"], 1)
        self.assertEqual(donnees["nb_produits_vendus"], 4)

    def test_filtre_caisse_mode(self):
        aujourdhui = timezone.localdate()
        self._medicament("Doliprane 1g", prix_vente=1000, quantite=100)
        self._vente_payee(
            "V-1", timezone.now(), [("Doliprane 1g", 2, 1000)], mode="ESPECES"
        )
        self._vente_payee(
            "V-2",
            timezone.now() - timedelta(hours=1),
            [("Doliprane 1g", 1, 1000)],
            mode="CARTE",
        )

        url, params = self._url(
            "caisse", periode="aujourdhui", caisse="CARTE"
        )
        response = self.client.get(url, params)
        donnees = response.data
        self.assertEqual(donnees["paiements"]["nombre"], 1)
        self.assertEqual(donnees["paiements"]["montant"], 1000)


class ExportsStatistiquesTests(StatistiquesBaseTestCase):

    def test_export_pdf(self):
        self._medicament("Doliprane 1g", prix_vente=1000, quantite=10)
        self._vente_payee(
            "V-1", timezone.now(), [("Doliprane 1g", 2, 1000)]
        )
        url, params = self._url("exporter/pdf", periode="aujourdhui")
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/pdf")
        self.assertIn("statistiques_", response["Content-Disposition"])
        self.assertTrue(len(b"".join(response.streaming_content)) > 1000)

    def test_export_excel(self):
        self._medicament("Doliprane 1g", prix_vente=1000, quantite=10)
        self._vente_payee(
            "V-1", timezone.now(), [("Doliprane 1g", 2, 1000)]
        )
        url, params = self._url("exporter/excel", periode="aujourdhui")
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, 200)
        self.assertIn("spreadsheetml", response["Content-Type"])
        self.assertTrue(len(b"".join(response.streaming_content)) > 1000)


class RapportCompletTests(StatistiquesBaseTestCase):
    """Le rapport complet (exports) agrège toutes les sections."""

    def test_rapport_complet_contient_toutes_les_sections(self):
        self._medicament("Doliprane 1g", prix_vente=1000, quantite=10)
        self._vente_payee(
            "V-1", timezone.now(), [("Doliprane 1g", 2, 1000)]
        )
        periode = resoudre_periode("aujourdhui")
        rapport = StatistiquesService.rapport_complet(
            self.structure.id, periode, {}
        )
        for section in (
            "vue_generale",
            "ventes",
            "produits",
            "approvisionnements",
            "stock",
            "caisse",
            "financier",
            "comparaison",
            "details",
            "filtres",
        ):
            self.assertIn(section, rapport)
        self.assertEqual(rapport["financier"]["chiffre_affaires"]["brut"], 2000)
