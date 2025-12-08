export default function Navbar({page, setPage}) {
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

        {page !== "login" && (
          <li><button onClick={() => setPage("login")}>Bejelentkezés</button></li>
        )}

        <li>Szolgáltatások</li>
      </ul>

      <div className="profile-icon"></div>
    </nav>
  );
}
