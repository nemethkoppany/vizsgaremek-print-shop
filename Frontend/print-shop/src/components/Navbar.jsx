export default function Navbar({ page, setPage, cartCount = 0 }) {
  return (
    <nav className="navbar">
      <div className="logo">Fénymásoló Webshop</div>

      <ul className="nav-links">
        {page !== "home" && (
          <li><button onClick={() => setPage("home")}>Főoldal</button></li>
        )}

        {page !== "arlista" && (
          <li><button onClick={() => setPage("arlista")}>Árlista</button></li>
        )}

        {page !== "services" && (
          <li><button onClick={() => setPage("services")}>Szolgáltatások</button></li>
        )}

        {page !== "cart" && (
          <li>
            <button onClick={() => setPage("cart")}>
              Kosár {cartCount > 0 ? `(${cartCount})` : ""}
            </button>
          </li>
        )}

        {page !== "login" && (
          <li><button onClick={() => setPage("login")}>Bejelentkezés</button></li>
        )}
      </ul>

      <div className="profile-icon" title="Profil" onClick={() => setPage("profile")} role="button" />
    </nav>
  );
}
