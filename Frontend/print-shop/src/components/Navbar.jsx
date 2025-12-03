export default function Navbar({page, setPage}) {
  return (
    <nav className="navbar">
      <div className="logo">Fénymásoló Webshop</div>

      <ul className="nav-links">
        <li>Bejelentkezés</li>
        <li>Szolgáltatások</li>
        <li>
          {page === "home" ? (<button onClick={() => setPage("arlista")}>Árlista</button>) : (
            <button onClick={() => setPage("home")}>Főoldal</button>
          )}
          
        </li>
      </ul>

      <div className="profile-icon"></div>
    </nav>
  );
}
