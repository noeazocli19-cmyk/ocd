# OCD — Prototype de démonstration

Site prototype pour la présentation du projet OCD à Bovann.
Nom de marque : **OCD** uniquement (jamais OCD Network, OCD Community, etc.).

## Démarrage rapide (avec pnpm)

```bash
pnpm install
cp .env.example .env        # puis renseigner DATABASE_URL (Neon) et autres variables
pnpm prisma db push         # créer/synchroniser le schéma sur Neon
pnpm prisma db seed         # optionnel : données de démonstration (marquées isDemo)
pnpm dev                    # http://localhost:3000
```

## Variables d'environnement requises (.env)

```env
DATABASE_URL="postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/ocd?sslmode=require"
```

## Stack technique

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui (New York) + Lucide icons
- Framer Motion (animations sobres)
- Prisma ORM + PostgreSQL (Neon)
- Authentification maison (sessions en base, bcrypt)

## Couleurs de marque

- Orange principal : `#F07819`
- Noir : `#111111`
- Blanc : `#FFFFFF`
- Gris clair : `#F5F5F5`
- Gris secondaire : `#777777`
- Fond sombre : `#171717`

## Assets officiels

- `public/images/ocd-logo.png` — logo officiel OCD (ne pas redessiner, ne pas remplacer)
- `public/images/ocd-projets.png` — bandeau OCD Projets
- `public/images/bovann-real-1.png` / `bovann-real-2.png` — photos réelles de Bovann (ne pas modifier le visage)

## Règles d'intégrité (IMPORTANTES)

1. **Aucune biographie, diplôme, citation ou chiffre inventé** pour Bovann. Les champs non fournis sont affichés comme « champs réservés à l'équipe OCD ».
2. Les données de démonstration sont marquées `isDemo` en base et visuellement signalées « Donnée de démonstration ».
3. Les fonctionnalités non encore implémentées sont présentées honnêtement (badge « Bientôt disponible »), jamais comme terminées.
4. Ce prototype n'est pas un site officiel lancé : c'est une **proposition de démonstration**.

## Structure des pages

| Route | Description |
|---|---|
| `/` | Page d'accueil (hero, philosophie, Bovann, réalisations, communauté, fonctionnalités, événements, CTA) |
| `/vision` | La vision OCD (3 piliers : RENCONTRER / APPRENDRE / AGIR) |
| `/bovann` | Page dédiée à Bovann (contenus vérifiés uniquement) |
| `/realisations` | Réalisations documentées |
| `/communaute` | Aperçu de la communauté |
| `/evenements` | Événements |
| `/connexion` | Connexion |
| `/inscription` | Inscription + onboarding |
| `/espace` | Espace membre (prototypé) |
| `/admin` | Back-office (Super admin / Admin / Modérateur) |

## Comptes de démonstration (si seed exécuté)

Les comptes de démo sont créés par le seed et marqués `isDemo` :
- Membre : `demo@ocd.site` / `demo1234`
- Admin : `admin@ocd.site` / `admin1234`
- Super admin : `superadmin@ocd.site` / `superadmin1234`

(À changer immédiatement avant toute mise en ligne réelle.)
