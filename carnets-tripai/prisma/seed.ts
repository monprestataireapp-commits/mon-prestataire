import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.messageLivreOr.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.etape.deleteMany();
  await prisma.carnet.deleteMany();

  const carnet = await prisma.carnet.create({
    data: {
      slug: "japon-26",
      titre: "Deux semaines au Japon",
      sousTitre: "Sophie & Karim",
      dateDebut: new Date("2026-04-12"),
      dateFin: new Date("2026-04-26"),
      villes: JSON.stringify(["Tokyo", "Hakone", "Kyoto", "Nara", "Osaka"]),
      photoCouverture: "https://picsum.photos/seed/fuji-japon/1600/1000",
      publie: true,
    },
  });

  const etapes = [
    {
      ordre: 1,
      jourLabel: "Jour 1 – 2 · Tokyo",
      titre: "Premiers pas dans la démesure",
      texte: "Le décalage horaire nous a réveillés à 5h — parfait pour voir Shibuya se remplir petit à petit. Premier repas : des ramens commandés sur une machine, on a mis dix minutes à comprendre.",
      photos: [
        "https://picsum.photos/seed/tokyo-nuit/900/700",
        "https://picsum.photos/seed/tokyo-rue/500/400",
        "https://picsum.photos/seed/tokyo-tour/500/400",
      ],
      hearts: 12,
    },
    {
      ordre: 2,
      jourLabel: "Jour 5 · Hakone",
      titre: "Le Fuji est sorti des nuages",
      texte: "On avait lu partout qu'il fallait de la chance pour le voir. À 7h du matin, depuis le ryokan, il était là. Karim en a pleuré (il dira que non).",
      photos: ["https://picsum.photos/seed/mont-fuji/1200/700"],
      hearts: 23,
    },
    {
      ordre: 3,
      jourLabel: "Jour 8 – 10 · Kyoto",
      titre: "Temples, mousse et matcha",
      texte: "Trois jours à Kyoto et on aurait pu y rester un mois. Le pavillon d'or sous la pluie, le chemin des philosophes sous les cerisiers en fin de floraison. On a bu trop de matcha, aucun regret.",
      photos: [
        "https://picsum.photos/seed/kyoto-temple/700/500",
        "https://picsum.photos/seed/kyoto-jardin/700/500",
      ],
      hearts: 18,
    },
    {
      ordre: 4,
      jourLabel: "Jour 13 · Osaka",
      titre: "Dernière soirée, quartier Dotonbori",
      texte: "Takoyaki, néons, karaoké jusqu'à 2h du matin. On repart avec 124 photos, 3 kilos de KitKat au thé vert et l'envie de revenir.",
      photos: ["https://picsum.photos/seed/osaka-neon/1200/700"],
      hearts: 9,
    },
  ];

  for (const e of etapes) {
    const etape = await prisma.etape.create({
      data: {
        carnetId: carnet.id,
        ordre: e.ordre,
        jourLabel: e.jourLabel,
        titre: e.titre,
        texte: e.texte,
      },
    });

    for (let i = 0; i < e.photos.length; i++) {
      await prisma.photo.create({
        data: { etapeId: etape.id, url: e.photos[i], ordre: i + 1 },
      });
    }

    await prisma.reaction.create({
      data: { etapeId: etape.id, compteurCoeurs: e.hearts },
    });
  }

  await prisma.messageLivreOr.createMany({
    data: [
      { carnetId: carnet.id, prenom: "Maman", message: "Merci de nous avoir fait voyager avec vous. Vivement le prochain !" },
      { carnetId: carnet.id, prenom: "Nadia", message: "Les photos de Kyoto 😍 Vous les avez prises avec quoi ?" },
      { carnetId: carnet.id, prenom: "Papi Jean", message: "De mon temps on envoyait une carte postale. C'est mieux comme ça." },
    ],
  });

  console.log("✅ Seed terminé : carnet Japon créé avec slug 'japon-26'");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
