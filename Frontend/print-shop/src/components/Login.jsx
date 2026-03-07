import { useState } from "react";

export default function Login({ auth, me, setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginMessage, setLoginMessage] = useState("");
  const [loginType, setLoginType] = useState("");

  const showLoginMessage = (text, type) => {
    setLoginMessage(text);
    setLoginType(type);
    setTimeout(() => setLoginMessage(""), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showLoginMessage("Kérem adja meg az email címét és a jelszavát!", "error");
      return;
    }

    try {
      await auth.login(email, password);
      showLoginMessage("Sikeres bejelentkezés!", "success");
      setEmail("");
      setPassword("");
    } catch (err) {
      showLoginMessage(err?.message || "Sikertelen bejelentkezés!", "error");
    }
  };

  return (
    <section className="login">
      <h2>Bejelentkezés</h2>

      {me && (
        <div className="message-box success" style={{ marginBottom: 12 }}>
          Már be vagy jelentkezve: <b>{me.email}</b>
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          <strong>Email:</strong>
        </label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>
          <strong>Jelszó:</strong>
        </label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {loginMessage && <div className={`message-box ${loginType}`}>{loginMessage}</div>}

        <button type="submit">Belépés</button>

        <button
          type="button"
          className="svc-secondary"
          onClick={() => setPage?.("register")}
          style={{ marginTop: 10 }}
        >
          Nincs fiókom – Regisztráció
        </button>
      </form>
    </section>
  );
}