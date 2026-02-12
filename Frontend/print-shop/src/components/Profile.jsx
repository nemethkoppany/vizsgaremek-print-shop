import { useEffect, useRef, useState } from "react";
import profImg from "../assets/prof.png";
import { api, BASE_URL, setMe as saveMeLocal } from "../api";

const money = (n) => `${Number(n || 0).toLocaleString("hu-HU")} Ft`;
const avatarKey = (id) => `avatar_override_${id}`;

const getAvatarOverride = (id) => {
  if (!id) return "";
  try {
    return localStorage.getItem(avatarKey(id)) || "";
  } catch {
    return "";
  }
};

const setAvatarOverride = (id, dataUrl) => {
  if (!id) return false;
  try {
    if (dataUrl) localStorage.setItem(avatarKey(id), dataUrl);
    else localStorage.removeItem(avatarKey(id));
    return true;
  } catch {
    return false;
  }
};

const fileToSmallJpegDataUrl = (file, maxSize = 256, quality = 0.82) =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = reject;
    fr.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const w = img.width || 1;
        const h = img.height || 1;
        const scale = Math.min(maxSize / w, maxSize / h, 1);
        const tw = Math.max(1, Math.round(w * scale));
        const th = Math.max(1, Math.round(h * scale));

        const canvas = document.createElement("canvas");
        canvas.width = tw;
        canvas.height = th;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no_canvas"));

        ctx.drawImage(img, 0, 0, tw, th);
        const out = canvas.toDataURL("image/jpeg", quality);
        resolve(out);
      };
      img.src = String(fr.result || "");
    };
    fr.readAsDataURL(file);
  });

function Msg({ msg }) {
  if (!msg) return null;
  return <div className={`message-box ${msg.type}`}>{msg.text}</div>;
}

function StatusPill({ status }) {
  const s = String(status || "");
  const bg =
    {
      Beérkezett: "rgba(56,189,248,.18)",
      "Feldolgozás alatt": "rgba(167,139,250,.18)",
      "Nyomtatás alatt": "rgba(34,197,94,.16)",
      Csomagolás: "rgba(251,191,36,.16)",
      Kész: "rgba(59,130,246,.16)",
      Kiszállítva: "rgba(16,185,129,.16)",
      Törölve: "rgba(239,68,68,.18)",
    }[s] || "rgba(15,23,42,.6)";

  const dot =
    {
      Beérkezett: "rgba(56,189,248,1)",
      "Feldolgozás alatt": "rgba(167,139,250,1)",
      "Nyomtatás alatt": "rgba(34,197,94,1)",
      Csomagolás: "rgba(251,191,36,1)",
      Kész: "rgba(59,130,246,1)",
      Kiszállítva: "rgba(16,185,129,1)",
      Törölve: "rgba(239,68,68,1)",
    }[s] || "rgba(148,163,184,1)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 800,
        border: "1px solid rgba(148,163,184,.25)",
        background: bg,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 999, background: dot }} />
      {s || "-"}
    </span>
  );
}

