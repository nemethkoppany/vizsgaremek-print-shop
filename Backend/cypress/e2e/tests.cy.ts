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


  it("Regisztráció hiányzó adatokkal", () => {
  cy.request({
    method: "POST",
    url: "http://localhost:3000/api/auth/register",
    failOnStatusCode: false,
    body: {
      email: "valami@teszt.hu"
    }
  }).its("status").should("eq", 400);
});

it("Termékek listája tömb típusú választ ad", () => {
  cy.request("http://localhost:3000/api/products").then((res) => {
    expect(res.status).to.eq(200);
    expect(res.body).to.be.an("array");
    expect(res.body.length).to.be.greaterThan(0);
  });
});

it("Termék válasza tartalmazza a szükséges mezőket", () => {
  cy.request("http://localhost:3000/api/products/1").then((res) => {
    expect(res.status).to.eq(200);
    expect(res.body).to.have.property("product_id");
    expect(res.body).to.have.property("name");
    expect(res.body).to.have.property("base_price");
    expect(res.body).to.have.property("in_stock");
  });
});

it("Rendelés létrehozása üres items tömbbel", () => {
  cy.request({
    method: "POST",
    url: "http://localhost:3000/api/order",
    failOnStatusCode: false,
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      items: []
    }
  }).its("status").should("eq", 400);
});

it("Rendelés lekérése ID alapján", () => {
  cy.request({
    method: "POST",
    url: "http://localhost:3000/api/order",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      items: [{ productId: 1, quantity: 1 }]
    }
  }).then((createRes) => {
    const orderId = createRes.body.order_id;
    cy.request(`http://localhost:3000/api/order/${orderId}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("order_id", orderId);
      expect(res.body).to.have.property("status");
      expect(res.body).to.have.property("items");
    });
  });
});

it("Nem létező rendelés lekérése", () => {
  cy.request({
    url: "http://localhost:3000/api/order/99999",
    failOnStatusCode: false
  }).its("status").should("eq", 404);
});

it("Rating érvénytelen értékkel (0)", () => {
  cy.request({
    method: "POST",
    url: "http://localhost:3000/api/ratings",
    failOnStatusCode: false,
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      rating: 0,
      comment: "Érvénytelen"
    }
  }).its("status").should("eq", 400);
});

it("Rating érvénytelen értékkel (6)", () => {
  cy.request({
    method: "POST",
    url: "http://localhost:3000/api/ratings",
    failOnStatusCode: false,
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      rating: 6,
      comment: "Érvénytelen"
    }
  }).its("status").should("eq", 400);
});

it("Összes rating lekérése", () => {
  cy.request({
    method: "GET",
    url: "http://localhost:3000/api/ratings/all",
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((res) => {
    expect(res.status).to.eq(200);
    expect(res.body).to.be.an("array");
  });
});

it("Rating átlag tartalmazza a megfelelő mezőket", () => {
  cy.request("http://localhost:3000/api/ratings/avg").then((res) => {
    expect(res.status).to.eq(200);
    expect(res.body).to.have.property("total_ratings");
    expect(res.body).to.have.property("average_rating");
    expect(parseFloat(res.body.average_rating)).to.be.a("number");
    expect(parseFloat(res.body.average_rating)).to.be.within(0, 5);
  });
});
});