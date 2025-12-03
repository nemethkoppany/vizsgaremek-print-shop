import Fooldal from "./components/Fooldal.jsx";
import Navbar from "./components/Navbar.jsx";
import Arlista from "./components/Arlista.jsx";
import "./index.css";
import { useState } from "react";

export default function App() {
  const [page, setPage] = useState("home")

  return (
    <div className="container">
      <Navbar page={page} setPage={setPage}/>
      {page === "home" && <Fooldal />}
      {page === "arlista" && <Arlista setPage={setPage} />}
    </div>
  );
}
