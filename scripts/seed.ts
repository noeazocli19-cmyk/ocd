/**
 * Seed OCD — environnement de démonstration.
 * RÈGLES RESPECTÉES :
 * - Tous les profils de démonstration sont flaggés isDemo (badge "Démo" affiché).
 * - Aucune biographie, citation, diplôme ou statistique n'est inventée pour Bovann.
 * - Les réalisations non documentées ne sont PAS publiées.
 * - Les coordonnées proviennent uniquement des visuels fournis (WhatsApp vérifié).
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";
import fs from "fs";
import path from "path";

const db = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

// ---------- Avatars SVG générés (initiales, palette OCD) ----------
const AVATAR_COLORS = [
  ["#F07819", "#ffffff"],
  ["#111111", "#F07819"],
  ["#B45309", "#ffffff"],
  ["#3D3D3D", "#FFB25C"],
  ["#FFB25C", "#111111"],
  ["#7C2D12", "#FFEDD5"],
];

function initialsAvatarSvg(initials: string, index: number): string {
  const [bg, fg] = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" rx="100" fill="${bg}"/>
  <text x="100" y="118" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700" text-anchor="middle" fill="${fg}">${initials}</text>
</svg>`;
}

function initialsCoverSvg(name: string, index: number): string {
  const [bg, fg] = AVATAR_COLORS[(index + 2) % AVATAR_COLORS.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300" viewBox="0 0 1200 300">
  <rect width="1200" height="300" fill="${bg}"/>
  <circle cx="1050" cy="60" r="180" fill="${fg}" opacity="0.08"/>
  <circle cx="180" cy="280" r="140" fill="${fg}" opacity="0.06"/>
  <text x="600" y="165" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="800" letter-spacing="6" text-anchor="middle" fill="${fg}" opacity="0.5">${name.toUpperCase()}</text>
</svg>`;
}

async function saveSvg(rel: string, content: string) {
  const full = path.join(process.cwd(), "public", rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  return `/${rel}`;
}

const DAYS = (n: number) => new Date(Date.now() + n * 864e5);

async function main() {
  console.log("Nettoyage...");
  await db.notification.deleteMany();
  await db.message.deleteMany();
  await db.conversationMember.deleteMany();
  await db.conversation.deleteMany();
  await db.reaction.deleteMany();
  await db.comment.deleteMany();
  await db.post.deleteMany();
  await db.groupMember.deleteMany();
  await db.group.deleteMany();
  await db.eventRegistration.deleteMany();
  await db.event.deleteMany();
  await db.achievementMedia.deleteMany();
  await db.achievement.deleteMany();
  await db.galleryMedia.deleteMany();
  await db.announcement.deleteMany();
  await db.connection.deleteMany();
  await db.follow.deleteMany();
  await db.skill.deleteMany();
  await db.experience.deleteMany();
  await db.project.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
  await db.siteContent.deleteMany();

  // ============ CONTENUS INSTITUTIONNELS ============
  console.log("Contenus institutionnels...");
  await db.siteContent.createMany({
    data: [
      { key: "bovann.fullName", value: "Bovann" },
      { key: "bovann.tagline", value: "Porteur de la vision OCD" },
      // Champs à compléter par l'équipe (jamais inventés) :
      { key: "bovann.presentation", value: "" },
      { key: "bovann.photoUrl", value: "" },
      { key: "bovann.activities", value: "[]" },
      { key: "bovann.socials", value: "[]" },
      { key: "bovann.journey", value: "" },
      // Texte éditorial proposé (non attribué comme citation de Bovann) :
      {
        key: "philosophy.editorial",
        value:
          "Derrière chaque ambition, il y a une vision. OCD porte une philosophie simple : les opportunités sont dehors. Il faut oser sortir, rencontrer, découvrir et agir.",
      },
      // Coordonnées vérifiées (issues du visuel OCD PROJETS fourni) :
      { key: "contact.whatsapp", value: "+229 01 54 46 19 25" },
      { key: "contact.whatsappLink", value: "https://wa.me/2290154461925" },
      { key: "contact.email", value: "" },
      { key: "contact.instagram", value: "" },
      { key: "contact.linkedin", value: "" },
    ],
  });

  // ============ COMPTES ============
  console.log("Comptes...");
  const admin = await db.user.create({
    data: {
      email: "admin@ocd.africa",
      passwordHash: hashPassword("ocd-admin-2025"),
      firstName: "Équipe",
      lastName: "OCD",
      role: "SUPER_ADMIN",
      profession: "Équipe OCD",
      country: "Bénin",
      city: "Cotonou",
      bio: "Compte administrateur du prototype OCD.",
      avatarUrl: await saveSvg("uploads/avatars/equipe-ocd.svg", initialsAvatarSvg("OCD", 1)),
      onboardingCompleted: true,
    },
  });

  const demo = await db.user.create({
    data: {
      email: "demo@ocd.africa",
      passwordHash: hashPassword("ocd-demo-2025"),
      firstName: "Awa",
      lastName: "Kponou",
      role: "MEMBER",
      profession: "Cheffe de projet digital",
      domain: "Technologie",
      experienceLevel: "INTERMEDIAIRE",
      country: "Bénin",
      city: "Cotonou",
      bio: "Compte de démonstration du prototype OCD. Ici pour découvrir la communauté, partager des idées et rencontrer des personnes ambitieuses.",
      avatarUrl: await saveSvg("uploads/avatars/awa-kponou.svg", initialsAvatarSvg("AK", 0)),
      coverUrl: await saveSvg("uploads/covers/awa-kponou.svg", initialsCoverSvg("Awa Kponou", 0)),
      interests: JSON.stringify(["Entrepreneuriat", "Technologie", "Réseautage"]),
      isDemo: true,
      onboardingCompleted: true,
    },
  });

  // ============ PROFILS DE DÉMONSTRATION (fictifs, flaggés) ============
  console.log("Profils de démonstration...");
  const demoUsersSpec = [
    { firstName: "Aïcha", lastName: "Diallo", profession: "Entrepreneure", domain: "Business", country: "Sénégal", city: "Dakar", experienceLevel: "CONFIRME", interests: ["Business", "Mode"], bio: "Profil de démonstration — entrepreneure passionnée de création de valeur." },
    { firstName: "Kouassi", lastName: "Yao", profession: "Développeur full-stack", domain: "Technologie", country: "Côte d'Ivoire", city: "Abidjan", experienceLevel: "INTERMEDIAIRE", interests: ["Technologie", "IA"], bio: "Profil de démonstration — développeur curieux et autonome." },
    { firstName: "Fatou", lastName: "Ndiaye", profession: "Créatrice de contenu", domain: "Création de contenu", country: "Sénégal", city: "Dakar", experienceLevel: "DEBUTANT", interests: ["Création de contenu", "Réseautage"], bio: "Profil de démonstration — créatrice en quête de collaborations." },
    { firstName: "Marc", lastName: "Adjovi", profession: "Freelance marketing", domain: "Marketing", country: "Bénin", city: "Cotonou", experienceLevel: "INTERMEDIAIRE", interests: ["Marketing", "Entrepreneuriat"], bio: "Profil de démonstration — freelance à la recherche de projets." },
    { firstName: "Sarah", lastName: "Mensah", profession: "Étudiante en gestion", domain: "Education", country: "Togo", city: "Lomé", experienceLevel: "ETUDIANT", interests: ["Éducation", "Réseautage"], bio: "Profil de démonstration — étudiante ambitieuse qui veut apprendre vite." },
    { firstName: "Ibrahim", lastName: "Keïta", profession: "Porteur de projet", domain: "Entrepreneuriat", country: "Mali", city: "Bamako", experienceLevel: "DEBUTANT", interests: ["Entrepreneuriat", "Agriculture"], bio: "Profil de démonstration — porteur de projet en phase d'idéation." },
    { firstName: "Grâce", lastName: "Mukendi", profession: "Designer graphique", domain: "Création de contenu", country: "RD Congo", city: "Kinshasa", experienceLevel: "CONFIRME", interests: ["Design", "Création de contenu"], bio: "Profil de démonstration — designer qui transforme les idées en visuels." },
    { firstName: "Yannick", lastName: "Sossou", profession: "Développeur web", domain: "Technologie", country: "Togo", city: "Lomé", experienceLevel: "DEBUTANT", interests: ["Technologie", "Freelance"], bio: "Profil de démonstration — développeur en apprentissage constant." },
    { firstName: "Awa", lastName: "Touré", profession: "Consultante finance", domain: "Finance", country: "Côte d'Ivoire", city: "Abidjan", experienceLevel: "EXPERT", interests: ["Finance", "Leadership"], bio: "Profil de démonstration — consultante qui conseille les jeunes entreprises." },
    { firstName: "Ousmane", lastName: "Barry", profession: "Formateur", domain: "Education", country: "Guinée", city: "Conakry", experienceLevel: "CONFIRME", interests: ["Éducation", "Développement personnel"], bio: "Profil de démonstration — formateur déterminé à transmettre." },
  ];

  type PrismaUser = Awaited<ReturnType<typeof db.user.create>>;
  const demoUsers: PrismaUser[] = [];
  for (let i = 0; i < demoUsersSpec.length; i++) {
    const spec = demoUsersSpec[i];
    const u = await db.user.create({
      data: {
        ...spec,
        interests: JSON.stringify(spec.interests),
        email: `demo${i + 1}@ocd.africa`,
        passwordHash: hashPassword(`demo-${randomBytes(8).toString("hex")}`),
        avatarUrl: await saveSvg(`uploads/avatars/demo${i + 1}.svg`, initialsAvatarSvg(`${spec.firstName[0]}${spec.lastName[0]}`, i)),
        coverUrl: await saveSvg(`uploads/covers/demo${i + 1}.svg`, initialsCoverSvg(`${spec.firstName} ${spec.lastName}`, i)),
        isDemo: true,
        onboardingCompleted: true,
      },
    });
    demoUsers.push(u);
    await db.skill.createMany({
      data: [
        { userId: u.id, name: spec.profession.split(" ")[0] },
        { userId: u.id, name: spec.domain },
        { userId: u.id, name: "Réseautage" },
      ],
    });
  }

  // Compétences pour le compte démo
  await db.skill.createMany({
    data: [
      { userId: demo.id, name: "Gestion de projet" },
      { userId: demo.id, name: "Technologie" },
      { userId: demo.id, name: "Réseautage" },
    ],
  });

  // ============ GROUPES (thématiques d'exemple) ============
  console.log("Groupes...");
  const groupsSpec = [
    { name: "Entrepreneuriat", category: "ENTREPRENARIAT", description: "Pour celles et ceux qui transforment leurs idées en activités réelles : partage d'expériences, entraide et retours d'expérience concrets." },
    { name: "Technologie & IA", category: "TECHNOLOGIE", description: "Développeurs, data et curieux de l'intelligence artificielle : apprendre ensemble, coder ensemble, se recommander des opportunités." },
    { name: "Business & Finance", category: "FINANCE", description: "Comprendre la gestion, la finance et les modèles économiques pour construire des entreprises solides." },
    { name: "Création de contenu", category: "CREATION_CONTENU", description: "Créateurs, vidéastes et community managers : progresser ensemble et décrocher des collaborations." },
    { name: "Marketing digital", category: "MARKETING", description: "Acquérir ses premiers clients, structurer son offre et maîtriser les canaux digitaux." },
    { name: "Développement personnel", category: "DEVELOPPEMENT_PERSONNEL", description: "Discipline, mindset et habitudes : le travail intérieur qui soutient l'action." },
  ];
  type PrismaGroup = Awaited<ReturnType<typeof db.group.create>>;
  const groups: PrismaGroup[] = [];
  for (let i = 0; i < groupsSpec.length; i++) {
    const spec = groupsSpec[i];
    const g = await db.group.create({
      data: {
        ...spec,
        slug: `${spec.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}`,
        isDemo: true,
        isFeatured: i < 3,
        createdBy: admin.id,
      },
    });
    groups.push(g);
    await db.groupMember.create({ data: { groupId: g.id, userId: admin.id, role: "ADMIN" } });
  }
  // Membres démo dans les groupes
  for (let i = 0; i < demoUsers.length; i++) {
    const g = groups[i % groups.length];
    await db.groupMember.create({ data: { groupId: g.id, userId: demoUsers[i].id, role: "MEMBER" } });
    if (i % 2 === 0) {
      const g2 = groups[(i + 2) % groups.length];
      await db.groupMember.create({ data: { groupId: g2.id, userId: demoUsers[i].id, role: "MEMBER" } });
    }
  }
  await db.groupMember.create({ data: { groupId: groups[0].id, userId: demo.id, role: "MEMBER" } });
  await db.groupMember.create({ data: { groupId: groups[1].id, userId: demo.id, role: "MEMBER" } });

  // ============ PUBLICATIONS DE DÉMONSTRATION ============
  console.log("Publications...");
  const postsSpec = [
    { u: 0, category: "ENTREPRENARIAT", content: "Petit rappel : personne n'attend pour commencer. Ce qui compte ce n'est pas d'avoir tout le financement, c'est de valider l'idée avec 3 vrais clients. Qui a lancé quelque chose cette semaine ?" },
    { u: 1, category: "TECHNOLOGIE", content: "J'ai terminé la première version de mon portfolio après 2 semaines de travail le soir. Prochaine étape : contacter 10 entreprises locales. Les retours sont les bienvenus !" },
    { u: 2, category: "CREATION_CONTENU", content: "Conseil de la semaine : filme avec le matériel que tu as déjà. La régularité fait plus que la perfection. Qui veut qu'on fasse une collaboration ce mois-ci ?" },
    { u: 3, category: "BUSINESS", content: "Freelances : arrêtez de vendre des « heures ». Vendez des résultats. Depuis que je formule mes offres en termes de résultats, mes propositions se font accepter 2 fois plus." },
    { u: 4, category: "MOTIVATION", content: "En tant qu'étudiante, on m'a dit d'attendre d'avoir mon diplôme pour « commencer ». Je suis contente de ne pas avoir écouté : j'ai déjà rencontré 5 personnes inspirantes grâce à des rencontres comme celles d'OCD." },
    { u: 5, category: "PROJETS", content: "Mon projet d'agro-processing avance : j'ai trouvé un local et je discute avec 2 partenaires. Encore beaucoup à apprendre. Si quelqu'un connaît le sujet, je prends tous les conseils." },
    { u: 6, category: "CREATION_CONTENU", content: "Astuce design : 1 police forte + 1 couleur affirmée > 5 polices et 7 couleurs. La simplicité donne de la crédibilité." },
    { u: 7, category: "TECHNOLOGIE", content: "Objectif du mois : publier une application chaque semaine pour apprendre vite. Semaine 1 : une app météo simple. À suivre." },
    { u: 8, category: "EDUCATION", content: "Pour les jeunes entreprises : maîtrisez vos chiffres AVANT de chercher des financements. Un chiffre compris vaut mieux qu'un beau slide mal expliqué." },
    { u: 9, category: "MOTIVATION", content: "Ce que j'aime dans la philosophie OCD : « les opportunités sont dehors ». Ça veut dire que le fauteuil ne donne rien. Il faut bouger, aller vers les gens. J'ai décidé de participer à une rencontre chaque mois." },
    { u: 1, category: "EXPERIENCES", content: "Leçon de la semaine : un client a annulé au dernier moment. Résultat : j'ai découvert 2 nouvelles opportunités en allant à une rencontre à sa place. Sortez de chez vous, vraiment." },
    { u: 3, category: "ENTREPRENARIAT", content: "Recherche : un développeur pour une landing page simple (projet personnel). Rémunération possible + échange de compétences. MP ouvert." },
  ];
  type PrismaPost = Awaited<ReturnType<typeof db.post.create>>;
  const createdPosts: PrismaPost[] = [];
  for (let i = 0; i < postsSpec.length; i++) {
    const spec = postsSpec[i];
    const p = await db.post.create({
      data: {
        content: spec.content,
        category: spec.category,
        userId: demoUsers[spec.u].id,
        createdAt: new Date(Date.now() - (postsSpec.length - i) * 7 * 36e5),
      },
    });
    createdPosts.push(p);
  }

  // Publications du compte démo (pour que le fil montre ses propres posts)
  const demoPost = await db.post.create({
    data: {
      content: "Nouveau sur OCD ! Je cherche à échanger avec des personnes qui lancent leurs projets dans la tech et l'éducation à Cotonou. Ouvert aux rencontres, aux échanges et aux collaborations. Les opportunités sont dehors, alors je sors.",
      category: "EXPERIENCES",
      userId: demo.id,
      createdAt: new Date(Date.now() - 3 * 36e5),
    },
  });

  // Post dans un groupe
  await db.post.create({
    data: {
      content: "Bienvenue dans ce groupe Entrepreneuriat ! Présentez-vous en 3 lignes : ce que vous faites, ce que vous cherchez, ce que vous pouvez apporter. Les rencontres commencent ici.",
      category: "ENTREPRENARIAT",
      userId: admin.id,
      groupId: groups[0].id,
      isPinned: true,
      createdAt: new Date(Date.now() - 5 * 864e5),
    },
  });

  // Réactions + commentaires + notifications
  await db.reaction.createMany({
    data: [
      { postId: demoPost.id, userId: demoUsers[0].id, type: "LIKE" },
      { postId: demoPost.id, userId: demoUsers[1].id, type: "INSPIRED" },
      { postId: demoPost.id, userId: demoUsers[3].id, type: "SUPPORT" },
    ],
  });
  const c1 = await db.comment.create({
    data: { postId: demoPost.id, userId: demoUsers[1].id, content: "Bienvenue ! Il y a un groupe Technologie & IA actif, rejoins-nous." },
  });
  await db.comment.create({
    data: { postId: demoPost.id, userId: demoUsers[4].id, content: "On devrait organiser une rencontre à Cotonou un de ces jours !", parentId: c1.id },
  });
  await db.notification.createMany({
    data: [
      { userId: demo.id, type: "REACTION", title: "3 personnes ont réagi à ta publication", linkUrl: "/espace/fil" },
      { userId: demo.id, type: "COMMENT", title: "Kouassi Yao a commenté ta publication", body: "Bienvenue ! Il y a un groupe Technologie & IA actif, rejoins-nous.", linkUrl: "/espace/fil" },
    ],
  });

  // ============ CONNEXIONS / ABONNEMENTS ============
  console.log("Connexions...");
  await db.connection.create({
    data: { senderId: demoUsers[1].id, receiverId: demo.id, status: "PENDING" },
  });
  await db.notification.create({
    data: { userId: demo.id, type: "CONNECTION_REQUEST", title: "Kouassi Yao souhaite se connecter avec toi", linkUrl: "/espace/notifications" },
  });
  await db.connection.create({
    data: { senderId: demo.id, receiverId: demoUsers[0].id, status: "ACCEPTED" },
  });
  await db.connection.create({
    data: { senderId: demo.id, receiverId: demoUsers[5].id, status: "PENDING" },
  });
  await db.follow.createMany({
    data: [
      { followerId: demo.id, followingId: demoUsers[2].id },
      { followerId: demo.id, followingId: demoUsers[6].id },
      { followerId: demoUsers[0].id, followingId: demo.id },
      { followerId: demoUsers[7].id, followingId: demo.id },
    ],
  });

  // ============ MESSAGERIE (conversations du compte démo) ============
  console.log("Messagerie...");
  const conv1 = await db.conversation.create({ data: {} });
  await db.conversationMember.createMany({
    data: [
      { conversationId: conv1.id, userId: demo.id },
      { conversationId: conv1.id, userId: demoUsers[0].id },
    ],
  });
  await db.message.createMany({
    data: [
      { conversationId: conv1.id, senderId: demoUsers[0].id, content: "Bonjour Awa ! J'ai vu ta publication, on partage le même état d'esprit.", createdAt: new Date(Date.now() - 2 * 36e5) },
      { conversationId: conv1.id, senderId: demo.id, content: "Bonjour Aïcha, merci ! Ton parcours est inspirant. Tu es basée à Dakar ?", createdAt: new Date(Date.now() - 1.5 * 36e5) },
      { conversationId: conv1.id, senderId: demoUsers[0].id, content: "Oui ! On pourrait échanger sur ta gestion de projet digital, j'ai une idée à structurer. Tu es dispo cette semaine ?", createdAt: new Date(Date.now() - 0.5 * 36e5) },
    ],
  });
  const conv2 = await db.conversation.create({ data: {} });
  await db.conversationMember.createMany({
    data: [
      { conversationId: conv2.id, userId: demo.id },
      { conversationId: conv2.id, userId: demoUsers[7].id },
    ],
  });
  await db.message.createMany({
    data: [
      { conversationId: conv2.id, senderId: demo.id, content: "Salut Yannick ! Ta série « une app par semaine » est motivante.", createdAt: new Date(Date.now() - 26 * 36e5) },
      { conversationId: conv2.id, senderId: demoUsers[7].id, content: "Merci beaucoup ! Si tu veux on fait une session de code ensemble un soir.", createdAt: new Date(Date.now() - 25 * 36e5) },
    ],
  });

  // ============ ÉVÉNEMENTS (exemples flaggés) ============
  console.log("Événements...");
  const eventsSpec = [
    {
      title: "Masterclass : de l'idée aux premiers clients (exemple)",
      category: "MASTERCLASS",
      description: "Exemple de masterclass OCD : structurer son offre, identifier ses premiers clients et passer à l'action. Le contenu réel sera défini avec l'équipe OCD.",
      isOnline: true,
      startDate: DAYS(7),
      location: "En ligne",
    },
    {
      title: "Rencontre communautaire OCD (exemple)",
      category: "RENCONTRE",
      description: "Exemple de rencontre OCD : Networking, échanges autour des projets en cours et mises en relation. Format et lieu réels à définir avec l'équipe OCD.",
      isOnline: false,
      startDate: DAYS(14),
      location: "Cotonou, Bénin (lieu à confirmer)",
    },
    {
      title: "Challenge : 30 jours, 30 actions (exemple)",
      category: "CHALLENGE",
      description: "Exemple de challenge communautaire : une action concrète par jour pendant 30 jours pour sortir de sa zone de confort. Règles définitives à valider avec l'équipe OCD.",
      isOnline: true,
      startDate: DAYS(21),
      location: "En ligne",
    },
  ];
  for (const spec of eventsSpec) {
    const e = await db.event.create({
      data: {
        ...spec,
        organizerId: admin.id,
        organizerName: "Équipe OCD",
        isDemo: true,
        status: "PUBLISHED",
      },
    });
    await db.eventRegistration.create({ data: { eventId: e.id, userId: demoUsers[0].id } });
    await db.eventRegistration.create({ data: { eventId: e.id, userId: demoUsers[2].id } });
  }

  // ============ RÉALISATIONS ============
  console.log("Réalisations...");
  // 1 seule réalisation documentée (issu des visuels fournis) :
  await db.achievement.create({
    data: {
      title: "OCD PROJETS — identité visuelle et contact officiel",
      description:
        "Bovann a construit l'identité visuelle d'OCD PROJETS, avec un canal de contact officiel vérifié (WhatsApp). Cet élément, présenté dans les visuels de marque fournis, constitue une base documentée sur laquelle la plateforme numérique OCD peut s'appuyer.",
      category: "INITIATIVES",
      status: "REALISE",
      imageUrl: "/images/ocd-projets.png",
      results: null, // aucun chiffre inventé
      isPublished: true,
      order: 0,
    },
  });
  // Brouillons non publiés pour démontrer le workflow admin :
  await db.achievement.create({
    data: {
      title: "Projet à documenter — en attente de validation",
      description:
        "Emplacement réservé à une réalisation réelle de Bovann. À compléter par l'équipe : titre officiel, description vérifiée, médias et résultats documentés.",
      category: "ENTREPRENARIAT",
      status: "EN_COURS",
      isPublished: false,
      order: 1,
    },
  });

  // ============ GALERIE ============
  console.log("Galerie...");
  await db.galleryMedia.create({
    data: {
      url: "/images/ocd-projets.png",
      type: "IMAGE",
      category: "PROJETS",
      title: "OCD PROJETS",
      description: "Visuel officiel de marque fourni par l'équipe de Bovann.",
      order: 0,
      isPublished: true,
    },
  });

  // ============ ANNONCE ============
  console.log("Annonce...");
  await db.announcement.create({
    data: {
      title: "Bienvenue sur le prototype OCD",
      body: "Ce prototype présente la proposition de plateforme numérique OCD. Les profils marqués « Démo » sont fictifs. Les contenus institutionnels concernant Bovann seront complétés et validés par l'équipe OCD.",
      authorId: admin.id,
      isPublished: true,
    },
  });

  console.log("Seed terminé.");
  console.log("Comptes : admin@ocd.africa / ocd-admin-2025 — demo@ocd.africa / ocd-demo-2025");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
