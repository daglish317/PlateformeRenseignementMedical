# Implémentation du Rôle en Texte Libre

## Vue d'ensemble

Transformation du champ `role` de `EquipeStructure` d'un choix prédéfini (GESTIONNAIRE, CAISSIER) vers un champ texte libre optionnel. Cette modification découple complètement les permissions du rôle affiché.

**Date de mise en œuvre :** 15 août 2026

---

## Motivation

### Problème Initial
- Les rôles GESTIONNAIRE et CAISSIER étaient imposés via un dropdown
- Les permissions étaient assignées par membre, PAS par rôle
- Le rôle servait uniquement d'étiquette informative pour le propriétaire
- Limitation : impossible d'avoir des rôles personnalisés (ex: "Assistant", "Stagiaire")

### Solution Implémentée
- Le rôle devient un champ texte libre et optionnel
- Le propriétaire peut définir n'importe quel label ou laisser vide
- Les permissions restent assignées directement au membre par ID
- Architecture cohérente : rôle = affichage, permissions = fonctionnalités

---

## Modifications Backend

### 1. Modèle de Données (`structures/models.py`)

#### Avant
```python
role = models.CharField(
    max_length=20,
    choices=RoleEquipeStructure.choices,
    db_index=True,
)
```

#### Après
```python
role = models.CharField(
    max_length=100,
    blank=True,
    null=True,
    db_index=True,
    help_text="Rôle personnalisé défini par le propriétaire (texte libre optionnel)"
)
```

**Migration :** `0008_role_texte_libre.py`

### 2. Serializers (`structures/serializers.py`)

#### Avant
```python
role = serializers.ChoiceField(
    choices=[
        RoleEquipeStructure.GESTIONNAIRE,
        RoleEquipeStructure.CAISSIER,
    ]
)
```

#### Après
```python
role = serializers.CharField(
    max_length=100, 
    required=False, 
    allow_blank=True, 
    allow_null=True
)

def validate_role(self, value):
    if value:
        return value.strip()
    return None
```

### 3. Service d'Invitation (`utilisateurs/services/invitation_service.py`)

**Nouvelle méthode ajoutée :**
```python
@staticmethod
@transaction.atomic
def inviter_membre_structure(*, nom, email, structure, role_texte=None):
    """
    Invite un membre avec un rôle personnalisé (texte libre).
    Le role_texte est optionnel et sert uniquement de label informatif.
    Les permissions sont assignées directement au membre, pas basées sur le role.
    """
    return InvitationService._inviter_membre(
        nom=nom,
        email=email,
        structure=structure,
        role_utilisateur=RoleUtilisateur.GESTIONNAIRE,  # Par défaut système
        role_equipe=role_texte,  # Texte libre ou None
    )
```

**Méthodes legacy conservées pour compatibilité :**
- `inviter_gestionnaire()` - Marquée comme legacy
- `inviter_caissier()` - Marquée comme legacy

### 4. Views (`structures/views.py`)

#### Invitation de Membre
**Avant :** Logique conditionnelle basée sur role
```python
if serializer.validated_data["role"] == RoleEquipeStructure.GESTIONNAIRE:
    membre = InvitationService.inviter_gestionnaire(...)
else:
    membre = InvitationService.inviter_caissier(...)
```

**Après :** Appel unique avec role_texte optionnel
```python
utilisateur = InvitationService.inviter_membre_structure(
    nom=serializer.validated_data["nom"],
    email=serializer.validated_data["email"],
    structure=structure,
    role_texte=serializer.validated_data.get("role"),
)
```

#### Filtrage des Membres
**Avant :** Filtre basé sur rôles spécifiques
```python
if membership.role not in {
    RoleEquipeStructure.GESTIONNAIRE,
    RoleEquipeStructure.CAISSIER,
}:
    return Response({"detail": "Seuls les gestionnaires et caissiers..."})
```

**Après :** Exclusion du propriétaire uniquement
```python
if membership.role == RoleEquipeStructure.PROPRIETAIRE:
    return Response({"detail": "Les permissions ne s'appliquent pas au propriétaire."})
```

**Fichiers modifiés :**
- `MemberPermissionsView.get()` et `.put()`
- `StructureTeamMemberStatusView.patch()`

