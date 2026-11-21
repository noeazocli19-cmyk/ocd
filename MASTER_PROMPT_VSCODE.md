# MASTER PROMPT — IA VS Code (Copilot / Cursor / Continue)

> Copie ce texte entier dans ton IA VS Code quand tu travailles sur le projet OCD.
> Elle contient TOUT le contexte : stack, règles de marque, intégrité, architecture, priorités.

---

## CONTEXTE DU PROJET

Tu travailles sur **OCD**, une plateforme communautaire & entrepreneuriale en prototype, destinée à être présentée à **Bovann** (porteur de la vision OCD). C'est une **proposition de démonstration** — ce n'est PAS un site officiel lancé. Tu dois toujours respecter les règles ci-dessous sans exception.

## STACK TECHNIQUE (NE PAS CHANGER)

- **Next.js 16** (App Router) + **TypeScript 5** strict
- **Tailwind CSS 4** + **shadcn/ui** (style New York) + **Lucide React** (icônes)
- **Framer Motion** — animations sobres et ciblées uniquement
- **Prisma ORM** — actuellement en SQLite pour la démo locale, à migrer vers **PostgreSQL (Neon)**
- Authentification maison : sessions en base (table `sessions`), mots de passe hashés (bcrypt)
- Validation : **Zod** côté serveur sur toutes les entrées API
- Déploiement cible : **Vercel**
- Gestionnaire de paquets : **pnpm**

## IDENTITÉ DE MARQUE (RÈGLES ABSOLUES)

1. Le nom est **« OCD »** uniquement. Interdiction absolue d'écrire « OCD Network », « OCD Community », « OCD Connect » ou tout autre suffixe.
2. Couleurs officielles :
   - Orange principal : `#F07819` (accent unique — aucun bleu, aucun indigo)
   - Noir : `#111111`
   - Blanc : `#FFFFFF`
   - Gris clair : `#F5F5F5`
   - Gris secondaire : `#777777`
   - Fond sombre : `#171717`
3. Le logo officiel est `public/images/ocd-logo.png` — **ne jamais le redessiner, le déformer ou le remplacer** par une icône générique.
4. Les photos de Bovann (`public/images/bovann-real-1.png`, `bovann-real-2.png`) sont des **photos réelles** : ne jamais générer de nouveau visage, modifier son apparence ou la remplacer. Elle s'affichent en grand format éditorial (pas en simple vignette décorative).
5. Slogan principal : « LES OPPORTUNITÉS SONT DEHORS. »

## RÈGLES D'INTÉGRITÉ (NON NÉGOCIABLES)

1. **Ne jamais inventer** : biographie, diplômes, citations, chiffres, statistiques, témoignages ou accomplissements de Bovann.
2. Les informations non fournies s'affichent comme **« champ réservé à l'équipe OCD »** (design élégant, jamais de faux contenu).
3. Toute donnée de démonstration doit être marquée `isDemo: true` en base ET visuellement signalée (« Donnée de démonstration »).
4. Toute fonctionnalité non implémentée doit afficher honnêtement un badge **« Bientôt disponible »** — jamais de faux boutons qui prétendent fonctionner.
5. Le footer et la page d'accueil mentionnent que le site est un **prototype de proposition**, pas un site officiel lancé.

## ARCHITECTURE EXISTANTE

```
src/
  app/
    page.tsx              → Accueil (hero, philosophie, Bovann, réalisations, CTA)
    vision/               → La vision (3 piliers : RENCONTRER / APPRENDRE / AGIR)
    bovann/               → Page dédiée Bovann (contenus vérifiés uniquement)
    realisations/         → Réalisations documentées
    communaute/           → Aperçu communauté
    evenements/           → Événements
    connexion/ inscription/ → Auth
    espace/               → Espace membre
    admin/                → Back-office (Super admin / Admin / Modérateur)
    api/                  → Routes API REST (auth, posts, events, achievements, etc.)
  components/
    site/                 → Sections de la landing page
    app/                  → Shell espace membre
    admin/                → Shell admin
    ui/                   → Composants shadcn/ui
  lib/                    → db.ts (client Prisma), auth, validations Zod
prisma/schema.prisma      → 24 modèles : User, Profile, Post, Comment, Reaction,
                            Connection, Follow, Group, GroupMember, Conversation,
                            Message, Notification, Event, EventRegistration,
                            Achievement, Gallery, GalleryMedia, Report,
                            Announcement, SiteContent, Session…
```

