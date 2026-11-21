/**
 * Enrichit la galerie et les publications de démonstration avec les visuels d'ambiance générés.
 * Chaque média est explicitement légendé comme "visuel d'ambiance provisoire".
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // Galerie : visuels d'ambiance (publiés, avec légende honnête)
  const gallerySpec = [
    {
      url: "/images/gen-conference.png",
      category: "CONFERENCES",
      title: "Ambiance — conférence entrepreneuriale",
      description: "Visuel d'ambiance provisoire. Les photographies officielles des conférences OCD remplaceront ces visuels.",
      order: 1,
    },
    {
      url: "/images/gen-meetup.png",
      category: "RENCONTRES",
      title: "Ambiance — rencontre entre membres",
      description: "Visuel d'ambiance provisoire représentant l'esprit des rencontres OCD.",
      order: 2,
    },
    {
      url: "/images/gen-workshop.png",
      category: "ATELIER",
      title: "Ambiance — atelier collaboratif",
      description: "Visuel d'ambiance provisoire — atelier de travail communautaire.",
      order: 3,
    },
    {
      url: "/images/gen-city.png",
      category: "COMMUNAUTE",
      title: "Ambiance — énergie urbaine africaine",
      description: "Visuel d'ambiance provisoire. Les opportunités sont dehors.",
      order: 4,
    },
    {
      url: "/images/gen-entrepreneur.png",
      category: "ENTREPRENARIAT",
      title: "Ambiance — entrepreneur au travail",
      description: "Visuel d'ambiance provisoire représentant l'entrepreneuriat au quotidien.",
      order: 5,
    },
  ];

  for (const spec of gallerySpec) {
    const exists = await db.galleryMedia.findFirst({ where: { url: spec.url } });
    if (!exists) {
      await db.galleryMedia.create({
        data: { ...spec, type: "IMAGE", isPublished: true },
      });
    }
  }
  console.log("Galerie enrichie :", gallerySpec.length, "visuels");

  // Publications démo : 2 posts avec images d'ambiance
  const postsWithImages = await db.post.findMany({ where: { imageUrl: null }, orderBy: { createdAt: "desc" }, take: 12 });
  if (postsWithImages.length >= 2) {
    await db.post.update({
      where: { id: postsWithImages[0].id },
      data: { imageUrl: "/images/gen-workshop.png" },
    });
    await db.post.update({
      where: { id: postsWithImages[1].id },
      data: { imageUrl: "/images/gen-meetup.png" },
    });
    console.log("2 publications de démonstration illustrées");
  }

  // Événements : image d'ambiance sur les 2 premiers
  const events = await db.event.findMany({ where: { imageUrl: null }, take: 3 });
  const eventImages = ["/images/gen-meetup.png", "/images/gen-conference.png", "/images/gen-city.png"];
  for (let i = 0; i < events.length && i < eventImages.length; i++) {
    await db.event.update({ where: { id: events[i].id }, data: { imageUrl: eventImages[i] } });
  }
  console.log("Événements illustrés :", Math.min(events.length, eventImages.length));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
