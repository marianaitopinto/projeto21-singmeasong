///// <reference types="cypress" />

describe("Create Recommendation", () => {
  beforeEach(() => {
    cy.request("POST", "http://localhost:5000/reset", {});
  });

  it("should create a recommendation", () => {
    const recommendation = {
      name: "Orange Range - Hana",
      link: "https://youtu.be/czz9hLjfMCI",
    };

    cy.visit("http://localhost:3000");
    cy.get('input[placeholder="Name"]').type(recommendation.name);
    cy.get('input[placeholder="https://youtu.be/..."]').type(
      recommendation.link
    );
    cy.intercept("POST", "http://localhost:5000/recommendations").as(
      "createRecommendation"
    );
    cy.get("button").click();
    cy.wait("@createRecommendation");

    cy.contains(recommendation.name);
  });

  it("should not create a recommendation with an invalid video", () => {
    const recommendation = {
      name: "Orange Range - Hana",
      link: "https://www.linkedin.com/",
    };

    cy.visit("http://localhost:3000");
    cy.get('input[placeholder="Name"]').type(recommendation.name);
    cy.get('input[placeholder="https://youtu.be/..."]').type(
      recommendation.link
    );

    cy.intercept("POST", "/recommendations").as("postRecommendation");
    cy.get("button").click();
    cy.wait("@postRecommendation").its("response.statusCode").should("eq", 422);
  });
});

describe("get recommendations", () => {
  beforeEach(() => {
    cy.request("POST", "http://localhost:5000/reset", {});
  });

  it("should show top recommendations", () => {
    const recommendation = {
      name: "Orange Range - Hana",
      link: "https://www.linkedin.com/",
    };
    cy.createRecommendations();
    cy.visit("http://localhost:3000");

    cy.contains("Top").click();
    cy.visit("http://localhost:3000/top");
    cy.contains(`${recommendation.name}`).should("be.visible");
  });

  it("should show random recommendation", () => {
    const recommendation = {
      name: "Orange Range - Hana",
      link: "https://www.linkedin.com/",
    };
    cy.createRecommendations();

    cy.visit("http://localhost:3000");
    cy.contains("Random").click();
    cy.visit("http://localhost:3000/top");
    cy.contains(`${recommendation.name}`).should("be.visible");
  });
});

describe("up/down vote recommendation", () => {
  beforeEach(() => {
    cy.request("POST", "http://localhost:5000/reset", {});
  });

  it("should decrease 1 point when downvote a recommendation score", () => {
    cy.createRecommendations();

    cy.visit("http://localhost:3000");
    cy.get("#downvote").click();
    cy.get("#score").should("contain.text", "-1");
  });

  it("should increase 1 point when downvote a recommendation score", () => {
    cy.createRecommendations();

    cy.visit("http://localhost:3000");
    cy.get("#upvote").click();
    cy.get("#score").should("contain.text", "1");
  });
});
