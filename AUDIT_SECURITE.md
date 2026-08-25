# Audit securite statique - SanteProx

## Portee

Audit statique du code frontend et backend du projet visible dans ce workspace.
Je n ai pas lance de pentest actif ni tente d exploitation. Les points ci-dessous
sont les failles et risques identifiables directement dans le code.

## Synthese rapide

Le projet a une base solide sur le plan fonctionnel, mais plusieurs risques
importants restent ouverts:

- gestion des secrets insuffisante;
- authentification JWT trop exposée au vol de session;
- WebSocket authentifie par jeton dans l URL;
- journalisation de codes OTP et d evenements sensibles;
- redirections non valides sur les parcours d auth;
- enumeration de comptes;
- protection CSRF/CSP/hardening insuffisante;
- donnees de recherche medicale persistees cote navigateur.

## Failles identifiees

| Severite | Zone | Faille | Impact | Correction recommandee |
|---|---|---|---|---|
| Critique | `backend/renseignementmedical/settings.py`, `backend/.env` | Secrets sensibles melanges au code et en environnement local, avec fallback `SECRET_KEY = "django-insecure-dev-only-change-me"` et presence d un `.env` contenant des variables a fort impact (`SECRET_KEY`, `GOOGLE_CLIENT_SECRET`, `EMAIL_HOST_PASSWORD`, etc.). | Si ces valeurs fuient ou restent en prod, un attaquant peut falsifier des sessions, casser l auth, ou compromettre les integrations. | Retirer tout secret du depot, ignorer `.env`, regenerer les secrets exposes, exiger des variables d environnement uniques par environnement. |
| Critique | `backend/renseignementmedical/settings.py` | Identifiants PostgreSQL locaux fixes en dur (`santeprox_user` / mot de passe stocke en clair). | Compromission triviale si le depot ou le poste local est expose. | Supprimer les credentiels fixes du code, passer uniquement par `DATABASE_URL` ou variables d environnement, rotation des identifiants. |
| Critique | `backend/core/events/handlers.py`, `backend/core/verification/service.py`, `backend/utilisateurs/services/invitation_service.py`, `backend/core/events/dispatcher.py` | Les codes OTP et evenements sensibles sont loggues ou imprimes en clair. `VerificationService.generate()` utilise `random.randint`, puis les handlers font des `print()` en debug et journalisent le code. | Exposition directe des OTP dans les logs, console, CI, et potentiellement des traces serveur. Un attaquant ayant acces aux logs peut bypasser la verification. | Ne jamais logger ni imprimer un OTP. Utiliser `secrets` pour generer les codes, supprimer tout `print` sensible, filtrer les payloads d evenements. |
| Critique | `frontend/src/features/auth/utils/auth-storage.ts`, `frontend/src/providers/websocket.provider.tsx`, `backend/notifications/consumers.py`, `backend/renseignementmedical/settings.py`, `backend/utilisateurs/views.py` | Les jetons JWT sont stockes dans `localStorage`, le WebSocket de notifications transporte le token dans l URL, et le logout ne revoque pas le refresh token. En plus, `BLACKLIST_AFTER_ROTATION = False` et la blacklist JWT est optionnelle. | Theft de session par XSS, historique navigateur, logs proxy, referer ou acces local a la machine. Un token vole peut rester reutilisable apres logout. | Passer a des cookies `HttpOnly`/`Secure` quand possible, supprimer le token de l URL, activer la blacklist JWT et l utiliser au logout, limiter strictement la duree de vie des tokens. |
| Critique | `backend/core/asgi.py`, `backend/notifications/consumers.py` | Aucune validation d origine WebSocket (`OriginValidator` / `AllowedHostsOriginValidator`) n est visible, alors que le consumer accepte un jeton en query string. | Surface de Cross-Site WebSocket Hijacking et ouverture de connexions depuis des origines non attendues. | Envelopper les routes websocket dans un validateur d origine, refuser les origines hors allowlist, sortir le jeton de l URL. |
| Eleve | `frontend/src/features/auth/hooks/useAuthRedirect.ts`, `frontend/src/app/[locale]/connexion/page.tsx`, `frontend/src/app/[locale]/inscription/page.tsx`, `frontend/src/features/auth/components/ProtectedRoute.tsx` | Le parametre `returnTo` est propage sans validation stricte. | Risque de redirection inattendue ou de navigation forcee vers un chemin non voulu par l application. | Autoriser uniquement des chemins internes relatifs verifies contre une allowlist. Refuser toute URL externe ou schema inattendu. |
| Eleve | `backend/renseignementmedical/settings.py`, `backend/utilisateurs/views.py`, `backend/utilisateurs/serializers.py`, `backend/utilisateurs/views_admin.py` | Enumeration de comptes et d etats d invitation via des messages differents: email deja utilise, utilisateur introuvable, code invalide, invitation en attente, etc. | Facilite le profiling de comptes, la reconnaissance des utilisateurs existants, et les attaques ciblees. | Uniformiser les reponses d auth, masquer les differences entre compte existant / absent quand possible, limiter les details renvoyes. |
| Eleve | `backend/core/verification/service.py`, `backend/core/verification/api.py`, `backend/utilisateurs/views.py` | OTP court a 4 chiffres, generation non cryptographiquement forte (`random`), et anti-bruteforce limite a un compteur applicatif par email. | Brute force plus simple qu il ne devrait l etre, surtout si les logs ou le canal email sont fragiles. | Passer a `secrets`, augmenter l entropie du code, reduire la duree de vie, ajouter un throttling par IP et par compte. |
| Eleve | `backend/renseignementmedical/settings.py` | `REST_FRAMEWORK` a `AllowAny` par defaut. | Toute nouvelle vue oubliee sans permission explicite devient publique par erreur. C est un risque structurel de fuite d API. | Inverser la strategie: permission par defaut plus stricte, et ouverture explicite seulement sur les vues publiques. |
| Eleve | `backend/renseignementmedical/settings.py`, `frontend/src/lib/axios.ts` | CORS credentials active et frontend/ backend relies par variables d environnement; si l allowlist est mal reglee en prod, les requetes credentiellees peuvent etre exposees a un domaine non voulu. | Exfiltration de session ou abus d API si la configuration de deploiement est trop large. | Verrouiller les origines autorisees par environnement, tester la config de prod, ne jamais utiliser d origine joker avec credentials. |
| Moyen | `frontend/src/features/shared/settings/components/PushNotificationsCard.tsx`, `frontend/src/providers/websocket.provider.tsx` | Le navigateur manipule directement les jetons et les subscriptions push; pas de durcissement visible contre un script injecte. | Si une XSS apparait, elle peut voler les tokens, la subscription push ou manipuler la connexion temps reel. | Ajouter une CSP stricte, reduire la surface de scripts inline, stocker les secrets cote serveur autant que possible. |
| Moyen | `frontend/src/hooks/useSearchHistory.ts` | L historique de recherche medicale est persiste en `localStorage`. | Les requetes de sante de l utilisateur restent lisibles localement et par tout script injecte. | Limiter la retention, chiffrer cote serveur si necessaire, ou stocker en session volatile selon la politique de confidentialite. |
| Moyen | `backend/structures/views.py`, `backend/search/views_public.py` | Les endpoints publics renvoient des donnees sensibles de localisation et de contact des structures (coords GPS, telephone, adresse, disponibilite). | Ce n est pas forcement un bug fonctionnel, mais c est une exposition de metadonnees sensibles si le perimetre public n est pas voulu. | Valider que cette exposition est bien intentionnelle; sinon redacter ou filtrer les champs publics. |
| Moyen | `backend/utilisateurs/views.py`, `backend/utilisateurs/services/auth_service.py` | Le login Google et l invitation renvoient des messages et statuts detaillees, et certains flux modifient le type d authentification d un compte existant apres correspondance d email. | Peut faciliter la reconnaissance d etats de compte et augmenter l impact d un compte email compromis. | Unifier les messages, limiter les details, imposer des validations supplementaires selon le role et le contexte. |

## Points positifs

- Les permissions metiers sont presentes sur beaucoup de vues sensibles.
- Les tests couvrent une partie importante du moteur de recherche et des flux publics.
- Les secrets de production sont prevus via variables d environnement.
- Le projet utilise JWT et des controles de role, ce qui est une bonne base si la gestion de session est durcie.

## Priorites de remediations

1. Supprimer toute fuite de secret et de code OTP.
2. Revoir totalement la gestion des tokens JWT et du logout.
3. Sortir le token des URLs WebSocket et ajouter une validation d origine.
4. Valider strictement `returnTo`.
5. Durcir les politiques par defaut: permissions API, CORS, CSP, logs.
6. Revoir l historique de recherche medicale et sa retention cote navigateur.

## Conclusion

Le code est fonctionnel, mais il n est pas encore au niveau de securite attendu
pour une application medicale multi-pays. Les risques les plus urgents sont la
fuite de secrets, la persistance des jetons en navigateur, la revelation des OTP
dans les logs et le transport des jetons WebSocket dans l URL. Tant que ces
points ne sont pas corriges, le projet reste exposable a un vol de session ou a
une compromission d acces.
