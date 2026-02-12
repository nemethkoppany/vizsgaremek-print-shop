import Fooldal from "./components/Fooldal.jsx";
import Navbar from "./components/Navbar.jsx";
import Arlista from "./components/Arlista.jsx";
import Login from "./components/Login.jsx";
import Profile from "./components/Profile.jsx";
import Services from "./components/Services.jsx";
import Cart from "./components/Cart.jsx";
import Admin from "./components/Admin.jsx";
import "./index.css";
import { useEffect, useMemo, useState } from "react";
import { api, setMe, setToken } from "./api";

function getCartKey(me) {
  if (!me) return "cart_guest";
  const role = me.role || "user";
  const uid = me.user_id || me.userId || me.id || "x";
  return `cart_${role}_${uid}`;
}

function loadCart(me) {
  const key = getCartKey(me);
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(me, items) {
  const key = getCartKey(me);
  try {
    localStorage.setItem(key, JSON.stringify(items || []));
  } catch {}
}

export default function App() {
  const [page, setPage] = useState("home");

  const [me, setMeState] = useState(null);
  const [token, setTokenState] = useState("");

  const [cartItems, setCartItems] = useState(() => loadCart(null));

  const [products, setProducts] = useState([]);
  const [ratingAvg, setRatingAvg] = useState(null);

  const addToCart = (item) => setCartItems((prev) => [item, ...prev]);
  const removeFromCart = (id) =>
    setCartItems((prev) => prev.filter((x) => x.id !== id));

  const isAdmin = (me?.role || "") === "admin";

  useEffect(() => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("me");
    } catch {}
  }, []);

  useEffect(() => {
    setToken(token);
  }, [token]);

  useEffect(() => {
    setCartItems(loadCart(me));
  }, [me?.user_id, me?.role, token]);

  useEffect(() => {
    saveCart(me, cartItems);
  }, [cartItems, me?.user_id, me?.role]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const p = await api.getProducts();
        if (!alive) return;
        setProducts(Array.isArray(p) ? p : []);
      } catch {
        if (!alive) return;
        setProducts([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    let t = null;

    const refresh = async () => {
      try {
        const avg = await api.getRatingAverage();
        if (!alive) return;
        setRatingAvg(avg || null);
      } catch {
        if (!alive) return;
        setRatingAvg(null);
      }
    };

    refresh();
    t = setInterval(refresh, 10000);

    const onUpdate = () => refresh();
    window.addEventListener("ratings-updated", onUpdate);

    return () => {
      alive = false;
      if (t) clearInterval(t);
      window.removeEventListener("ratings-updated", onUpdate);
    };
  }, []);

  const authActions = useMemo(() => {
    return {
      async login(email, password) {
        const res = await api.login({ email, password });
        setTokenState(res.accessToken);
        setMeState(res);
        setMe(res);
        setPage("home");

        try {
          await api.createSystemLog({
            event_type: "LOGIN",
            message: `User ${res.user_id} logged in`,
          });
        } catch {}

        return res;
      },

      async register(full_name, email, password, profileFile = null) {
        const fd = new FormData();
        fd.append("full_name", full_name);
        fd.append("email", email);
        fd.append("password", password);
        if (profileFile) fd.append("file", profileFile);

        const res = await api.register(fd);

        try {
          await api.createSystemLog({
            event_type: "REGISTER",
            message: `New user registered: ${email}`,
          });
        } catch {}

        setPage("login");
        return res;
      },

      logout() {
        setTokenState("");
        setMeState(null);
        setToken("");
        setMe(null);
        setPage("home");
      },
    };
  }, []);

  return (
    <div className="container">
      <Navbar
        page={page}
        setPage={setPage}
        cartCount={cartItems.length}
        me={me}
        onLogout={authActions.logout}
      />

      {page === "home" && (
        <Fooldal setPage={setPage} ratingAvg={ratingAvg} me={me} />
      )}

      {page === "arlista" && <Arlista setPage={setPage} />}

      {page === "services" && (
        <Services
          addToCart={addToCart}
          goToCart={() => setPage("cart")}
          products={products}
          me={me}
        />
      )}

      {page === "cart" && (
        <Cart
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          goToServices={() => setPage("services")}
          me={me}
          onOrderCreated={(orderId) => setPage(`order:${orderId}`)}
        />
      )}

      {page === "login" && <Login auth={authActions} me={me} />}

      {page === "profile" && (
        <Profile
          me={me}
          onMeChange={(nextMe) => {
            setMeState(nextMe);
          }}
        />
      )}

      {page.startsWith("order:") && (
        <Profile
          me={me}
          initialOrderId={page.split(":")[1]}
          onMeChange={(nextMe) => {
            setMeState(nextMe);
          }}
        />
      )}

      {page === "admin" && (
        <Admin
          me={me}
          isAdmin={isAdmin}
          products={products}
          onProductsChanged={async () => {
            const p = await api.getProducts();
            setProducts(Array.isArray(p) ? p : []);
          }}
        />
      )}
    </div>
  );
}