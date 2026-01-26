export default function Arlista() {
  return (
    <section className="price-page">
      <div className="price-card">
        <h1>Árlista</h1>

        <table className="price-table">
          <tbody>
            <tr>
              <td colSpan="2">
                <span className="service-name">
                  Egyoldalas A/4 fekete-fehér nyomtatás és fénymásolás:
                </span>
                <p>1–10 oldalig: <strong>50 Ft / oldal</strong></p>
                <p>11-100 oldalig: <strong>40 Ft / oldal</strong></p>
                <p>101 oldaltól: <strong>30 Ft / oldal</strong></p>
              </td>
            </tr>

            <tr>
              <td colSpan="2">
                <span className="service-name">
                  Kétoldalas A/4 fekete-fehér nyomtatás és fénymásolás:
                </span>
                <p>1–10 oldalig: <strong>90 Ft / oldal</strong></p>
                <p>11-100 oldalig: <strong>70 Ft / oldal</strong></p>
                <p>101 oldaltól: <strong>50 Ft / oldal</strong></p>
              </td>
            </tr>

            <tr>
              <td colSpan="2">
                <span className="service-name">
                  Nyomtatás A/3 fekete-fehér (egyoldalas):
                </span>
                <p><strong>100 Ft / oldal</strong></p>
              </td>
            </tr>

            <tr>
              <td colSpan="2">
                <span className="service-name">
                  Nyomtatás A/3 fekete-fehér (kétoldalas):
                </span>
                <p><strong>180 Ft / oldal</strong></p>
              </td>
            </tr>

            <tr>
              <td colSpan="2">
                <span className="service-name">Diák / pedagógus kedvezmény:</span>
                <ul>
                  <li>Egyoldalas: <strong>25 Ft</strong></li>
                  <li>Kétoldalas: <strong>45 Ft</strong></li>
                </ul>
              </td>
            </tr>

            <tr>
              <td colSpan="2">
                <span className="service-name">
                  Egyoldalas A/4 színes nyomtatás és fénymásolás:
                </span>
                <p><strong>120-250 Ft / oldal</strong> (telítettségtől függően)</p>
              </td>
            </tr>

            <tr>
              <td colSpan="2">
                <span className="service-name">
                  Kétoldalas A/4 színes nyomtatás és fénymásolás:
                </span>
                <p><strong>240-500 Ft / oldal</strong> (telítettségtől függően)</p>
              </td>
            </tr>

            <tr>
              <td colSpan="2">
                <span className="service-name">
                  Egyoldalas A/3 színes nyomtatás és fénymásolás:
                </span>
                <p><strong>200-400 Ft / oldal</strong> (telítettségtől függően)</p>
              </td>
            </tr>

            <tr>
              <td colSpan="2">
                <span className="service-name">
                  Kétoldalas A/3 színes nyomtatás és fénymásolás:
                </span>
                <p><strong>400-650 Ft / oldal</strong> (telítettségtől függően)</p>
              </td>
            </tr>

            <tr className="poster-row">
              <td colSpan="2">
                <span className="service-name">Poszter nyomtatás:</span>
                <p>Tervrajz, 80g-os papírra: <strong>2000 Ft</strong></p>
                <p>Plakát, 140g-os papírra: <strong>10000 Ft</strong></p>
                <p>Fotópapírra: <strong>15000 Ft</strong></p>
                <p><strong className="poster-note">Az árak m<sup>2</sup>-ben értendők.</strong></p>
              </td>
            </tr>

            <tr>
              <td colSpan="2">
                <span className="service-name">Falinaptár készítés:</span>
                <p>13 lapos A/4: <strong>3990 Ft</strong></p>
                <p>13 lapos A/3: <strong>5490 Ft</strong></p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}