-- Script pour corriger les permissions PostgreSQL
-- À exécuter en tant que superuser (postgres)

-- Connexion à la base de données (remplacer le nom si différent)
\c recherche_medical;

-- Donner tous les droits sur le schéma public à tous les users
GRANT ALL ON SCHEMA public TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;

-- Permissions par défaut pour les futurs objets
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO PUBLIC;

-- Si vous connaissez le nom d'utilisateur spécifique, remplacez PUBLIC par le nom
-- GRANT ALL ON SCHEMA public TO votre_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO votre_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO votre_user;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO votre_user;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO votre_user;

\echo 'Permissions accordées avec succès!'