Les contenus éditoriaux (textes Bovann, présentations) sont stockés dans la table `site_content` (clés `bovann.*`) et modifiables depuis `/admin`.

## RÔLES UTILISATEUR

- `SUPER_ADMIN` : accès total, gestion des admins
- `ADMIN` : gestion contenus Bovann, réalisations, événements, galerie, annonces
- `MODERATEUR` : modération des posts, signalements
- `MEMBRE` : espace membre standard

## PRIORITÉS DE DÉVELOPPEMENT (DANS L'ORDRE)

### Phase 1 — Déjà fait ✅
Landing page complète, pages publiques, auth de base, back-office sommaire.

### Phase 2 — Migration Neon + fiabilisation (À FAIRE EN PREMIER)
1. Basculer `prisma/schema.prisma` : `provider = "postgresql"`, `DATABASE_URL` pointant vers Neon (`?sslmode=require`)
2. Remplacer les types SQLite non supportés (recréer les enums Prisma, utiliser `DateTime`, `String[]` si pertinent)
3. `pnpm prisma db push` sur Neon + relancer le seed (`pnpm db:seed`)
4. Vérifier toutes les routes API avec la nouvelle base
5. Configurer `.env` pour Vercel

### Phase 3 — Espace membre complet
1. Onboarding 5 étapes obligatoire après inscription (profil → compétences → intérêts → photo → confirmation)
2. Fil d'actualité (posts, médias, commentaires, réactions)
3. Recherche et découverte de membres (filtres : domaine, ville, compétences)
4. Groupes (création, adhésion, posts de groupe)
5. Événements (création, inscription, gestion des participants)
6. Profil membre public (experiences, projets, connexions)
7. Notifications (badge temps réel léger — polling suffisant)

### Phase 4 — Admin complet
1. CRUD contenus Bovann (`site_content` clés `bovann.*`) avec aperçu live
2. CRUD réalisations + galerie + événements + annonces
3. Gestion membres (rôles, blocage, suppression)
4. Modération (signalements, file de traitement)

### Phase 5 — Bonus (seulement si le reste est fini)
- Messagerie privée temps réel (Pusher ou socket.io)
- Recommandations intelligentes de membres/groupes
- Upload d'images via Cloudinary

## CONVENTIONS DE CODE

- Composants serveur par défaut ; `"use client"` uniquement quand nécessaire
- API routes REST (`/api/...`) — pas de server actions
- Zod pour valider tout corps de requête
- Pages dynamiques : `export const dynamic = "force-dynamic"` quand elles lisent la base
- Loading states : skeletons shadcn/ui
- Empty states soignés (icône Lucide + message + action)
- Accessibilité : HTML sémantique, aria-labels, focus visible, contrastes AA
- Responsive mobile-first obligatoire
- Footer collé en bas : wrapper `min-h-screen flex flex-col` + footer `mt-auto`
- Aucun emoji dans le code ni dans l'UI
- Typographie : titres en majuscules avec point final (« ...DEHORS. ») pour l'esprit OCD

## COMMANDES

```bash
pnpm dev           # développement (port 3000)
pnpm lint          # vérification ESLint — toujours propre avant de livrer
pnpm db:push       # synchroniser le schéma Prisma
pnpm db:seed       # données de démonstration (marquées isDemo)
pnpm build         # build production (Vercel)
```

## MÉTHODE DE TRAVAIL

1. Avant toute modification, lis les fichiers existants concernés — n'invente pas la structure.
2. Fais des modifications incrémentales et vérifie avec `pnpm lint` après chaque étape.
3. Si une information manque (texte Bovann, chiffres), utilise le pattern « champ réservé » — ne comble JAMAIS avec du contenu inventé.
4. Toute nouvelle fonctionnalité doit suivre les règles de marque (orange #F07819, logo officiel, nom « OCD » seul).
5. En cas de doute sur une règle d'intégrité, demande plutôt que d'inventer.
