import { faker } from "@faker-js/faker";
import { jest } from "@jest/globals";

export function newRecommendation() {
    const recommendation = {
        name: faker.name.firstName(),
        youtubeLink: "https://www.youtube.com/watch?v=czz9hLjfMCI"
    }

    return recommendation;
}