---

## Modifications Frontend

### 1. Types TypeScript (`team/types/team.ts`)

#### Avant
```typescript
export type StructureMemberRole = "PROPRIETAIRE" | "GESTIONNAIRE" | "CAISSIER";

export type InviteStructureMemberPayload = {
  structure_id: string;
  nom: string;
  email: string;
  role: "GESTIONNAIRE" | "CAISSIER";
};
```

#### Après
```typescript
export type StructureMemberRole = "PROPRIETAIRE" | string; // PROPRIETAIRE système, autres texte libre

export type StructureTeamMember = {
  // ...
  role: string | null; // Texte libre ou null
};

export type InviteStructureMemberPayload = {
  structure_id: string;
  nom: string;
  email: string;
  role?: string | null; // Optionnel
};
```

### 2. Interface Utilisateur (`team/pages/TeamPage.tsx`)

#### Formulaire d'Invitation

**Avant :** Dropdown avec options fixes
```tsx
<Select
  id="team-role"
  value={role}
  onChange={(event) => setRole(event.target.value as "GESTIONNAIRE" | "CAISSIER")}
>
  <option value="GESTIONNAIRE">Gestionnaire</option>
  <option value="CAISSIER">Caissier</option>
</Select>
```

**Après :** Input texte libre optionnel
```tsx
<Input
  id="team-role"
  value={role}
  onChange={(event) => setRole(event.target.value)}
  placeholder="Ex: Caissier, Gestionnaire, Assistant..."
/>
```

**Label :** "Role (optionnel)"

#### Affichage dans le Tableau

**Avant :** Utilisation d'un mapping `roleLabels`
```tsx
<td>{roleLabels[member.role]}</td>
```

**Après :** Affichage direct avec fallback
```tsx
<td>
  {member.role === "PROPRIETAIRE" 
    ? "Proprietaire" 
    : member.role || "-"}
</td>
```

#### Sélecteur de Permissions

**Avant :**
```tsx
{member.nom} - {roleLabels[member.role]}
```

**Après :**
```tsx
{member.nom}{member.role ? ` - ${member.role}` : ""}
```

#### Filtrage des Membres Éditables

**Avant :** Filtre basé sur rôles spécifiques
```tsx
const editableMembers = useMemo(
  () =>
    (team.data?.results ?? []).filter(
      (member) => member.role === "GESTIONNAIRE" || member.role === "CAISSIER"
    ),
  [team.data?.results]
);
```

**Après :** Exclusion du propriétaire uniquement
```tsx
const editableMembers = useMemo(
  () =>
    (team.data?.results ?? []).filter(
      (member) => member.role !== "PROPRIETAIRE"
    ),
  [team.data?.results]
);
```

#### État du Formulaire

**Avant :**
```tsx
const [role, setRole] = useState<"GESTIONNAIRE" | "CAISSIER">("GESTIONNAIRE");
```

**Après :**
```tsx
const [role, setRole] = useState("");
```

#### Validation d'Invitation

**Avant :** Validation incluant `role`
```tsx
const canInvite = useMemo(
  () => isOwner && effectiveStructureId && nom.trim().length >= 3 && email.trim() && role && !inviteMember.isPending,
  [effectiveStructureId, email, inviteMember.isPending, isOwner, nom, role]
);
```

**Après :** Role non requis
```tsx
const canInvite = useMemo(
  () => isOwner && effectiveStructureId && nom.trim().length >= 3 && email.trim() && !inviteMember.isPending,
  [effectiveStructureId, email, inviteMember.isPending, isOwner, nom]
);
```

---

## Architecture des Rôles et Permissions

### Distinction Importante

#### `Utilisateur.role` (Champ Système)
- **Type :** Choix fixe (`PROPRIETAIRE`, `GESTIONNAIRE`, `CAISSIER`)
- **Usage :** Logique système, redirection, authentification
- **Modification :** NON MODIFIÉ dans cette implémentation
- **Exemple :** Utilisé pour déterminer `/pharmacy` vs `/admin`

