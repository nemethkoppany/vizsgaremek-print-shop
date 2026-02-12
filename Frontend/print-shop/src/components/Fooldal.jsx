import Hero from "./Hero.jsx";
import Intro from "./Intro.jsx";
import Contact from "./Contact.jsx";
import StoreReviewsBox from "./StoreReviewsBox";

export default function Fooldal({ setPage, ratingAvg = null, me = null }) {
  return (
    <>
      <Hero setPage={setPage} />
      <Intro />
      <Contact />
      <StoreReviewsBox backendSummary={ratingAvg} me={me} />
    </>
  );
}