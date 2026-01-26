export default function Navbar({ page, setPage, cartCount = 0 }) {
  return (
    <nav className="navbar">
      <div
        className="nav-banner-strip"
        aria-label="Duplex Print banner"/>
      <div className="nav-bottom">
        <ul className="nav-links">
          <li>
            <button
              className={page === "home" ? "active" : ""}
              onClick={() => setPage("home")}
              type="button">
              Főoldal
            </button>
          </li>
          <li>
            <button
              className={page === "arlista" ? "active" : ""}
              onClick={() => setPage("arlista")}
              type="button">
              Árlista
            </button>
          </li>
          <li>
            <button
              className={page === "services" ? "active" : ""}
              onClick={() => setPage("services")}
              type="button">
              Szolgáltatások
            </button>
          </li>
          <li>
            <button
              className={page === "cart" ? "active" : ""}
              onClick={() => setPage("cart")}
              type="button">
              Kosár{cartCount > 0 ? ` (${cartCount})` : ""}
            </button>
          </li>
          <li>
            <button
              className={page === "login" ? "active" : ""}
              onClick={() => setPage("login")}
              type="button">
              Bejelentkezés
            </button>
          </li>
        </ul>
        <button
          className="profile-icon"
          onClick={() => setPage("profile")}
          type="button"
          aria-label="Profil"/>
      </div>
    </nav>
  );
}