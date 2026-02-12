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

  useEffect(() => {
    const id = me?.user_id;
    if (!id) return setAvatarUrl(profImg);

    const override = getAvatarOverride(id);
    if (override) return setAvatarUrl(override);

    const fn = me?.profile_image;
    if (fn) return setAvatarUrl(`${BASE_URL}/uploads/${fn}`);
    setAvatarUrl(profImg);
  }, [me?.user_id, me?.profile_image]);

  useEffect(() => {
    const handler = (e) => {
      const id = e?.detail?.user_id;
      if (!id || id !== me?.user_id) return;

      const override = getAvatarOverride(id);
      if (override) return setAvatarUrl(override);

      const fn = me?.profile_image;
      if (fn) return setAvatarUrl(`${BASE_URL}/uploads/${fn}`);
      setAvatarUrl(profImg);
    };

    window.addEventListener("profile-avatar-updated", handler);
    return () => window.removeEventListener("profile-avatar-updated", handler);
  }, [me?.user_id, me?.profile_image]);

  return (
    <nav className="navbar">
      <div className="nav-banner-strip" />

      <div className="nav-bottom">
        <ul className="nav-links">
          <li>
            <button className={page === "home" ? "active" : ""} onClick={() => setPage("home")}>
              Főoldal
            </button>
          </li>

          <li>
            <button className={page === "arlista" ? "active" : ""} onClick={() => setPage("arlista")}>
              Árlista
            </button>
          </li>

          <li>
            <button className={page === "services" ? "active" : ""} onClick={() => setPage("services")}>
              Szolgáltatások
            </button>
          </li>

          <li>
            <button className={page === "cart" ? "active" : ""} onClick={() => setPage("cart")}>
              Kosár ({cartCount})
            </button>
          </li>

          {me ? (
            <>
              <li>
                <button className={page === "profile" ? "active" : ""} onClick={() => setPage("profile")}>
                  Fiók
                </button>
              </li>

              {isAdmin && (
                <li>
                  <button className={page === "admin" ? "active" : ""} onClick={() => setPage("admin")}>
                    Admin
                  </button>
                </li>
              )}

              <li>
                <button onClick={onLogout}>Kijelentkezés</button>
              </li>
            </>
          ) : (
            <li>
              <button className={page === "login" ? "active" : ""} onClick={() => setPage("login")}>
                Bejelentkezés / Regisztráció
              </button>
            </li>
          )}
        </ul>

        <button
          className="profile-icon"
          type="button"
          onClick={() => setPage(me ? "profile" : "login")}
          title="Profil"
        >
          <img className="profile-avatar-img" src={avatarUrl} alt="Profil" />
        </button>
      </div>
    </nav>
  );
}