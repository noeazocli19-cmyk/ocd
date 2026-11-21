# 6-c — Espace membre : dashboard, fil d'actualité, découvrir, membres

## Fichiers créés
- `src/app/espace/page.tsx` — server page (metadata noindex, title "Tableau de bord — OCD") → `<DashboardView />`
- `src/app/espace/dashboard-view.tsx` — accueil personnalisé : bienvenue + date longue FR (rAF), complétude du profil (bio/avatar/profession/pays-ville/compétences via GET /api/profile, Progress), 3 dernières publications (GET /api/posts?authorId=&limit=3 avec PostCard + onUpdate/onDelete locaux), 5 dernières notifications (lignes icône+titre+timeAgo), recommandations membres (?recommended=1), groupes (slice 4, GROUP_LABELS), événements à venir (?upcoming=1&limit=3, badge "Exemple" si isDemo). Skeletons + états vides partout, "Voir tout" sur chaque section.
- `src/app/espace/fil/page.tsx` + `fil-view.tsx` — PostComposer en haut (onCreated → reload + scrollIntoView du feed), pills catégories (Tous + POST_CATEGORIES, actif orange), feed paginé cursor (?limit=10&category=&cursor=), bouton "Charger plus" (Loader2), reset au changement de catégorie, 4 skeletons PostCard-like, mises à jour locales onUpdate/onDelete.
- `src/app/espace/decouvrir/page.tsx` + `decouvrir-view.tsx` — recherche au submit (q, pays 19 options, profession libre, domaine 11 options, Rechercher/Réinitialiser), résultats limit=24 en grille de cartes premium (bandeau cover h-20 gradient + Image si coverUrl, Avatar chevauchant, badge Démo, MapPin, bio line-clamp-2, _count.posts, Voir le profil), section recommandations (recommended=1, 6 cartes) avec état vide + lien parametres.
- `src/app/espace/membres/page.tsx` + `membres-view.tsx` — grille membres récents (limit=24), pills Tous / Mon pays / Mon domaine (désactivées si profil incomplet), bouton "Se connecter" (POST /api/members/{id}/connections : PENDING → toast "Demande envoyée" + état local désactivé, ACCEPTED → "Déjà connectés", CANCELLED → "Demande annulée"), bouton icône follow (POST /api/members/{id}/follow), "Charger plus" (limit += 24, max 60), état self "C'est toi".
- `src/app/espace/membres/[id]/page.tsx` — server page `params: Promise<{id}>` (Next 16) → `<ProfilView id={...} />`, metadata noindex.
- `src/app/espace/membres/[id]/profil-view.tsx` — cover h-40 (coverUrl ou gradient sombre bg-grid-ocd + halo orange), Avatar xl ring chevauchant, badge Démo/Te suit, profession, lieu, badge niveau d'expérience, "Membre depuis" formatDateLong, actions Se connecter/Demande envoyée/Connectés + Répondre à la demande (PENDING reçu), Suivre/Abonné, Message (POST /api/conversations → push /espace/messages?c=id), stats dl (posts/followsSent/followsReceived/groupMemberships), Tabs Publications (PostCard) / À propos (bio, skills, interests, expériences timeline, projets avec statuts Idée/En cours/Lancé) / Réseaux (liens externes normalisés https, sinon "Réseaux non renseignés"), 404 → "Membre introuvable" + retour.

## Conventions respectées
- "use client" uniquement dans les views ; metadata noindex + titles français sur les 5 pages.
- Fetchs via `api.*` de @/lib/client ; pattern `cancelled` + rAF (aucun setState synchrone dans les useEffect) ; pas d'`any` ; pas de `<img>` (next/image partout) ; toasts sonner français.
- Aucune modification de fichiers partagés, APIs, layout, globals.css, schéma Prisma ou package.json.

## Vérifications
- `bun run lint` → 0 erreur, 0 warning.
- `bunx tsc --noEmit` → 0 erreur sur les fichiers espace (seules erreurs restantes : examples/ et skills/, préexistantes, hors périmètre).

## Écarts / notes
- Le toggle "Se connecter" côté membres repose sur un état local (la liste /api/members n'expose pas la relation) : le statut initial est inconnu au chargement, conformément à la mission.
- GET /api/groups n'accepte pas de paramètre limit → slice(0, 4) côté client comme demandé.
