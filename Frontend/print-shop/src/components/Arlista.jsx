export default function Arlista() {
  return (
    <section className="home-card-block price-wrap">
      <header className="section-head">
        <h2>Árlista</h2>
        <p className="section-sub">
          Az árak tájékoztató jellegűek. Nagyobb mennyiség esetén egyedi árajánlat is kérhető.
        </p>
      </header>

      <div className="price-groups">
        <div className="price-group">
          <h3>Nyomtatás / fénymásolás</h3>

          <div className="price-item">
            <div className="price-title">Egyoldalas A/4 fekete-fehér</div>
            <ul>
              <li>1–10 oldal: <strong>50 Ft</strong>/oldal</li>
              <li>11–100 oldal: <strong>40 Ft</strong>/oldal</li>
              <li>101 oldal felett: <strong>30 Ft</strong>/oldal</li>
            </ul>
          </div>

          <div className="price-item">
            <div className="price-title">Kétoldalas A/4 fekete-fehér</div>
            <ul>
              <li>1–10 oldal: <strong>90 Ft</strong>/oldal</li>
              <li>11–100 oldal: <strong>70 Ft</strong>/oldal</li>
              <li>101 oldal felett: <strong>50 Ft</strong>/oldal</li>
            </ul>
          </div>

          <div className="price-item">
            <div className="price-title">Egyoldalas A/3 fekete-fehér</div>
            <div className="price-line">
              <span>Egységár</span>
              <strong>100 Ft</strong>/oldal
            </div>
          </div>

          <div className="price-item">
            <div className="price-title">Kétoldalas A/3 fekete-fehér</div>
            <div className="price-line">
              <span>Egységár</span>
              <strong>180 Ft</strong>/oldal
            </div>
          </div>

          <div className="price-item">
            <div className="price-title">Diák/pedagógus kedvezmény</div>
            <div className="price-line">
              <span>Egyoldalas</span>
              <strong>25 Ft</strong>/oldal
            </div>
            <div className="price-line">
              <span>Kétoldalas</span>
              <strong>45 Ft</strong>/oldal
            </div>
          </div>

          <div className="price-item">
            <div className="price-title">Színes nyomtatás</div>
            <div className="price-line">
              <span>Egyoldalas A/4</span>
              <strong>120–250 Ft</strong>/oldal
            </div>
            <div className="price-line">
              <span>Kétoldalas A/4</span>
              <strong>240–500 Ft</strong>/oldal
            </div>
            <div className="price-line">
              <span>Egyoldalas A/3</span>
              <strong>200–400 Ft</strong>/oldal
            </div>
            <div className="price-line">
              <span>Kétoldalas A/3</span>
              <strong>400–650 Ft</strong>/oldal
            </div>
            <p className="price-note">Az ár a telítettségtől függően változhat.</p>
          </div>
        </div>

        <div className="price-group">
          <h3>Poszter nyomtatás</h3>

          <div className="price-item">
            <div className="price-title">Tervrajz (80g)</div>
            <div className="price-line">
              <span>Ár</span>
              <strong>2000 Ft</strong>/m²
            </div>
          </div>

          <div className="price-item">
            <div className="price-title">Plakát (140g)</div>
            <div className="price-line">
              <span>Ár</span>
              <strong>10000 Ft</strong>/m²
            </div>
          </div>

          <div className="price-item">
            <div className="price-title">Fotópapír</div>
            <div className="price-line">
              <span>Ár</span>
              <strong>15000 Ft</strong>/m²
            </div>
          </div>
        </div>

        <div className="price-group">
          <h3>Falinaptár készítés</h3>

          <div className="price-item">
            <div className="price-title">13 lapos A/4</div>
            <div className="price-line">
              <span>Egységár</span>
              <strong>3990 Ft</strong>
            </div>
          </div>

          <div className="price-item">
            <div className="price-title">13 lapos A/3</div>
            <div className="price-line">
              <span>Egységár</span>
              <strong>5490 Ft</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}