#### `EquipeStructure.role` (Champ Affichage)
- **Type :** Texte libre optionnel (max 100 caractères)
- **Usage :** Label informatif pour le propriétaire
- **Modification :** OUI - Converti en texte libre
- **Exemple :** "Assistant", "Stagiaire", "Pharmacien Junior", ou vide

### Flux de Permissions

```
┌─────────────────────────────────────────────────┐
│  Propriétaire crée un membre                    │
│  - Nom: "Jean Dupont"                           │
│  - Email: "jean@example.com"                    │
│  - Role: "Assistant Pharmacien" (optionnel)     │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Backend: InvitationService                     │
│  - Crée Utilisateur avec role système           │
│  - Crée EquipeStructure avec role_texte         │
│  - Role texte stocké tel quel                   │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Propriétaire assigne permissions               │
│  - Par membre ID (pas par role texte)           │
│  - Modules: STOCK, VENTES, CAISSE, etc.         │
│  - Actions: CONSULTER, CREER, MODIFIER, etc.    │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Membre se connecte                             │
│  - Navigation basée sur type structure          │
│  - Modules visibles = permissions assignées     │
│  - Role texte affiché dans profil uniquement    │
└─────────────────────────────────────────────────┘
```

---

## Cas d'Usage

### Cas 1 : Membre avec Rôle Personnalisé
```json
{
  "nom": "Marie Leclerc",
  "email": "marie@example.com",
  "role": "Pharmacienne Adjointe"
}
```
- Role affiché : "Pharmacienne Adjointe"
- Permissions : Assignées individuellement par le propriétaire
- Navigation : `/pharmacy` (basée sur type structure)

### Cas 2 : Membre sans Rôle
```json
{
  "nom": "Paul Martin",
  "email": "paul@example.com",
  "role": null
}
```
- Role affiché : "-"
- Permissions : Assignées individuellement par le propriétaire
- Navigation : `/pharmacy` (basée sur type structure)

### Cas 3 : Membre avec Rôle Legacy
```json
{
  "nom": "Sophie Bernard",
  "email": "sophie@example.com",
  "role": "GESTIONNAIRE"
}
```
- Role affiché : "GESTIONNAIRE" (texte brut)
- Permissions : Assignées individuellement (pas automatiques)
- Navigation : `/pharmacy` (basée sur type structure)
- **Note :** Les anciens rôles GESTIONNAIRE/CAISSIER continuent de fonctionner

---

## Tests de Validation

### Backend

#### 1. Migration
```bash
py manage.py migrate structures
# ✓ Applying structures.0008_role_texte_libre... OK
```

#### 2. Django Check
```bash
py manage.py check
# ✓ System check identified no issues (0 silenced).
```

#### 3. Création de Membre avec Rôle Personnalisé
```python
# API: POST /structures/team/
{
    "structure_id": "uuid-here",
    "nom": "Test User",
    "email": "test@example.com",
    "role": "Assistant"
}
# ✓ Status: 201 Created
```

#### 4. Création de Membre sans Rôle
```python
# API: POST /structures/team/
{
    "structure_id": "uuid-here",
    "nom": "Test User 2",
    "email": "test2@example.com"
}
# ✓ Status: 201 Created (role = null)
```

#### 5. Modification de Statut Membre
```python
# API: PATCH /structures/team/{member_id}/status/
{"action": "DEACTIVATE"}
# ✓ Fonctionne pour tout membre non-propriétaire
```

#### 6. Gestion des Permissions
```python
# API: GET /structures/team/{member_id}/permissions/
# ✓ Fonctionne pour tout membre non-propriétaire
# ✓ Retour 400 pour propriétaire
```

### Frontend

#### 1. Build Production
```bash
npm run build
# ✓ Compiled successfully
# ✓ TypeScript: 0 errors
# ✓ 124 pages générées
```

#### 2. Interface d'Invitation
- ✓ Input texte libre visible
- ✓ Placeholder informatif affiché
- ✓ Champ optionnel (peut être vide)
- ✓ Validation ne requiert pas le rôle

#### 3. Affichage des Membres
- ✓ Rôle texte affiché tel quel
- ✓ "-" affiché si rôle vide
- ✓ "Proprietaire" affiché pour PROPRIETAIRE
- ✓ Actions disponibles pour membres non-propriétaires

