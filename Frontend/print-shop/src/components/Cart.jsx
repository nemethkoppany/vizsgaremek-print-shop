const monthsHU = [
  "Január","Február","Március","Április","Május","Június",
  "Július","Augusztus","Szeptember","Október","November","December",
];

const weekHU = ["H","K","Sze","Cs","P","Szo","V"];
const year = new Date().getFullYear();

const getMonthCells = (y, m) => {
  const first = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const start = (first.getDay() + 6) % 7;
  const cells = [];

  for (let i = 0; i < start; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length < 42) cells.push(null);

  return cells;
};

function CalendarPreview({ images }) {
  return (
    <div className="cart-cal-preview">
      <div className="cart-cal-title">Naptár előnézet:</div>
      <br/>

      <div className="cart-cal-grid">
        {monthsHU.map((month, mi) => {
          const cells = getMonthCells(year, mi);
          const img = Array.isArray(images) ? images[mi] : null;

          return (
            <div className="calpage" key={month}>
              <div className="calpage-spiral" />

              <div className="calpage-photo">
                {img ? <img src={img} alt={month} /> : <div className="calpage-photo-empty">Nincs kép</div>}
              </div>

              <div className="calpage-bottom">
                <div className="calpage-head">
                  <div className="calpage-year">{year}</div>
                  <div className="calpage-month">{month.toUpperCase()}</div>
                </div>

                <div className="calpage-week">
                  {weekHU.map((d, i) => (
                    <div key={i} className={`calpage-wd ${i === 6 ? "sun" : ""}`}>{d}</div>
                  ))}
                </div>

                <div className="calpage-days">
                  {cells.map((d, i) => (
                    <div
                      key={i}
                      className={`calpage-day ${d ? "" : "empty"} ${d && i % 7 === 6 ? "sun" : ""}`}>
                      {d || ""}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Cart({ cartItems, removeFromCart, goToServices }) {
  const count = cartItems.length;

  return (
    <section className="cart-page">
      <div className="cart-card">
        <h1>Kosár</h1>

        <div className="cart-summary">
          <p><strong>Tételek száma:</strong> {count}</p>
          <p className="cart-note">Árazás, később backendből.</p>
        </div>

        {count === 0 ? (
          <div className="cart-empty">
            A kosár üres.
            <button type="button" className="svc-secondary" onClick={goToServices} style={{ marginTop: 14 }}>
              Vissza a szolgáltatásokhoz
            </button>
          </div>
        ) : (
          <ul className="cart-list">
            {cartItems.map((it) => (
              <li className="cart-item" key={it.id}>
                <div className="cart-left">
                  <div className="cart-title">{it.category}</div>

                  <div className="cart-meta">
                    {it.options.paperSize} • {it.options.paperWeight} • {it.options.paperColor} • {it.options.colorMode}
                  </div>

                  {it.previewType === "text" && (
                    <div className="cart-preview-text">{it.preview}</div>
                  )}

                  {it.previewType === "image" && (
                    <div className="cart-preview-img">
                      <img src={it.preview} alt="Előnézet" />
                    </div>
                  )}

                  {it.previewType === "calendar" && (
                    <CalendarPreview images={it.preview} />
                  )}
                </div>

                <div className="cart-right">
                  <button type="button" className="cart-remove" onClick={() => removeFromCart(it.id)}>
                    Törlés
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}