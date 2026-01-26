export default function Intro() {
  return (
    <section className="home-intro home-card-block">
      <header className="section-head">
        <h2>Bemutatkozás</h2>
        <p className="section-sub">
          Digitális nyomda, ahol a rendelés egyszerű, a minőség pedig garantált.
        </p>
      </header>
      <p>
        Célunk, hogy kényelmes, egyszerű online nyomtatási és másolási környezetet
        biztosítsunk minden megrendelőnek. Legyen szó iskolai jegyzetekről,
        céges dokumentumokról vagy személyes poszterekről, naptárakról — nálunk
        mindent online intézhet pár kattintással. Szolgáltatásainkat úgy
        alakítottuk ki, hogy minél kevesebb idő alatt garantáltan kiváló
        minőséget kapjon.
      </p>
      <div className="intro-highlights">
        <div className="highlight">
          <h3>Gyors, egyszerű, átlátható folyamat</h3>
          <p>
            Feltöltés → előnézet → rendelés. Nincsenek felesleges körök, azt kapja amit kért.
          </p>
        </div>
        <div className="highlight">
          <h3>Minőség, megbízhatóság</h3>
          <p>
            Szépen vágott, rendezett anyagok, igényes kivitelezés, megbízható
            végeredmény.
          </p>
        </div>
        <div className="highlight">
          <h3>Átvétel + szükség esetén segítség helyben</h3>
          <p>
            Ha bizonytalan a beállításaiban (papír méret, papír súly, papír szín),
            mi segítünk, hogy a végeredmény pont olyan legyen, ahogy elképzelte.
          </p>
        </div>
      </div>
    </section>
  );
}