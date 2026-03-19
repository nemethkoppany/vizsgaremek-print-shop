describe("Print Shop Frontend tesztek", () => {

  const BASE = "http://localhost:5173";

  it("Főoldal betöltése", () => {
    cy.visit(BASE);
    cy.get(".navbar").should("exist");
  });

  it("Navbar tartalmazza a szükséges menüpontokat", () => {
    cy.visit(BASE);
    cy.get(".navbar").contains("Főoldal");
    cy.get(".navbar").contains("Árlista");
    cy.get(".navbar").contains("Szolgáltatások");
    cy.get(".navbar").contains("Kosár");
    cy.get(".navbar").contains("Bejelentkezés / Regisztráció");
  });

  it("Árlista oldal megnyitása", () => {
    cy.visit(BASE);
    cy.get(".navbar").contains("Árlista").click();
    cy.get(".navbar button.active").should("contain", "Árlista");
  });

  it("Szolgáltatások oldal megnyitása", () => {
    cy.visit(BASE);
    cy.get(".navbar").contains("Szolgáltatások").click();
    cy.get(".navbar button.active").should("contain", "Szolgáltatások");
  });

  it(" Kosár oldal megnyitása", () => {
    cy.visit(BASE);
    cy.get(".navbar").contains("Kosár").click();
    cy.get(".navbar button.active").should("contain", "Kosár");
  });

  it(" Bejelentkezés oldal megjelenik", () => {
    cy.visit(BASE);
    cy.get(".navbar").contains("Bejelentkezés").click();
    cy.get(".login").should("exist");
    cy.get(".login h2").should("contain", "Bejelentkezés");
  });

  it("Login form mezői megjelennek", () => {
    cy.visit(BASE);
    cy.get(".navbar").contains("Bejelentkezés").click();
    cy.get(".login-form input[type='email']").should("exist");
    cy.get(".login-form input[type='password']").should("exist");
    cy.get(".login-form button[type='submit']").should("contain", "Belépés");
  });

  it(" Üres login form beküldésekor hibaüzenet jelenik meg", () => {
    cy.visit(BASE);
    cy.get(".navbar").contains("Bejelentkezés").click();
    cy.get(".login-form button[type='submit']").click();
    cy.get(".message-box.error").should("contain", "Kérem adja meg");
  });

  it("Hibás bejelentkezéskor hibaüzenet jelenik meg", () => {
    cy.visit(BASE);
    cy.get(".navbar").contains("Bejelentkezés").click();
    cy.get(".login-form input[type='email']").type("nemletezik@teszt.hu");
    cy.get(".login-form input[type='password']").type("rossz123");
    cy.get(".login-form button[type='submit']").click();
    cy.get(".message-box.error", { timeout: 5000 }).should("exist");
  });

  it(" Sikeres bejelentkezés után navbar megváltozik", () => {
    cy.visit(BASE);
    cy.get(".navbar").contains("Bejelentkezés").click();
    cy.get(".login-form input[type='email']").type("teszt@user.hu");
    cy.get(".login-form input[type='password']").type("Teszt1234");
    cy.get(".login-form button[type='submit']").click();
    cy.get(".navbar", { timeout: 5000 }).should("contain", "Kijelentkezés");
    cy.get(".navbar").should("contain", "Fiók");
  });

  it(" Regisztrációs oldal megjelenik", () => {
    cy.visit(BASE);
    cy.get(".navbar").contains("Bejelentkezés").click();
    cy.get(".login-form").contains("Regisztráció").click();
    cy.get(".register").should("exist");
    cy.get(".register h2").should("contain", "Regisztráció");
  });

  it("Üres regisztrációs form hibaüzenetet ad", () => {
    cy.visit(BASE);
    cy.get(".navbar").contains("Bejelentkezés").click();
    cy.get(".login-form").contains("Regisztráció").click();
    cy.get(".register-form button[type='submit']").click();
    cy.get(".message-box.error").should("contain", "Tölts ki minden mezőt");
  });

  it(" Nem egyező jelszavak esetén hibaüzenet jelenik meg", () => {
    cy.visit(BASE);
    cy.get(".navbar").contains("Bejelentkezés").click();
    cy.get(".login-form").contains("Regisztráció").click();
    cy.get(".register-form input").eq(0).type("Teszt Elek");
    cy.get(".register-form input[type='email']").type("valami@teszt.hu");
    cy.get(".register-form input[type='password']").eq(0).type("Jelszo123");
    cy.get(".register-form input[type='password']").eq(1).type("MasJelszo123");
    cy.get(".register-form button[type='submit']").click();
    cy.get(".message-box.error").should("contain", "nem egyeznek");
  });

  it("Visszanavigálás regisztrációból a loginra", () => {
    cy.visit(BASE);
    cy.get(".navbar").contains("Bejelentkezés").click();
    cy.get(".login-form").contains("Regisztráció").click();
    cy.get(".register-form").contains("Bejelentkezés").click();
    cy.get(".login").should("exist");
  });

  it(" Üres kosár megfelelő üzenetet mutat", () => {
    cy.visit(BASE);
    cy.get(".navbar").contains("Kosár").click();
    cy.get("body").should("contain", "Kosár");
  });

it(" Kosárba rakott termék megjelenik a kosár számláláson", () => {
  cy.visit(BASE);

  cy.get(".navbar").contains("Bejelentkezés").click();
  cy.get(".login-form input[type='email']").type("teszt@user.hu");
  cy.get(".login-form input[type='password']").type("Teszt1234");
  cy.get(".login-form button[type='submit']").click();
  cy.get(".navbar", { timeout: 5000 }).should("contain", "Kijelentkezés");

  cy.get(".navbar").contains("Szolgáltatások").click();
  cy.contains("button", "Naptár", { timeout: 5000 }).click();

  cy.contains("button", "Kosárba").click();
  cy.get(".navbar").contains("Kosár").should("exist");
});

  it(" Profil oldal elérhető bejelentkezés után", () => {
    cy.visit(BASE);
    cy.get(".navbar").contains("Bejelentkezés").click();
    cy.get(".login-form input[type='email']").type("teszt@user.hu");
    cy.get(".login-form input[type='password']").type("Teszt1234");
    cy.get(".login-form button[type='submit']").click();
    cy.get(".navbar", { timeout: 5000 }).contains("Fiók").click();
    cy.get("body").should("contain", "teszt@user.hu");
  });

  it(" Kijelentkezés után eltűnik a Fiók menüpont", () => {
    cy.visit(BASE);
    cy.get(".navbar").contains("Bejelentkezés").click();
    cy.get(".login-form input[type='email']").type("teszt@user.hu");
    cy.get(".login-form input[type='password']").type("Teszt1234");
    cy.get(".login-form button[type='submit']").click();
    cy.get(".navbar", { timeout: 5000 }).contains("Kijelentkezés").click();
    cy.get(".navbar").should("not.contain", "Fiók");
    cy.get(".navbar").should("contain", "Bejelentkezés");
  });

  it(" Főoldalon megjelenik a rating átlag doboz", () => {
    cy.visit(BASE);
    cy.get("body", { timeout: 5000 }).should("contain", "★");
  });

  it(" Szolgáltatások oldalon termékek töltődnek be", () => {
    cy.visit(BASE);
    cy.get(".navbar").contains("Szolgáltatások").click();
    cy.get("body", { timeout: 6000 }).should("contain", "Kosárba");
  });

});