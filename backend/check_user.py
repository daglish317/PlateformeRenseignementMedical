#!/usr/bin/env python
"""
Script pour vérifier et créer un utilisateur GESTIONNAIRE
Usage: python check_user.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'renseignementmedical.settings')
django.setup()

from utilisateurs.models import Utilisateur

def main():
    print("=" * 60)
    print("🔍 Vérification des utilisateurs GESTIONNAIRE")
    print("=" * 60)
    
    # Lister tous les gestionnaires
    gestionnaires = Utilisateur.objects.filter(role="GESTIONNAIRE")
    
    if gestionnaires.exists():
        print(f"\n✅ {gestionnaires.count()} gestionnaire(s) trouvé(s) :\n")
        for g in gestionnaires:
            print(f"  • Email: {g.email}")
            nom_complet = f"{getattr(g, 'prenom', '')} {getattr(g, 'nom', '')}".strip() or "N/A"
            print(f"    Nom: {nom_complet}")
            print(f"    Actif: {g.is_active}")
            print(f"    ID: {g.id}")
            print()
    else:
        print("\n❌ Aucun gestionnaire trouvé !")
        print("\n💡 Création d'un gestionnaire de test...\n")
        
        # Créer un gestionnaire
        try:
            # Créer avec les champs disponibles
            user_data = {
                "email": "gestionnaire@test.com",
                "password": "Gestionnaire123!",
                "role": "GESTIONNAIRE"
            }
            
            # Ajouter nom/prenom seulement si les champs existent
            if hasattr(Utilisateur, 'nom'):
                user_data["nom"] = "Gestionnaire"
            if hasattr(Utilisateur, 'prenom'):
                user_data["prenom"] = "Test"
            
            user = Utilisateur.objects.create_user(**user_data)
            print("✅ Gestionnaire créé avec succès !")
            print(f"\n  📧 Email: {user.email}")
            print(f"  🔑 Mot de passe: Gestionnaire123!")
            print(f"  🎭 Role: {user.role}")
            print(f"\n⚠️  Utilisez ces identifiants pour vous connecter au frontend")
        except Exception as e:
            print(f"❌ Erreur lors de la création : {e}")
    
    # Statistiques
    print("\n" + "=" * 60)
    print("📊 Statistiques des utilisateurs")
    print("=" * 60)
    print(f"Total utilisateurs: {Utilisateur.objects.count()}")
    print(f"Gestionnaires: {Utilisateur.objects.filter(role='GESTIONNAIRE').count()}")
    print(f"Patients: {Utilisateur.objects.filter(role='PATIENT').count()}")
    print(f"Administrateurs: {Utilisateur.objects.filter(role='ADMIN').count()}")
    print()

if __name__ == "__main__":
    main()