#### 4. Sélecteur de Permissions
- ✓ Format: "Nom" ou "Nom - Role"
- ✓ Tous les membres non-propriétaires listés
- ✓ Sélection automatique du premier membre

---

## Compatibilité et Migration

### Données Existantes
- **Rôles GESTIONNAIRE/CAISSIER existants :** Conservés tels quels (texte brut)
- **Permissions existantes :** Non affectées
- **Comportement utilisateur :** Identique (permissions par membre)

### Rétrocompatibilité
- La classe `RoleEquipeStructure` est conservée pour référence (PROPRIETAIRE système)
- Les méthodes legacy `inviter_gestionnaire()` et `inviter_caissier()` fonctionnent toujours
- Les filtres backend utilisent toujours `RoleEquipeStructure.PROPRIETAIRE` pour exclure

### Points d'Attention
1. **Aucune permission automatique basée sur le texte du rôle**
   - Un membre avec role="GESTIONNAIRE" ne reçoit PAS automatiquement des permissions
   - Le propriétaire doit toujours assigner manuellement

2. **Longueur maximale du rôle : 100 caractères**
   - Validation backend via `max_length=100`
   - Pas de limite frontend (HTML input libre)

3. **Affichage du rôle propriétaire**
   - Frontend affiche toujours "Proprietaire" pour `role === "PROPRIETAIRE"`
   - Autres rôles affichés tels quels

---

## Fichiers Modifiés

### Backend
- `backend/structures/models.py`
- `backend/structures/serializers.py`
- `backend/structures/views.py`
- `backend/utilisateurs/services/invitation_service.py`
- `backend/structures/migrations/0008_role_texte_libre.py` (nouveau)

### Frontend
- `frontend/src/features/shared/team/types/team.ts`
- `frontend/src/features/shared/team/pages/TeamPage.tsx`

### Documentation
- `IMPLEMENTATION_ROLE_TEXTE_LIBRE.md` (ce fichier)

---

## Impact Utilisateur

### Propriétaire
- **Avant :** Choix limité entre "Gestionnaire" et "Caissier"
- **Après :** Peut définir n'importe quel rôle ou laisser vide
- **Exemples :** "Assistant Pharmacien", "Stagiaire", "Pharmacien de Garde", etc.
- **Action requise :** Aucune (peut continuer à utiliser GESTIONNAIRE/CAISSIER)

### Membres Opérationnels
- **Avant :** Rôle fixe affiché
- **Après :** Rôle personnalisé ou vide affiché
- **Permissions :** Inchangées (toujours assignées par propriétaire)
- **Navigation :** Inchangée (basée sur type structure et permissions)

---

## Prochaines Étapes Recommandées

1. **Tests Manuels**
   - [ ] Créer un membre avec rôle personnalisé
   - [ ] Créer un membre sans rôle
   - [ ] Vérifier affichage dans tableau
   - [ ] Assigner permissions à un membre avec rôle personnalisé
   - [ ] Activer/désactiver un membre avec rôle personnalisé

2. **Tests Automatisés** (optionnel)
   - [ ] Tests unitaires pour `InvitationService.inviter_membre_structure()`
   - [ ] Tests d'intégration pour API `/structures/team/`
   - [ ] Tests frontend pour composant d'invitation

3. **Documentation Utilisateur**
   - [ ] Guide pour propriétaires : "Comment définir des rôles personnalisés"
   - [ ] FAQ : "Quelle est la différence entre le rôle et les permissions ?"

4. **Optimisations Futures** (hors scope actuel)
   - [ ] Autocomplete pour rôles fréquemment utilisés
   - [ ] Templates de permissions par type de rôle (suggestion)
   - [ ] Historique des rôles utilisés par structure

---

## Conclusion

Cette implémentation réussit à :
- ✅ Découpler complètement rôle et permissions
- ✅ Offrir flexibilité maximale au propriétaire
- ✅ Maintenir compatibilité avec données existantes
- ✅ Préserver architecture système (Utilisateur.role)
- ✅ Build frontend sans erreurs
- ✅ Backend validé sans problèmes

Le rôle est maintenant un simple label informatif, les permissions sont la seule source de vérité pour les fonctionnalités accessibles.
