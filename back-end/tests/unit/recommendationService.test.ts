import { jest } from "@jest/globals";
import { prisma } from "../../src/database";

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

describe("create recommendation", () => {
  it("should insert a new recommendation", async () => {
    const data = newRecommendation();

    jest
      .spyOn(recommendationRepository, "findByName")
      .mockImplementationOnce((): any => {});
    jest
      .spyOn(recommendationRepository, "create")
      .mockImplementationOnce((): any => {});

    await recommendationService.insert(data);

    expect(recommendationRepository.findByName).toBeCalled();
    expect(recommendationRepository.create).toBeCalled();
  });

  it("should not create a recommendation with a name already in use", async () => {
    const data = newRecommendation();

    jest
      .spyOn(recommendationRepository, "findByName")
      .mockImplementationOnce((): any => {
        return data;
      });

    const response = recommendationService.insert(data);

    expect(response).rejects.toEqual({
      message: "Recommendations names must be unique",
      type: "conflict",
    });
  });
});

describe("upvote recommendations", () => {
  it("should increase 1 point to recommendation score", async () => {
    const data = recommentationWithScore();

    jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(data);

    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockResolvedValueOnce(data);

    await recommendationService.upvote(data.id);

    expect(recommendationRepository.updateScore).toBeCalledTimes(1);
  });

  it("should not increase 1 point", async () => {
    jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);

    const response = recommendationService.upvote(0);

    expect(response).rejects.toEqual({ message: "", type: "not_found" });
  });
});

describe("downvote recommendations", () => {
  it("should decrease 1 point to recommendation score", async () => {
    const data = await recommentationWithScore();

    jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(data);

    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockResolvedValueOnce(data);

    await recommendationService.downvote(data.id);

    expect(recommendationRepository.updateScore).toHaveBeenCalled();
  });

  it("should remove a recommendation with score less than -5", async () => {
    const data = await recommentationWithScore();

    jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(data);

    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockResolvedValueOnce({ ...data, score: -6 });

    jest.spyOn(recommendationRepository, "remove").mockResolvedValueOnce();

    await recommendationService.downvote(data.id);

    expect(recommendationRepository.remove).toBeCalledTimes(1);
  });

  it("should not decrease 1 point", async () => {
    jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);

    const response = recommendationService.downvote(0);

    expect(response).rejects.toEqual({ message: "", type: "not_found" });
  });
});

describe("get recommendations", () => {
  it("should return a recommendation", async () => {
    const data = await recommentationWithScore();

    jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(data);

    await recommendationService.getById(data.id);

    expect(recommendationRepository.find).toHaveBeenCalled();
  });

  it("should not return a recommendation", async () => {
    const data = await recommentationWithScore();

    jest
      .spyOn(recommendationRepository, "find")
      .mockResolvedValueOnce(undefined);

    const response = recommendationService.getById(0);

    expect(response).rejects.toEqual({ message: "", type: "not_found" });
  });

  it("should return top recommendations", async () => {
    const getAmountByScore = jest
      .spyOn(recommendationRepository, "getAmountByScore")
      .mockResolvedValueOnce([]);

    await recommendationService.getTop(0);

    expect(getAmountByScore).toBeCalledTimes(1);
  });

  it("should return all recommendations", async () => {
    const data = await recommendations();

    jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce(data);

    await recommendationService.get();

    expect(recommendationRepository.findAll).toHaveBeenCalled();
  });

  it("should not return random recommendations", async () => {
    jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([]);

    const response = recommendationService.getRandom();

    expect(response).rejects.toEqual({ message: "", type: "not_found" });
  });

  it("get random recommendation 70", async () => {
    const data = [
      {
        id: 2,
        name: "Tortinha de massa de pastel de queijo e bacon",
        youtubeLink: "https://www.youtube.com/watch?v=VGT5vfeSnqw",
        score: 5,
      },
      {
        id: 5,
        name: "Vaca atolada mineira original",
        youtubeLink: "https://www.youtube.com/watch?v=bBvGlJJpE_E",
        score: 100,
      },
    ];

    jest.spyOn(Math, "random").mockReturnValueOnce(0.5);

    jest
      .spyOn(recommendationRepository, "findAll")
      .mockResolvedValueOnce([data[1]]);

    const response = await recommendationService.getRandom();

    expect(response.score).toEqual(data[1].score);
  });

  it("should return random recommendation", async () => {
    const data = [
      {
        id: 2,
        name: "Tortinha de massa de pastel de queijo e bacon",
        youtubeLink: "https://www.youtube.com/watch?v=VGT5vfeSnqw",
        score: 5,
      },
      {
        id: 5,
        name: "Vaca atolada mineira original",
        youtubeLink: "https://www.youtube.com/watch?v=bBvGlJJpE_E",
        score: 100,
      },
    ];

    jest.spyOn(Math, "random").mockReturnValueOnce(0.9);

    jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce(data);

    const response = await recommendationService.getRandom();

    expect(response).not.toBeNull();
  });
});
