import { useRef, useState } from "react";

export default function Profile() {
  const fileRef = useRef(null);

  const [profileImage, setProfileImage] = useState("./src/assets/prof.png");
  const [orders] = useState([
    { id: "Order-1", items: "A/4 fekete-fehér (25 oldal)", total: 1000 },
    { id: "Order-2", items: "Poszter (80g, tervrajz)", total: 2000 },
    { id: "Order-3", items: "Falinaptár A/4 1db", total: 3990 },
  ]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  const [profileMsg, setProfileMsg] = useState("");
  const [profileMsgType, setProfileMsgType] = useState("");

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  const showProfileMsg = (text, type) => {
    setProfileMsg(text);
    setProfileMsgType(type);
    setTimeout(() => setProfileMsg(""), 7000);
  };

  const showMsg = (text, type) => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(""), 7000);
  };

  const onPickImage = () => fileRef.current?.click();

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    //később majd változtatni kell ha össze lesz kötve a backenddel
    const url = URL.createObjectURL(file);
    setProfileImage(url);
    showProfileMsg("Profilkép frissítve!", "success");
  };

  const onChangePassword = (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !newPassword2) {
      showMsg("Kérlek tölts ki minden mezőt!", "error");
      return;
    }
    if (newPassword.length < 6) {
      showMsg("Az új jelszó legyen legalább 6 karakter hosszú.", "error");
      return;
    }
    if (newPassword !== newPassword2) {
      showMsg("Az új megadott jelszavak nem egyeznek!", "error");
      return;
    }
    showMsg("Jelszó sikeresen megváltoztatva!", "success");

    setCurrentPassword("");
    setNewPassword("");
    setNewPassword2("");
  };

  const orderCount = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <section className="profile-page">
      <div className="profile-card">
        <div className="profile-top">
          <img className="profile-avatar" src={profileImage} alt="Profilkép" />
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onImageChange}/>
          <button className="profile-btn" type="button" onClick={onPickImage}>Profilkép módosítása</button>
          {profileMsg && (
            <div className={`message-box ${profileMsgType}`} style={{ marginTop: 12 }}>
            {profileMsg}
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2>Jelszó módosítása</h2>
          <form className="profile-form" onSubmit={onChangePassword}>
            <label>
              <strong>Jelenlegi jelszó:</strong>
            </label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}/>

            <label>
              <strong>Új jelszó:</strong>
            </label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>

            <label>
              <strong>Új jelszó megerősítése:</strong>
            </label>
            <input type="password" value={newPassword2} onChange={(e) => setNewPassword2(e.target.value)}/>
            {msg && 
            <div className={`message-box ${msgType}`}>{msg}
            </div>}

            <button type="submit">Jelszó megváltoztatása</button>
          </form>
        </div>

        <div className="profile-section">
          <h2>Korábbi megrendeléseim</h2>
          <div className="orders-summary">
            <p>
              <strong>Megrendelések száma:</strong> {orderCount}
            </p>
            <p>
              <strong>Összesen fizetve:</strong> {totalSpent.toLocaleString("hu-HU")} Ft
            </p>
          </div>

          <ul className="orders-list">
            {orders.map((o) => (
              <li className="order-item" key={o.id}>
                <div className="order-left">
                  <div className="order-id">{o.id}</div>
                  <div className="order-desc">{o.items}</div>
                </div>
                <div className="order-price">
                  {o.total.toLocaleString("hu-HU")} Ft
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}