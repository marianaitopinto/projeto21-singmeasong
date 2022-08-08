import { prisma } from "../../src/database";
import supertest from "supertest";
import app from "../../src/app";

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

describe("upvote recommendation", () => {
  it("should increase 1 point to recommendation", async () => {
    const data = await newRecommendation();
    const insert = await supertest(app).post("/recommendations").send(data);

    expect(insert.statusCode).toBe(201);

    const recommendation = await prisma.recommendation.findFirst({
      where: {
        name: data.name,
      },
    });

    const response = await supertest(app).post(
      `/recommendations/${recommendation.id}/upvote`
    );
    expect(response.status).toBe(200);

    const checkScore = await prisma.recommendation.findFirst({
      where: {
        name: data.name,
      },
    });

    expect(checkScore.score).toBeGreaterThan(recommendation.score);
  });

  it("should not update with a invalid id, should return 404", async () => {
    const response = await supertest(app).post(`/recommendations/1/upvote`);

    expect(response.status).toBe(404);
  });
});

describe("downvote recommendation", () => {
  it("should decrease 1 point to recommendation, return status 200", async () => {
    const data = await newRecommendation();
    const insert = await supertest(app).post("/recommendations").send(data);

    expect(insert.statusCode).toBe(201);

    const recommendation = await prisma.recommendation.findFirst({
      where: {
        name: data.name,
      },
    });

    await prisma.recommendation.update({
      where: { id: recommendation.id },
      data: { score: 5 },
    });

    const response = await supertest(app).post(
      `/recommendations/${recommendation.id}/downvote`
    );
    expect(response.status).toBe(200);

    const checkScore = await prisma.recommendation.findFirst({
      where: {
        name: recommendation.name,
      },
    });
    expect(checkScore.score).toBe(4);
  });

  it("should not update with a invalid id, should return 404", async () => {
    const response = await supertest(app).post(`/recommendations/1/downvote`);

    expect(response.status).toBe(404);
  });

  it("should decrese 1 point and delete a recommendation with score -5, return 200", async () => {
    const data = await newRecommendation();
    const insert = await supertest(app).post("/recommendations").send(data);

    expect(insert.statusCode).toBe(201);

    const recommendation = await prisma.recommendation.findFirst({
      where: {
        name: data.name,
      },
    });

    await prisma.recommendation.update({
      where: { id: recommendation.id },
      data: { score: -5 },
    });

    const response = await supertest(app).post(
      `/recommendations/${recommendation.id}/downvote`
    );
    expect(response.status).toBe(200);

    const checkRecommendation = await prisma.recommendation.findFirst({
      where: {
        id: recommendation.id,
      },
    });
    
    expect(checkRecommendation).toBe(null);
  });
});
