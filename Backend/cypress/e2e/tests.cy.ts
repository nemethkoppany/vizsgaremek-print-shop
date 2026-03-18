describe("Print Shop API tests", () => {

  let token: string;

  before(() => {
    cy.request("POST", "http://localhost:3000/api/auth/login", {
      email: "teszt@user.hu",
      password: "Teszt1234"
    }).then((res) => {
      expect(res.status).to.eq(200);
      token = res.body.accessToken;
    });
  });

  it("Login sikeres", () => {
    cy.request("POST", "http://localhost:3000/api/auth/login", {
      email: "teszt@user.hu",
      password: "Teszt1234"
    }).its("status").should("eq", 200);
  });

  it("Login hibás jelszóval", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:3000/api/auth/login",
      failOnStatusCode: false,
      body: {
        email: "teszt@user.hu",
        password: "rossz"
      }
    }).its("status").should("eq", 401);
  });


  it("Termékek lekérése", () => {
    cy.request("http://localhost:3000/api/products")
      .its("status").should("eq", 200);
  });


  it("Egy termék lekérése", () => {
    cy.request("http://localhost:3000/api/products/1")
      .its("status").should("eq", 200);
  });


  it("Nem létező termék", () => {
    cy.request({
      url: "http://localhost:3000/api/products/99999",
      failOnStatusCode: false
    }).its("status").should("eq", 404);
  });


  it("Rendelés létrehozása", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:3000/api/order",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        items: [{ productId: 1, quantity: 1 }]
      }
    }).its("status").should("eq", 201);
  });

  it("Rendelés token nélkül", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:3000/api/order",
      failOnStatusCode: false,
      body: {
        items: [{ productId: 1, quantity: 1 }]
      }
    }).its("status").should("eq", 403);
  });


  it("Rating létrehozás", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:3000/api/ratings",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        rating: 5,
        comment: "Nagyon jó!"
      }
    }).its("status").should("eq", 201);
  });


  it("Rating átlag lekérés", () => {
    cy.request("http://localhost:3000/api/ratings/avg")
      .its("status").should("eq", 200);
  });

  
  it("User lekérés", () => {
    cy.request({
      method: "GET",
      url: "http://localhost:3000/api/users/1",
      headers: {
        Authorization: `Bearer ${token}`
      },
      failOnStatusCode: false
    }).its("status").should("be.oneOf", [200, 403, 404]);
  });

});