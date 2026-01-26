import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "dp_shop_reviews_v1";

const clampStars = (n) => {
  const x = Math.round(Number(n));
  return Number.isNaN(x) ? 5 : Math.min(5, Math.max(1, x));
};

const formatHUDate = (i) => {
  try {
    return new Date(i).toLocaleString("hu-HU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

function Stars({ value = 0, size = "md" }) {
  const v = Math.round((Number(value) || 0) * 2) / 2;
  return (
    <span className={`stars stars-${size}`} aria-label={`${v} / 5`}>
      {Array.from({ length: 5 }, (_, i) => {
        const n = i + 1;
        const x = v >= n ? "full" : v >= n - 0.5 ? "half" : "empty";
        return (
          <span key={n} className={`star ${x}`} aria-hidden="true">
            ★
          </span>
        );
      })}
    </span>
  );
}

export default function Reviewbox() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ avg: 0, count: 0 });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", stars: 5, text: "" });
  const [msg, setMsg] = useState(null);

  const canSubmit = useMemo(
    () => form.name.trim().length >= 2 && form.text.trim().length >= 10,
    [form.name, form.text]
  );

  const readLocal = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed?.items) ? parsed.items : [];
    } catch {
      return [];
    }
  };

  const writeLocal = (list) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: list }));
  };

  const refresh = () => {
    const all = readLocal()
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const count = all.length;
    const avg =
      count === 0 ? 0 : all.reduce((a, it) => a + (Number(it.stars) || 0), 0) / count;

    setItems(all.slice(0, 6));
    setSummary({ avg: Math.round(avg * 10) / 10, count });
  };

  useEffect(refresh, []);

  const submit = (e) => {
    e.preventDefault();
    setMsg(null);

    const payload = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: form.name.trim(),
      stars: clampStars(form.stars),
      text: form.text.trim(),
      createdAt: new Date().toISOString(),
    };

    const next = [payload, ...readLocal()];
    writeLocal(next);
    refresh();

    setForm({ name: "", stars: 5, text: "" });
    setOpen(false);

    setMsg("Köszönjük! Az értékelését rögzítettük.");
    setTimeout(() => setMsg(null), 5000);
  };

  return (
    <section className="home-card-block reviews-card">
      <div className="reviews-head">
        <div className="reviews-title">
          <div className="reviews-badge" aria-hidden="true">
            ★
          </div>
          <div>
            <h2 className="reviews-h2">Vásárlói értékelések</h2>
            <p className="reviews-sub">Írja meg a véleményét, hogy mit gondol a kiszolgálásról.</p>
          </div>
        </div>
        <button type="button" className="reviews-cta" onClick={() => setOpen(true)}>
          Értékelés
        </button>
      </div>
      <div className="reviews-body">
        <div className="reviews-summary">
          <div className="rating-num">
            {summary.count === 0 ? "—" : summary.avg.toFixed(1)}
          </div>
          <div className="rating-meta">
            <div className="stars-row">
              <Stars value={summary.avg} size="lg" />
              <span className="rating-count">{summary.count} vélemény</span>
            </div>
          </div>
        </div>
        {msg && <div className="reviews-msg">{msg}</div>}
        <div className="reviews-list">
          {items.length === 0 ? (
            <div className="reviews-empty">Még nincs értékelés. Legyen ön az első! 🙂</div>
          ) : (
            items.map((r) => (
              <article className="review-item" key={r.id}>
                <div className="review-top">
                  <div className="review-name">{r.name}</div>
                  <div className="review-right">
                    <Stars value={r.stars} />
                    <div className="review-date">{formatHUDate(r.createdAt)}</div>
                  </div>
                </div>
                <div className="review-text">{r.text}</div>
              </article>
            ))
          )}
        </div>
      </div>
      {open && (
        <div className="reviews-modal" onClick={() => setOpen(false)}>
          <div className="reviews-modal-inner" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="reviews-close"
              onClick={() => setOpen(false)}
              aria-label="Bezárás">
              ✕
            </button>
            <h3 className="reviews-modal-title">Értékelés írása</h3>
            <p className="reviews-modal-sub">Kérem írjon pár mondatot – a véleménye számít!</p>
            <form onSubmit={submit} className="reviews-form">
              <label>
                Név
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Pl.: Nagy Péter"
                  maxLength={40}/>
              </label>
              <label>
                Értékelés
                <div className="rating-stars" aria-label="Csillagok kiválasztása">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span className="rating-star" key={n}>
                      <input
                        className="rating-input"
                        type="radio"
                        id={`rating-${n}`}
                        name="stars"
                        value={n}
                        checked={form.stars === n}
                        onChange={() => setForm((p) => ({ ...p, stars: n }))}/>
                      <label className="rating-label" htmlFor={`rating-${n}`} aria-label={`${n} csillag`}>
                        ★
                      </label>
                    </span>
                  ))}
                </div>
              </label>
              <label>
                Vélemény
                <textarea
                  value={form.text}
                  onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
                  placeholder="Írja le röviden a véleményét… (10-600 karakter)"
                  rows={5}
                  maxLength={600}/>
              </label>
              <button type="submit" className="reviews-submit" disabled={!canSubmit}>
                Mentés
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}