import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Intro from "./components/Intro";
import Contact from "./components/Contact";
import "./index.css";

export default function App() {
  return (
    <div className="container">
      <Navbar />
      <Hero />
      <Intro />
      <Contact />
    </div>
  );
}
