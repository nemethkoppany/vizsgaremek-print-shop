import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

const clamp = (n) => {
  const x = Number(n);
  if (Number.isNaN(x)) return 5;
  return Math.max(1, Math.min(5, Math.round(x)));
};

const fmt = (d) => {
  try {
    return new Date(d).toLocaleString("hu-HU", {
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

const Stars = ({ value }) => {
  const n = clamp(value);
  return (
    <span className="stars stars-md" aria-label={`${n} csillag`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`star ${i < n ? "full" : ""}`}>
          ★
        </span>
      ))}
    </span>
  );
};

const toNum = (v) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : null;
};

const pickAvg = (raw) => {
  const src = Array.isArray(raw) ? raw[0] : raw;
  if (src == null) return null;

  const direct = toNum(src);
  if (direct != null) return direct;

  if (typeof src !== "object") return null;

  return (
    toNum(src.avg) ??
    toNum(src.average) ??
    toNum(src.ratingAvg) ??
    toNum(src.rating_avg) ??
    (src.data ? toNum(src.data.avg) ?? toNum(src.data.average) : null)
  );
};

const pickCount = (raw) => {
  const src = Array.isArray(raw) ? raw[0] : raw;
  if (src == null) return null;

  if (typeof src !== "object") return null;

  return (
    toNum(src.count) ??
    toNum(src.total) ??
    toNum(src.ratingsCount) ??
    toNum(src.ratings_count) ??
    (src.data ? toNum(src.data.count) ?? toNum(src.data.total) : null)
  );
};

const calcSummaryFromRows = (rows) => {
  const list = Array.isArray(rows) ? rows : [];
  const nums = list.map((r) => toNum(r?.rating)).filter((x) => x != null);

  if (nums.length === 0) return { avg: null, count: 0 };

  const sum = nums.reduce((a, b) => a + b, 0);
  return { avg: sum / nums.length, count: nums.length };
};

export default function StoreReviewsBox({ backendSummary = null, me = null }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");

  const [summary, setSummary] = useState(() => {
    const avg = pickAvg(backendSummary);
    const count = pickCount(backendSummary);
    return { avg, count };
  });

  const loadAll = async () => {
    const rows = await api.getAllRatings();
    const summaryFromList = calcSummaryFromRows(rows);

    const list = (Array.isArray(rows) ? rows : [])
      .slice(0, 6)
      .map((r) => ({
        id: r.rating_id ?? r.user_id ?? Math.random(),
        name: r.user_name || r.name || r.email || "Felhasználó",
        rating: r.rating,
        comment: r.comment || "",
        createdAt: r.createdAt,
      }));

    setItems(list);
    setSummary(summaryFromList);
    return rows;
  };

  const refreshAvg = async () => {
    try {
      const res = await api.getRatingAverage();
      const avg = pickAvg(res);
      const count = pickCount(res);

      if (avg != null) {
        setSummary((p) => ({
          avg,
          count: count != null ? count : p.count,
        }));
        return;
      }
    } catch {}

    try {
      await loadAll();
    } catch {}
  };

  useEffect(() => {
    if (!me) {
      setItems([]);
      return;
    }
    loadAll().catch(() => {});
  }, [me?.user_id]);

  useEffect(() => {
    const onUpdate = () => refreshAvg();
    window.addEventListener("ratings-updated", onUpdate);
    return () => window.removeEventListener("ratings-updated", onUpdate);
  }, []);

  const onSend = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      await api.createRating({
        rating: clamp(rating),
        comment: comment.trim() || null,
      });

      await loadAll();
      refreshAvg();

      window.dispatchEvent(new Event("ratings-updated"));

      setOpen(false);
      setComment("");
      setMsg("Köszönjük értékelést!");
      setTimeout(() => setMsg(""), 4000);
    } catch (err) {
      setMsg(err?.message || "Hiba történt");
    }
  };

  const avgText = summary.avg == null ? "-" : summary.avg.toFixed(2);

  return (
    <section className="home-card-block reviews-card">
      <div className="reviews-head">
        <div className="reviews-title">
          <div className="reviews-badge">★</div>
          <div>
            <h2 className="reviews-h2">Értékeljen minket!</h2>
            <p className="reviews-sub">A felhasználók értékelései, visszajelzései alapján számolva az átlag értékelésünk:</p>
          </div>
        </div>

        <button
          className="reviews-cta"
          type="button"
          onClick={() => (me ? setOpen(true) : null)}
          disabled={!me}
        >
          Értékelés írása
        </button>
      </div>

      <div className="reviews-body">
        <div className="reviews-summary">
          <div className="rating-num">{avgText}</div>

          <div className="rating-meta">
            <div className="stars-row">
              <Stars value={summary.avg == null ? 0 : summary.avg} />
              {summary.count != null && (
                <span className="rating-count">({summary.count} értékelés alapján)</span>
              )}
            </div>

            {!me && <div className="rating-hint">Az értékelések megtekintéséhez jelentkezzen be.</div>}
            {msg && <div className="reviews-msg">{msg}</div>}
          </div>
        </div>

        {me ? (
          <div className="reviews-list">
            {items.length === 0 ? (
              <div className="reviews-empty">Még nincs értékelésünk, legyen ön az első.</div>
            ) : (
              items.map((r) => (
                <div className="review-item" key={r.id}>
                  <div className="review-top">
                    <div className="review-name">{r.name}</div>

                    <div className="review-right">
                      <Stars value={r.rating} />
                      <span className="review-date">{fmt(r.createdAt)}</span>
                    </div>
                  </div>

                  {r.comment && <div className="review-text">{r.comment}</div>}
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>

      {open && (
        <div className="reviews-modal" role="dialog" aria-modal="true">
          <div className="reviews-modal-inner">
            <button
              className="reviews-close"
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Bezárás"
            >
              ×
            </button>

            <h3 className="reviews-modal-title">Értékelés</h3>
            <p className="reviews-modal-sub">Értékeljen és írjon egy rövid véleményt honlapunkról.</p>

            <form className="reviews-form" onSubmit={onSend}>
              <label>
                Értékelés 1-5 csillagig
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n}>
                      <input
                        id={`star_${n}`}
                        type="radio"
                        name="stars"
                        checked={Number(rating) === n}
                        onChange={() => setRating(n)}
                      />
                      <label htmlFor={`star_${n}`}>★</label>
                    </span>
                  ))}
                </div>
              </label>

              <label>
                Megjegyzés
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Pl.: gyors és megbízható szolgáltatás"
                />
              </label>

              <button type="submit">Küldés</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}