export default function Profile({ me, initialOrderId = null, onMeChange }) {
  const fileRef = useRef(null);
  const [profileImage, setProfileImage] = useState(profImg);

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);

  const [form, setForm] = useState({ full_name: "", email: "" });
  const [pw, setPw] = useState({ oldPassword: "", newPassword: "", newPassword2: "" });
  const [msg, setMsg] = useState(null);

  const show = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 7000);
  };

  useEffect(() => {
    if (!me?.user_id) return;
    (async () => {
      try {
        const u = await api.getUserById(me.user_id);
        setUser(u);
        setForm({ full_name: u.name || u.full_name || "", email: u.email || "" });
      } catch (e) {
        show(e.message || "Profil betöltési hiba", "error");
      }
    })();
  }, [me?.user_id]);

  useEffect(() => {
    if (!me?.user_id) return;
    (async () => {
      try {
        const list = await api.getUserOrders(me.user_id);
        setOrders(Array.isArray(list) ? list : []);
      } catch {
        setOrders([]);
      }
    })();
  }, [me?.user_id]);

  useEffect(() => {
    if (!initialOrderId) return;
    (async () => {
      try {
        const d = await api.getOrder(initialOrderId);
        setOrderDetails(d);
      } catch (e) {
        show(e.message || "Rendelés betöltési hiba", "error");
      }
    })();
  }, [initialOrderId]);

  useEffect(() => {
    if (!me?.user_id) return setProfileImage(profImg);

    const override = getAvatarOverride(me.user_id);
    if (override) return setProfileImage(override);

    const fn = user?.profile_image || me?.profile_image;
    if (!fn) return setProfileImage(profImg);

    setProfileImage(`${BASE_URL}/uploads/${fn}`);
  }, [me?.user_id, user?.profile_image, me?.profile_image]);

  const onPickImage = () => fileRef.current?.click();

  const onImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !me?.user_id) return;

    try {
      const res = await api.updateUserProfileImage(me.user_id, file);
      const newFile = res?.profile_image;

      if (newFile) {
        setAvatarOverride(me.user_id, "");
        const nextMe = { ...me, profile_image: newFile };
        saveMeLocal(nextMe);
        onMeChange?.(nextMe);
        setProfileImage(`${BASE_URL}/uploads/${newFile}`);
        window.dispatchEvent(
          new CustomEvent("profile-avatar-updated", { detail: { user_id: me.user_id } })
        );
        show("Profilkép elmentve", "success");
      }
    } catch (err) {
      if (err?.status === 404) {
        try {
          const dataUrl = await fileToSmallJpegDataUrl(file, 256, 0.82);
          const ok = setAvatarOverride(me.user_id, dataUrl);

          if (!ok) {
            show("A profilkép túl nagy méretű! Válasszon kisebbet!", "error");
          } else {
            setProfileImage(dataUrl);
            window.dispatchEvent(
              new CustomEvent("profile-avatar-updated", { detail: { user_id: me.user_id } })
            );
            show("Profilkép elmentve", "success");
          }
        } catch {
          show("Nem sikerült feldolgozni a profilképet.", "error");
        }
      } else {
        show("Nem sikerült feltölteni a profilképet.", "error");
      }
    } finally {
      e.target.value = "";
    }
  };

  const onSaveProfile = async (e) => {
    e.preventDefault();
    if (!me?.user_id) return;

    try {
      await api.updateUser(me.user_id, {
        full_name: form.full_name,
        email: form.email,
        name: form.full_name,
      });

      show("Profil adatok elmentve.");

      const u = await api.getUserById(me.user_id);
      setUser(u);
    } catch (e2) {
      show(e2.message || "Mentés hiba", "error");
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();

    if (!pw.oldPassword || !pw.newPassword || !pw.newPassword2)
      return show("Töltsön ki minden mezőt!", "error");

    if (pw.newPassword.length < 6)
      return show("Az új jelszó legyen legalább 6 karakter hosszú.", "error");

    if (pw.newPassword !== pw.newPassword2)
      return show("Az új jelszavak nem egyeznek!", "error");

    try {
      await api.changePassword({ oldPassword: pw.oldPassword, newPassword: pw.newPassword });
      setPw({ oldPassword: "", newPassword: "", newPassword2: "" });
      show("Jelszó sikeresen megváltoztatva");
    } catch (e2) {
      show(e2.message || "Jelszócsere hiba", "error");
    }
  };

  if (!me) {
    return (
      <section className="profile-page">
        <div className="profile-card">
          <h2>Profil</h2>
          <p>Jelentkezzen be profilja megtekintéséhez.</p>
        </div>
      </section>
    );
  }

  const totalSpent = (orders || []).reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);

  return (
    <section className="profile-page">
      <div className="profile-card">
        <div className="profile-top">
          <img className="profile-avatar" src={profileImage} alt="Profilkép" />

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={onImageChange}
          />

          <button className="profile-btn" type="button" onClick={onPickImage}>
            Profilkép módosítása
          </button>

          <div className="profile-mini">
            <div>
              <strong>{user?.name || user?.full_name || me.name || me.full_name}</strong>
            </div>
            <div className="muted">{user?.email || me.email}</div>
          </div>
        </div>

        <Msg msg={msg} />

        <div className="profile-section">
          <h2>Profil adatok</h2>

          <form className="profile-form" onSubmit={onSaveProfile}>
            <label>
              <strong>Név:</strong>
            </label>

            <input
              value={form.full_name}
              onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
            />

            <label>
              <strong>Email:</strong>
            </label>

            <input
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            />

            <button type="submit">Mentés</button>
          </form>
        </div>

        <div className="profile-section">
          <h2>Jelszó módosítása</h2>

          <form className="profile-form" onSubmit={onChangePassword}>
            <label>
              <strong>Jelenlegi jelszó:</strong>
            </label>

            <input
              type="password"
              value={pw.oldPassword}
              onChange={(e) => setPw((p) => ({ ...p, oldPassword: e.target.value }))}
            />

            <label>
              <strong>Új jelszó:</strong>
            </label>

            <input
              type="password"
              value={pw.newPassword}
              onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
            />

            <label>
              <strong>Új jelszó megerősítése:</strong>
            </label>

            <input
              type="password"
              value={pw.newPassword2}
              onChange={(e) => setPw((p) => ({ ...p, newPassword2: e.target.value }))}
            />

            <button type="submit">Jelszó megváltoztatása</button>
          </form>
        </div>

        <div className="profile-section">
          <h2>Korábbi megrendeléseim</h2>

          <div className="orders-summary">
            <p>
              <strong>Megrendelések száma:</strong> {orders.length}
            </p>

            <p>
              <strong>Összesen fizetve:</strong> {totalSpent.toLocaleString("hu-HU")} Ft
            </p>
          </div>

          <ul className="orders-list">
            {orders.map((o) => (
              <li className="order-item" key={o.order_id}>
                <div className="order-left">
                  <div className="order-id">Rendelés #{o.order_id}</div>

                  <div
                    className="order-desc"
                    style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}
                  >
                    <StatusPill status={o.status} />
                    <span className="muted">{new Date(o.createdAt).toLocaleString("hu-HU")}</span>
                  </div>
                </div>

                <div className="order-price">{money(o.total_price)}</div>

                <button
                  type="button"
                  className="svc-secondary"
                  onClick={async () => {
                    try {
                      const d = await api.getOrder(o.order_id);
                      setOrderDetails(d);
                    } catch (e) {
                      show(e.message || "Részletek hiba", "error");
                    }
                  }}
                >
                  Részletek
                </button>
              </li>
            ))}
          </ul>

          {orderDetails && (
            <div className="admin-card" style={{ marginTop: 14 }}>
              <h3>Rendelés részletek: #{orderDetails.order_id} rendelése</h3>

              <div className="orders-details">
                <div className="orders-details-row">
                  <div className="muted">Státusz</div>
                  <div>
                    <StatusPill status={orderDetails.status} />
                  </div>
                </div>

                <div className="orders-details-row">
                  <div className="muted">Végösszeg</div>
                  <div>
                    <strong>{money(orderDetails.total_price)}</strong>
                  </div>
                </div>

                <div className="orders-table-wrap">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Termék</th>
                        <th className="right">Mennyiség</th>
                      </tr>
                    </thead>

                    <tbody>
                      {(orderDetails.items || []).map((it, idx) => (
                        <tr key={idx}>
                          <td>{it.product_name || it.name || `#${it.product_id}`}</td>
                          <td className="right">{it.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="admin-actions" style={{ marginTop: 10 }}>
                  <button type="button" className="svc-secondary" onClick={() => setOrderDetails(null)}>
                    Bezárás
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}