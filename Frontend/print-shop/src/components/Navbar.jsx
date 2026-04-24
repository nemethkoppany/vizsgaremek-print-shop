import { useEffect, useState } from "react";
import profImg from "../assets/prof.png";
import { BASE_URL } from "../api";

const avatarKey = (id) => `avatar_override_${id}`;

const getAvatarOverride = (id) => {
  if (!id) return "";
  try {
    return localStorage.getItem(avatarKey(id)) || "";
  } catch {
    return "";
  }
};

export default function Navbar({ page, setPage, cartCount = 0, me = null, onLogout }) {
  const isAdmin = (me?.role || "") === "admin";
  const [avatarUrl, setAvatarUrl] = useState(profImg);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const id = me?.user_id;

    if (!id) {
      setAvatarUrl(profImg);
      return;
    }

    const override = getAvatarOverride(id);
    if (override) {
      setAvatarUrl(override);
      return;
    }

    const fn = me?.profile_image;
    if (fn) {
      setAvatarUrl(`${BASE_URL}/uploads/${fn}`);
      return;
    }

    setAvatarUrl(profImg);
  }, [me?.user_id, me?.profile_image]);

  useEffect(() => {
    const handler = (e) => {
      const id = e?.detail?.user_id;
      if (!id || id !== me?.user_id) return;

      const override = getAvatarOverride(id);
      if (override) {
        setAvatarUrl(override);
        return;
      }

      const fn = me?.profile_image;
      if (fn) {
        setAvatarUrl(`${BASE_URL}/uploads/${fn}`);
        return;
      }

      setAvatarUrl(profImg);
    };

    window.addEventListener("profile-avatar-updated", handler);
    return () => window.removeEventListener("profile-avatar-updated", handler);
  }, [me?.user_id, me?.profile_image]);

  useEffect(() => {
    setMenuOpen(false);
  }, [page]);

  const navigate = (target) => {
    setPage(target);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-banner-strip" />

      <div className="nav-bottom">
        <button
          className="nav-hamburger"
          type="button"
          aria-label="Menü megnyitása"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((old) => !old)}
        >
          <span />
          <span />
          <span />
        </button>

        <button
          className="profile-icon"
          type="button"
          onClick={() => navigate(me ? "profile" : "login")}
          title="Profil"
        >
          <img className="profile-avatar-img" src={avatarUrl} alt="Profil" />
        </button>

        {menuOpen && (
          <div className="nav-menu">
            <button className={page === "home" ? "active" : ""} onClick={() => navigate("home")}>
              Főoldal
            </button>

            <button className={page === "arlista" ? "active" : ""} onClick={() => navigate("arlista")}>
              Árlista
            </button>

            <button className={page === "services" ? "active" : ""} onClick={() => navigate("services")}>
              Szolgáltatások
            </button>

            <button className={page === "cart" ? "active" : ""} onClick={() => navigate("cart")}>
              Kosár ({cartCount})
            </button>

            {me ? (
              <>
                <button className={page === "profile" ? "active" : ""} onClick={() => navigate("profile")}>
                  Fiók
                </button>

                {isAdmin && (
                  <button className={page === "admin" ? "active" : ""} onClick={() => navigate("admin")}>
                    Admin
                  </button>
                )}

                <button onClick={handleLogout}>Kijelentkezés</button>
              </>
            ) : (
              <button className={page === "login" ? "active" : ""} onClick={() => navigate("login")}>
                Bejelentkezés / Regisztráció
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}