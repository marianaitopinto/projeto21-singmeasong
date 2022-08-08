Cypress.Commands.add("createRecommendations", () => {
  const recommendation = {
    name: "Orange Range - Hana",
    link: "https://youtu.be/czz9hLjfMCI",
  };

  cy.visit("http://localhost:3000");
  cy.get('input[placeholder="Name"]').type(recommendation.name);
  cy.get('input[placeholder="https://youtu.be/..."]').type(recommendation.link);

  cy.intercept("POST", "http://localhost:5000/recommendations").as(
    "createRecommendation"
  );
  cy.get("button").click();
  cy.wait("@createRecommendation");
});
