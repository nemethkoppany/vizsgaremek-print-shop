import { useState } from "react";

export default function Register({ auth, me, setPage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");

  const [msg, setMsg] = useState("");
  const [type, setType] = useState("");

  const flash = (text, t) => {
    setMsg(text);
    setType(t);
    setTimeout(() => setMsg(""), 5000);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!name || !email || !pwd || !pwd2) return flash("Tölts ki minden mezőt!", "error");
    if (pwd !== pwd2) return flash("A jelszavak nem egyeznek!", "error");

    try {
      await auth.register(name, email, pwd);
      flash("Sikeres regisztráció! Átirányítás a bejelentkezésre…", "success");
      setName(""); setEmail(""); setPwd(""); setPwd2("");
      setTimeout(() => setPage?.("login"), 600);
    } catch (e2) {
      flash(e2?.message || "Sikertelen regisztráció.", "error");
    }
  };

  return (
    <section className="register">
      <h2>Regisztráció</h2>

      {me && (
        <div className="message-box success" style={{ marginBottom: 12 }}>
          Már be vagy jelentkezve: <b>{me.email}</b>
        </div>
      )}

      <form className="register-form" onSubmit={submit}>
        <label><strong>Név:</strong></label>
        <input value={name} onChange={(e) => setName(e.target.value)} />

        <label><strong>Email:</strong></label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label><strong>Jelszó:</strong></label>
        <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} />

        <label><strong>Jelszó megerősítése:</strong></label>
        <input type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} />

        {msg && <div className={`message-box ${type}`}>{msg}</div>}

        <button type="submit">Regisztráció</button>

        <button type="button" className="svc-secondary" onClick={() => setPage?.("login")} style={{ marginTop: 10 }}>
          Már van fiókom – Bejelentkezés
        </button>
      </form>
    </section>
  );
}