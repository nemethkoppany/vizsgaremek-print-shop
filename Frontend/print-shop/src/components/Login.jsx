import { useState } from "react";
 
export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loginMessage, setLoginMessage] = useState("");
    const [loginType, setLoginType] = useState("");

    const [registrationName, setRegistrationName] = useState("");
    const [registrationEmail, setRegistrationEmail] = useState("");
    const [registrationPassword, setRegistrationPassword] = useState("");
    const [registrationConfirm, setRegistrationConfirm] = useState("");

    const [registerMessage, setRegisterMessage] = useState("");
    const [registerType, setRegisterType] = useState("");

    const showLoginMessage = (text, type) => {
        setLoginMessage(text);
        setLoginType(type);
        setTimeout(() => setLoginMessage(""), 5000);
    };

    const showRegisterMessage = (text, type) => {
        setRegisterMessage(text);
        setRegisterType(type);
        setTimeout(() => setRegisterMessage(""), 5000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) {
            showLoginMessage("Kérlek add meg az email címedet és a jelszavadat.", "error");
            return;
        }
        showLoginMessage("Sikeres bejelentkezés!", "success");

        setEmail("");
        setPassword("");
    };

    const handleRegister = (e) => {
        e.preventDefault();

        if (!registrationName || !registrationEmail || !registrationPassword || !registrationConfirm) {
            showRegisterMessage("Kérlek tölts ki minden mezőt!", "error");
            return;
        }
        if (registrationPassword !== registrationConfirm) {
            showRegisterMessage("A jelszavak nem egyeznek!", "error");
            return;
        }
        showRegisterMessage("Sikeres regisztráció!", "success");

        setRegistrationName("");
        setRegistrationEmail("");
        setRegistrationPassword("");
        setRegistrationConfirm("");
    };
 
    return (
        <div>
            <section className="login">
                <h2>Bejelentkezés</h2>
                <form className="login-form" onSubmit={handleSubmit}>
                    <label>
                        <strong>Email:</strong>
                    </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}/>

                    <label>
                        <strong>Jelszó:</strong>
                    </label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>

                    {loginMessage && (
                        <div className={`message-box ${loginType}`}>
                            {loginMessage}
                        </div>
                    )}
                    <button type="submit">Belépés</button>
                </form>
            </section>
            <hr />
            <section className="register">
                <h2>Regisztráció</h2>
                <form className="register-form" onSubmit={handleRegister}>
                    <label>
                        <strong>Név:</strong>
                    </label>
                    <input type="text" value={registrationName} onChange={(e) => setRegistrationName(e.target.value)}/>

                    <label>
                        <strong>Email:</strong>
                    </label>
                    <input type="email" value={registrationEmail} onChange={(e) => setRegistrationEmail(e.target.value)}/>

                    <label>
                        <strong>Jelszó:</strong>
                    </label>
                    <input type="password" value={registrationPassword} onChange={(e) => setRegistrationPassword(e.target.value)}/>

                    <label>
                        <strong>Jelszó megerősítése:</strong>
                    </label>
                    <input type="password" value={registrationConfirm} onChange={(e) => setRegistrationConfirm(e.target.value)}/>

                    {registerMessage && (
                        <div className={`message-box ${registerType}`}>
                            {registerMessage}
                        </div>
                    )}
                    <button type="submit">Regisztráció</button>
                </form>
            </section>
        </div>
    );
}