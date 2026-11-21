# CONTEXTE PROJET OCD — conventions et contrat API (source de vérité pour les sous-agents)

## Marque
- Nom : **OCD** uniquement (jamais "OCD Network" etc.)
- Baseline : **LES OPPORTUNITÉS SONT DEHORS.**
- Orange officiel : `#F07819` (accent principal, jamais en fond de page entière)
- Noir profond `#111111`, fond sombre `#171717`, gris clair `#F5F5F5`, gris `#777777`
- Langue de l'interface : **français**. Pas d'emojis dans le code.
- Prototype indépendant présenté à Bovann : JAMAIS d'invention de biographie, citation, chiffre ou statistique officielle. Les données fictives doivent être marquées « Démo » / « Exemple ».

## Stack
Next.js 16 App Router + TypeScript strict + Tailwind 4 + shadcn/ui (src/components/ui, style New York) + Framer Motion + lucide-react + sonner (toast : `import { toast } from "sonner"`).

## Tokens CSS disponibles (globals.css)
- Couleurs Tailwind standards via variables : `bg-background text-foreground bg-card text-muted-foreground bg-secondary text-primary border-input ring-ring` etc.
- Mode sombre automatique via `.dark` — toujours utiliser les tokens (pas de couleurs codées en dur sauf orange OCD).
- `font-display` = police d'affichage Sora (titres).
- `.ocd-kicker` = surtitre orange avec trait (letter-spacing large, uppercase).
- `.bg-grid-ocd` = grille décorative. `.text-gradient-ocd` = dégradé orange sur texte. `.glow-ocd` = halo orange.
- `bg-ocd-dark text-white` = section sombre premium.
- Cartes : `rounded-2xl border bg-card p-6`. Hover premium : `hover:-translate-y-1 hover:border-[#F07819]/40 hover:shadow-xl transition-all duration-300`.
- Couleurs interdites : bleu/indigo.

## Composants partagés EXISTANTS (NE PAS MODIFIER — utiliser tels quels)
- `@/components/ocd-logo` → `<OcdLogo className="h-8" priority />` (logo officiel, ratio 850×334)
- `@/components/site/ocd-navbar` → `<OcdNavbar />` navbar publique fixe h-16 (prévoir `pt-16` sur le premier bloc des pages publiques)
- `@/components/site/ocd-footer` → `<OcdFooter />` footer public (sticky : wrapper `min-h-screen flex flex-col` + footer `mt-auto`)
- `@/components/site/section-reveal` → `<Reveal delay={0.1}>`, `<SectionHeading kicker title description align dark />`
- `@/components/community/avatar` → `<Avatar src firstName lastName size="xs|sm|md|lg|xl" ring className />`
- `@/components/community/post-card` → `<PostCard post currentUser onUpdate onDelete />` (réactions, commentaires imbriqués, édition/suppression). Types exportés : `FeedPost`, `FeedComment`, `FeedUser`, `CurrentUser`.
- `@/components/community/post-composer` → `<PostComposer currentUser groupId? onCreated />` (upload photo inclus)
- `@/components/app/user-provider` → `useUser()` → `{ user: EspaceUser, refresh }` (uniquement dans les pages sous /espace)
- `@/lib/client` → `api.get/post/patch/delete/upload(url, formData)`, `timeAgo(iso)`, `formatDateLong`, `formatDateTime`, `POST_CATEGORIES`, `POST_CATEGORY_LABELS`, `EVENT_LABELS`, `GROUP_LABELS`, `parseJsonArray(str)`, `initialsOf`
- `@/lib/utils` → `cn()`
- `@/components/ui/*` : tous les composants shadcn (Button, Card, Badge, Dialog, Tabs, Select, Input, Textarea, Skeleton, DropdownMenu, Sheet, Avatar, Separator, ScrollArea, Switch, Label, Alert, AlertDialog, Form...)

## Règles techniques
1. `"use client"` sur les composants interactifs. Les pages : fichier `page.tsx` (server, export `metadata` avec title/description français) + un fichier `*-view.tsx` client si nécessaire.
2. Jamais de `<img>` → toujours `next/image` (Image) avec width/height ou fill dans un conteneur `relative`.
3. Lint propre : PAS de `setState` synchrone dans le corps d'un `useEffect` (utiliser des callbacks/rAF/flags `cancelled` dans les promesses). Pas de `any`.
4. États obligatoires sur chaque vue de données : Skeleton pendant chargement, état vide soigné (icône + texte + action), gestion d'erreur (toast + message inline).
5. Responsive mobile-first (`sm: md: lg:`), cibles tactiles >= 44px, scrollbar `max-h-96 overflow-y-auto` pour les longues listes.
6. Accessibilité : `main`, `section` avec `aria-labelledby`, labels de formulaires, alt descriptifs.
7. Les fetches clients utilisent `api.*` de `@/lib/client` (credentials inclus automatiquement).
8. Ne jamais modifier : globals.css, layout.tsx, les composants listés ci-dessus, les routes API, le schéma Prisma, package.json.
9. Ne pas lancer `bun run dev`, `bun run build` ni toucher à la base de données. Écrire uniquement les fichiers demandés.

