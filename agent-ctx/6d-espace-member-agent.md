# Tâche 6-d — Espace membre : groupes, messages, événements, notifications, paramètres

## Statut : TERMINÉ

## Fichiers créés (12)

### Groupes
- `src/app/espace/groupes/page.tsx` — server, metadata noindex (FR)
- `src/app/espace/groupes/groupes-view.tsx` — client : header + bouton "Créer un groupe" (Dialog), pills catégories (Tous + GROUP_LABELS), recherche au submit, grille de cartes (Image ou bandeau gradient + UsersRound), badges "À la une"/catégorie/"Membre", stats membres·publications, Rejoindre (POST /api/groups/{id}/members → toast "Bienvenue dans le groupe") / Quitter (AlertDialog → DELETE, erreur API toastée, ex. dernier admin), création (POST /api/groups → ajout en tête), skeletons, 2 états vides ("Aucun groupe ne correspond." / "Aucun groupe n'existe encore pour cette catégorie.")

### Détail groupe
- `src/app/espace/groupes/[id]/page.tsx` — server, `params: Promise<{id}>` (Next 16)
- `src/app/espace/groupes/[id]/groupe-view.tsx` — client : bandeau (image ou gradient), nom, badge catégorie, description, stats, créateur (Avatar), bouton Rejoindre/Quitter/Badge rôle selon myMembership, carte membres (Avatar + nom + profession + badge Admin/Modérateur/Membre, max-h-96 overflow-y-auto), PostComposer si membre + fil PostCard (onUpdate/onDelete locaux, onCreated → refetch), encart "Rejoins ce groupe pour publier et commenter." si non membre, état 404 + skeleton.

### Messages
- `src/app/espace/messages/page.tsx` — server, wrap `<Suspense>` autour de la view (useSearchParams)
- `src/app/espace/messages/messages-view.tsx` — client : grille lg:grid-cols-[320px,1fr] + lg:h-[calc(100vh-4rem)] ; mobile = liste OU conversation plein écran (fixed inset-0) avec bouton retour ; liste GET /api/conversations (Avatar, snippet line-clamp-1, timeAgo, pastille orange unread) + filtre local par nom ; Dialog "Nouvelle discussion" avec recherche membres debouncée (350 ms, GET /api/members?q=) → POST /api/conversations → ouverture ; conversation ?c={id} : GET messages → bulles reçues bg-secondary / envoyées bg-[#F07819] text-white + heure, scroll auto bottom (ref), POST message → append + MAJ liste locale ; POLLING 5 s avec `?after={lastMessage.createdAt}` + flag cancelled au cleanup + dédoublonnage par id ; pas d'appel GET messages sans conversation sélectionnée ; état vide exact demandé.

### Événements
- `src/app/espace/evenements/page.tsx` + `evenements-view.tsx` — pills Tous + EVENT_LABELS, toggle "À venir / Tous" (upcoming=1 par défaut), cartes riches : image ou bg-grid-ocd, formatDateTime, badge catégorie, badge "Exemple de démonstration", lieu/"En ligne", organisateur, N inscrits, badge "Passé" en mode Tous ; M'y inscrire (POST → toast "Inscription confirmée" + MAJ locale) / Inscrit + Annuler (AlertDialog → DELETE → toast) ; état vide exact demandé.

### Notifications
- `src/app/espace/notifications/page.tsx` + `notifications-view.tsx` — bouton "Tout marquer comme lu" (POST {all:true}), Tabs Toutes/Non lues avec compteur, lignes cliquables avec icône par type (UserPlus, MessageCircle, ThumbsUp, MessageSquare, UsersRound, Megaphone, CalendarDays + fallback Bell), fond bg-[#F07819]/5 + pastille si non lue, clic → POST {ids:[id]} + router.push(linkUrl), état vide exact demandé.

### Paramètres
- `src/app/espace/parametres/page.tsx` + `parametres-view.tsx` — GET /api/profile pré-rempli ; carte couverture + carte profil (upload POST /api/upload → PATCH profile + refresh()); formulaire complet (Prénom, Nom, Biographie compteur 1200, Pays avec datalist, Ville, Profession, Domaine Select, Niveau Select, Site web, LinkedIn, X/Twitter, Instagram, WhatsApp) ; chips Compétences (max 20) et Centres d'intérêt (max 12) avec Enter/X ; "Enregistrer" → validation zod (URLs http(s) si remplies, auto-préfixe https://) → PATCH /api/profile complet → toast "Profil mis à jour" + refresh() ; layout 2 colonnes lg, skeletons.

## Vérifications
- `bun run lint` : **0 erreur, 0 warning** dans mes fichiers (1 warning préexistant dans `src/app/espace/membres/membres-view.tsx` — fichier d'un autre agent, non touché).
- `bunx tsc --noEmit | grep "espace/(groupes|messages|evenements|notifications|parametres)"` : **0 erreur** (seules erreurs tsc globales : `examples/` et `skills/`, hors périmètre et préexistantes).

## Écarts / notes
- Cartes groupes : lien carte = overlay absolu (stretched-link) avec boutons en z-10, plus fiable qu'un Link imbriquant des boutons.
- Messages : quand aucune discussion n'existe encore, l'appel polling utilise la même URL sans `after` avec dédoublonnage par id — évite les doublons si après=null.
- Domaine stocké comme libellé FR ("Entrepreneuriat", etc.) et niveau comme valeur enum (ETUDIANT, CONFIRME...), conformes à ce que l'onboarding écrit.
- Dev server injoignable depuis le shell au moment du test (curl 000) — vérifications faites via lint + tsc, conformément aux instructions (ne pas lancer dev/build soi-même).
