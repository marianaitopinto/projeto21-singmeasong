import { faker } from "@faker-js/faker";
import { jest } from "@jest/globals";
import { prisma } from "../../src/database";

export function newRecommendation() {
  const recommendation = {
    name: faker.name.firstName(),
    youtubeLink: "https://www.youtube.com/watch?v=czz9hLjfMCI",
  };

  return recommendation;
}

export function recommentationWithScore() {
  const recommendation = {
    id: 1,
    name: faker.name.firstName(),
    youtubeLink: "https://www.youtube.com/watch?v=czz9hLjfMCI",
    score: 0,
  };

  return recommendation;
}

export function recommendations() {
  const recommendations = [
    {
      id: 2,
      name: "Tortinha de massa de pastel de queijo e bacon",
      youtubeLink: "https://www.youtube.com/watch?v=VGT5vfeSnqw",
      score: 6,
    },
    {
      id: 5,
      name: "Vaca atolada mineira original",
      youtubeLink: "https://www.youtube.com/watch?v=bBvGlJJpE_E",
      score: 66,
    },
    {
      id: 6,
      name: "Arroz carreteiro",
      youtubeLink: "https://www.youtube.com/watch?v=vHsSJfViGmI",
      score: 75,
    },
  ];

  return recommendations;
}

export async function createRecomendations(qty: number) {
  const array = [];

  for (let i = 0; i < qty; i++) {
    const recommendation = await prisma.recommendation.create({
      data: {
        name: faker.name.firstName(),
        youtubeLink: `https://www.youtube.com/watch?v=czz9hLjfMCI`,
      },
    });
    array.push(recommendation);
  }

  return array;
}