## Contrat API (toutes en français dans les messages d'erreur)
- `GET /api/auth/me` → `{ user: EspaceUser | null }`
- `POST /api/auth/login` `{email,password}` → `{id,firstName,onboardingCompleted,role}` | 401 "Email ou mot de passe incorrect."
- `POST /api/auth/register` `{email,password,firstName,lastName}` → 201 `{id,firstName,onboardingCompleted:false}` | 409 si email pris
- `POST /api/auth/logout` → `{success:true}`
- `GET /api/site-content` → `{ content: Record<key,value> }` (clés : bovann.fullName, bovann.tagline, bovann.presentation (""=non renseigné), bovann.photoUrl (""=photo non fournie), bovann.activities (JSON array string), bovann.socials (JSON array string [{label,url}]), bovann.journey (""=non renseigné), philosophy.editorial, contact.whatsapp, contact.whatsappLink, contact.email (""), contact.instagram (""), contact.linkedin (""))
- `GET /api/achievements` → `{ items: [{id,title,description,category,status,imageUrl,videoUrl,date,results(JSON string|null),media:[{url,type,caption}]}] }` (publiées uniquement)
- `GET /api/gallery?category=` → `{ items: [{id,url,type:"IMAGE"|"VIDEO",category,title,description}] }` (publiés uniquement)
- `GET /api/events?category=&upcoming=1&limit=` → `{ items: [{id,title,description,category,imageUrl,startDate,location,isOnline,onlineUrl,organizerName,isDemo,registered, _count:{registrations}}] }`
- `POST /api/events/[id]/register` → 201 | DELETE → annule | erreurs : "Tu es déjà inscrit", "Cet événement est complet."
- `GET /api/members?q=&country=&city=&profession=&domain=&recommended=1&limit=` (auth) → `{ items: MemberCard[], recommended: MemberCard[] }` — MemberCard = `{id,firstName,lastName,avatarUrl,coverUrl,bio,country,city,profession,domain,experienceLevel,interests,isDemo,createdAt,_count:{posts}}`
- `GET /api/members/[id]` (auth) → `{ member: {…, skills:[{id,name}], experiences:[], projects:[], _count:{posts,followsSent,followsReceived,groupMemberships}}, posts: FeedPost[], relation: {connection:{id,status,senderId}|null, iFollow, followsMe} }`
- `POST /api/members/[id]/connections` → toggle demande : `{status:"PENDING"|"ACCEPTED"|"CANCELLED"}` ; `POST /api/members/[id]/follow` → `{following:boolean}`
- `GET /api/connections` (auth) → `{ connections:[{id,member}], pendingIncoming:[{id,sender}], pendingOutgoing:[{id,receiver}] }`
- `PATCH /api/connections/[id]` `{action:"ACCEPT"|"REJECT"}`
- `GET /api/posts?cursor=&limit=&category=&groupId=&authorId=` (auth) → `{ items: FeedPost[], nextCursor: string|null }` — FeedPost inclut `user{...isDemo}`, `group{id,name,slug}`, `comments[]`, `_count{comments,reactions}`
- `POST /api/posts` `{content, category, imageUrl?, groupId?}` → FeedPost
- `POST /api/posts/[id]/reactions` `{type:"LIKE"|"CELEBRATE"|"INSPIRED"|"SUPPORT"}` → `{active,counts}`
- `POST /api/posts/[id]/comments` `{content, parentId?}`
- `GET /api/groups?category=&q=` (auth) → `{ items: [{id,name,slug,description,category,imageUrl,isFeatured,isDemo,_count:{members,posts},myMembership:{role}|null}] }`
- `POST /api/groups` `{name,description,category,imageUrl?}` ; `GET /api/groups/[id]` → `{ group:{..., members:[{id,role,joinedAt,user}], creator}, posts: FeedPost[], myMembership }`
- `POST /api/groups/[id]/members` (rejoindre) ; `DELETE` (quitter ; erreur si dernier admin)
- `GET /api/conversations` → `{ items: [{id, other:{user}, lastMessage:{content,createdAt,senderId}|null, unread, updatedAt}] }`
- `POST /api/conversations` `{userId}` → `{id}` ; `GET /api/conversations/[id]/messages?after=ISO` → `{ messages:[{id,content,mediaUrl,createdAt,sender:{id,firstName,lastName,avatarUrl}}], other }` ; `POST .../messages` `{content}`
- `GET /api/notifications` → `{ items:[{id,type,title,body,linkUrl,isRead,createdAt}], unreadCount }` ; `POST /api/notifications` `{all:true}` ou `{ids:[...]}`
- `GET /api/profile` → `{ profile }` (User complet + skills/experiences/projects/_count) ; `PATCH /api/profile` accepte : firstName,lastName,bio,country,city,profession,domain,experienceLevel,interests(string[]),avatarUrl,coverUrl,website,linkedin,twitter,instagram,whatsapp,skills(string[]),onboardingCompleted(boolean)
- `POST /api/upload` FormData `{file}` → `{url}` (webp optimisé, max 5 Mo)
