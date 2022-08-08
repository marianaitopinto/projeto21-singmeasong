import { jest } from "@jest/globals";
import { prisma } from "../../src/database";
import supertest from "supertest";
import app from "../../src/app";
import { recommendationService } from "../../src/services/recommendationsService";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";
import {
  newRecommendation,
  recommentationWithScore,
  recommendations,
} from "../factories/recommendation";

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations RESTART IDENTITY CASCADE`;
});

describe("post recommendation", () => {
  it("should post a new recommendation, return status 201", async () => {
    const data = newRecommendation();

    const response = await supertest(app).post("/recommendations").send(data);

    expect(response.statusCode).toBe(201);

    const checkRecommendation = await prisma.recommendation.findFirst({
      where: {
        name: data.name,
        youtubeLink: data.youtubeLink,
      },
    });

    expect(checkRecommendation).not.toBe(null);
  });

  it("should not post a recommendation with a name that already exist, return status 409", async () => {
    const data = newRecommendation();

    const firstResponse = await supertest(app)
      .post("/recommendations")
      .send(data);

    expect(firstResponse.statusCode).toBe(201);

    const secondResponse = await supertest(app)
      .post("/recommendations")
      .send(data);

    expect(secondResponse.statusCode).toBe(409);
  });

  it("should not post a recommendation with an invalid body, return status 422", async () => {
    const data = newRecommendation();
    delete data.name;

    const response = await supertest(app).post("/recommendations").send(data);

    expect(response.statusCode).toBe(422);
  });
});
