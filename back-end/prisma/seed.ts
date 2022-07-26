import prisma from "../src/database.js"; 

async function main() {
    const recommendations = [
        { name: 'Tortinha de massa de pastel de queijo e bacon', youtubeLink: 'https://www.youtube.com/watch?v=VGT5vfeSnqw'},
        { name: 'Vaca atolada mineira original', youtubeLink: 'https://www.youtube.com/watch?v=bBvGlJJpE_E'},
        { name: 'Arroz carreteiro', youtubeLink: 'https://www.youtube.com/watch?v=vHsSJfViGmI'},
    ]

    await prisma.recommendation.createMany({ data: recommendations});
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });