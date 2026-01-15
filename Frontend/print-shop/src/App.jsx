import Fooldal from "./components/Fooldal.jsx";
import Navbar from "./components/Navbar.jsx";
import Arlista from "./components/Arlista.jsx";
import Login from "./components/Login.jsx";
import Profile from "./components/Profile.jsx";
import Services from "./components/Services.jsx";
import Cart from "./components/Cart.jsx";
import "./index.css";
import { useState } from "react";

export default function App() {
  const [page, setPage] = useState("home");
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => setCartItems((prev) => [item, ...prev]);
  const removeFromCart = (id) => setCartItems((prev) => prev.filter((x) => x.id !== id));

  return (
    <div className="container">
      <Navbar page={page} setPage={setPage} cartCount={cartItems.length} />

      {page === "home" && <Fooldal />}
      {page === "arlista" && <Arlista setPage={setPage} />}
      {page === "services" && (
        <Services
          addToCart={addToCart}
          goToCart={() => setPage("cart")}
        />
      )}
      {page === "cart" && (
        <Cart
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          goToServices={() => setPage("services")}
        />
      )}
      {page === "login" && <Login setPage={setPage} />}
      {page === "profile" && <Profile />}
    </div>
  );
}
