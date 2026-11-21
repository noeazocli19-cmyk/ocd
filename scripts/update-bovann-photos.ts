import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaults: Record<string, string> = {
  "bovann.fullName": "Bovann",
  "bovann.tagline": "Porteur de la vision OCD",
  "bovann.photoUrl": "/images/bovann-real-1.png",
};

async function main() {
  for (const [key, value] of Object.entries(defaults)) {
    const existing = await prisma.siteContent.findUnique({ where: { key } });
    if (!existing) {
      await prisma.siteContent.create({ data: { key, value } });
      console.log(`Created: ${key}`);
    } else if (key === "bovann.photoUrl") {
      await prisma.siteContent.update({ where: { key }, data: { value } });
      console.log(`Updated: ${key} -> ${value}`);
    } else {
      console.log(`Exists: ${key}`);
    }
  }

  // Also update the second real photo in the gallery if a bovann gallery entry exists
  const galleryEntry = await prisma.galleryMedia.findFirst({
    where: { category: "BOVANN" },
  });
  if (galleryEntry) {
    await prisma.galleryMedia.update({
      where: { id: galleryEntry.id },
      data: { url: "/images/bovann-real-2.png" },
    });
    console.log("Updated gallery bovann photo");
  } else {
    await prisma.galleryMedia.create({
      data: {
        url: "/images/bovann-real-2.png",
        type: "IMAGE",
        category: "BOVANN",
        title: "Bovann — photo officielle",
        isPublished: true,
        order: 0,
      },
    });
    console.log("Created gallery bovann photo");
  }
}

main()
  .then(() => console.log("DONE"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
