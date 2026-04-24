import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

function Field({ label, children }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

function Msg({ msg }) {
  if (!msg) return null;
  return <div className={`message-box ${msg.type}`}>{msg.text}</div>;
}

function Stars({ n }) {
  const x = Math.max(1, Math.min(5, Number(n) || 0));
  const full = "★★★★★".slice(0, x);
  const empty = "☆☆☆☆☆".slice(0, 5 - x);
  return (
    <span style={{ letterSpacing: 1 }}>
      {full}
      {empty}
    </span>
  );
}

function StatusPill({ status }) {
  const s = String(status || "");
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800,
    border: "1px solid rgba(148,163,184,.25)",
    background: "rgba(15,23,42,.6)",
    whiteSpace: "nowrap",
  };
  const bgBy = {
    Beérkezett: "rgba(56,189,248,.18)",
    "Feldolgozás alatt": "rgba(167,139,250,.18)",
    "Nyomtatás alatt": "rgba(34,197,94,.16)",
    Csomagolás: "rgba(251,191,36,.16)",
    Kész: "rgba(59,130,246,.16)",
    Kiszállítva: "rgba(16,185,129,.16)",
    Törölve: "rgba(239,68,68,.18)",
  };
  const dotBy = {
    Beérkezett: "rgba(56,189,248,1)",
    "Feldolgozás alatt": "rgba(167,139,250,1)",
    "Nyomtatás alatt": "rgba(34,197,94,1)",
    Csomagolás: "rgba(251,191,36,1)",
    Kész: "rgba(59,130,246,1)",
    Kiszállítva: "rgba(16,185,129,1)",
    Törölve: "rgba(239,68,68,1)",
  };
  return (
    <span style={{ ...base, background: bgBy[s] || base.background }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: dotBy[s] || "rgba(148,163,184,1)" }} />
      {s || "-"}
    </span>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

function fmt(n, decimals = 0) {
  const num = Number(n);
  if (isNaN(num)) return "–";
  return num.toLocaleString("hu-HU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

const ORDER_STATUSES_HU = ["Beérkezett","Feldolgozás alatt","Nyomtatás alatt","Csomagolás","Kész","Kiszállítva","Törölve"];
const TABS = [
  { id: "stats",    label: "Statisztika: " },
  { id: "products", label: "Termékek: " },
  { id: "orders",   label: "Rendelés státusz: " },
  { id: "ratings",  label: "Értékelések: " },
];

export default function Admin({ me, isAdmin, products, onProductsChanged }) {
  const [tab, setTab] = useState("stats");
  const [msg, setMsg] = useState(null);
  const [priceEdits, setPriceEdits] = useState({});
  const [savingPriceId, setSavingPriceId] = useState(null);
  const [ratings, setRatings] = useState(null);
  const [orderUpdate, setOrderUpdate] = useState({ orderId: 1, status: "Beérkezett" });
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loginUserId, setLoginUserId] = useState("");
  const [loginInfo, setLoginInfo] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const show = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg(null), 6000); };
  const rows = useMemo(() => (Array.isArray(products) ? products : []), [products]);

  useEffect(() => {
    if (tab === "stats" && !stats && !statsLoading) loadStats();
  }, [tab]);

  const loadStats = async (from, to) => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await api.adminOrderAnalytics(from && to ? { from, to } : undefined);
      setStats(res);
    } catch (e) {
      setStatsError(e.message || "Hiba a statisztikák betöltésekor");
    } finally {
      setStatsLoading(false);
    }
  };

  const loadLoginInfo = async () => {
    const id = Number(loginUserId);
    if (!id || isNaN(id)) return show("Adjon meg érvényes felhasználó ID-t!", "error");
    setLoginLoading(true);
    setLoginInfo(null);
    try {
      const res = await api.adminLoginAnalytics(id);
      setLoginInfo(res);
    } catch (e) {
      show(e.message || "Hiba", "error");
    } finally {
      setLoginLoading(false);
    }
  };

  if (!me) return (
    <section className="admin-page">
      <div className="admin-card"><h2>Admin</h2><p>Jelentkezzen be admin felhasználóval.</p></div>
    </section>
  );
  if (!isAdmin) return (
    <section className="admin-page">
      <div className="admin-card"><h2>Admin</h2><p>Nincs jogosultságod ehhez az oldalhoz.</p></div>
    </section>
  );

  const ratingsArr = Array.isArray(ratings) ? ratings : ratings?.items && Array.isArray(ratings.items) ? ratings.items : [];

  return (
    <section className="admin-page">
      <div className="admin-card">
        <div className="admin-head">
          <h2>Admin panel</h2>
          <div className="admin-sub">Bejelentkezve: {me.email} ({me.role})</div>
        </div>

        <div className="admin-tabs">
          {TABS.map((t) => (
            <button key={t.id} className={`admin-tab-btn${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <Msg msg={msg} />

        {tab === "stats" && (
          <div className="admin-tab-content">
            <h3>Rendelési statisztikák</h3>
            <p className="admin-tab-desc">Összes rendelés összesítése. Szűrj dátum szerint a pontosabb adatokért.</p>

            <div className="stats-filter">
              <div className="field">
                <label className="field-label">Kezdő dátum</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Záró dátum</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <button type="button" className="svc-secondary stats-filter-btn" disabled={statsLoading}
                onClick={() => loadStats(dateFrom || undefined, dateTo || undefined)}>
                {statsLoading ? "Töltés..." : "🔍 Lekérés"}
              </button>
              {(dateFrom || dateTo) && (
                <button type="button" className="svc-secondary stats-filter-btn"
                  onClick={() => { setDateFrom(""); setDateTo(""); loadStats(); }}>
                  ✕ Szűrő törlése
                </button>
              )}
            </div>

            {statsError && <div className="message-box error" style={{ marginTop: 12 }}>{statsError}</div>}

            {statsLoading && (
              <div className="stats-loading"><div className="stats-spinner" />Adatok betöltése...</div>
            )}

            {stats && !statsLoading && (
              <div className="stats-grid">
                <StatCard label="Összes rendelés: " value={fmt(stats.total_orders)} sub="db" />
                <StatCard label="Összes bevétel: " value={`${fmt(stats.total_revenue)} Ft`}
                  sub={dateFrom && dateTo ? `${dateFrom} – ${dateTo}` : "minden idők"} />
                <StatCard label="Átlagos rendelési érték: " value={`${fmt(stats.avg_order_value, 0)} Ft`} sub="rendelésenként" />
              </div>
            )}

            <div className="admin-divider" />

            <h3>Bejelentkezési adatok</h3>
            <p className="admin-tab-desc">Egy adott felhasználó utolsó bejelentkezésének ideje.</p>

            <div className="stats-filter">
              <div className="field" style={{ flex: 1 }}>
                <label className="field-label">Felhasználó ID</label>
                <input type="number" placeholder="pl. 5" value={loginUserId} onChange={(e) => setLoginUserId(e.target.value)} />
              </div>
              <button type="button" className="svc-secondary stats-filter-btn" disabled={loginLoading} onClick={loadLoginInfo}>
                {loginLoading ? "Töltés..." : "Lekérés"}
              </button>
            </div>

            {loginInfo && (
              <div className="admin-card" style={{ marginTop: 12 }}>
                <div className="stat-card" style={{ border: "none", padding: 0 }}>
                  <div className="stat-icon"></div>
                  <div className="stat-body">
                    <div className="stat-label">Utolsó bejelentkezés</div>
                    <div className="stat-value" style={{ fontSize: "1.1rem" }}>
                      {loginInfo.last_login ? new Date(loginInfo.last_login).toLocaleString("hu-HU") : "–"}
                    </div>
                    <div className="stat-sub">Felhasználó #{loginUserId}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "products" && (
          <div className="admin-tab-content">
            <h3>Termékek ára</h3>
            <p className="admin-tab-desc">Itt csak az alapárat lehet módosítani (a többi adat fix).</p>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>ID</th><th>Név</th><th>Ár (Ft)</th><th>Művelet</th></tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.product_id}>
                      <td data-label="ID">{p.product_id}</td>
                      <td data-label="Név">{p.name}</td>
                      <td data-label="Ár (Ft)">
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input type="number"
                            value={priceEdits[p.product_id] ?? p.base_price}
                            onChange={(e) => setPriceEdits((prev) => ({ ...prev, [p.product_id]: e.target.value }))}
                            style={{ width: "100%", maxWidth: 120 }}
                          />
                          <span className="muted">Ft</span>
                        </div>
                      </td>
                      <td data-label="Művelet">
                        <button type="button" className="svc-secondary" style={{ marginTop: 0, width: "auto" }}
                          disabled={savingPriceId === p.product_id}
                          onClick={async () => {
                            try {
                              setSavingPriceId(p.product_id);
                              const raw = priceEdits[p.product_id];
                              const value = raw === undefined ? p.base_price : Number(raw);
                              await api.adminUpdateProduct(p.product_id, { base_price: value });
                              show("Ár frissítve");
                              await onProductsChanged?.();
                            } catch (e) {
                              show(e.message || "Ár mentése sikertelen", "error");
                            } finally {
                              setSavingPriceId(null);
                            }
                          }}>
                          {savingPriceId === p.product_id ? "Mentés..." : "Mentés"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr><td colSpan={4} style={{ opacity: 0.8 }}>Nincs termék.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="admin-tab-content">
            <h3>Rendelés státusz frissítése</h3>
            <div className="grid-2" style={{ marginTop: 10 }}>
              <Field label="Rendelés ID">
                <input type="number" value={orderUpdate.orderId}
                  onChange={(e) => setOrderUpdate((p) => ({ ...p, orderId: Number(e.target.value) }))} />
              </Field>
              <Field label="Státusz">
                <select value={orderUpdate.status}
                  onChange={(e) => setOrderUpdate((p) => ({ ...p, status: e.target.value }))}>
                  {ORDER_STATUSES_HU.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ marginTop: 10 }}>
              <div className="muted" style={{ marginBottom: 6 }}>Előnézet:</div>
              <StatusPill status={orderUpdate.status} />
            </div>
            <div className="admin-actions" style={{ marginTop: 10 }}>
              <button type="button"
                onClick={async () => {
                  if (!orderUpdate.orderId) return show("Adj meg rendelés ID-t!", "error");
                  try {
                    await api.adminUpdateOrderStatus(orderUpdate.orderId, { status: orderUpdate.status });
                    show("Státusz frissítve");
                  } catch (e) { show(e.message || "Hiba", "error"); }
                }}>
                Mentés
              </button>
            </div>
          </div>
        )}

        {tab === "ratings" && (
          <div className="admin-tab-content">
            <h3>Értékelések</h3>
            <div className="admin-actions">
              <button type="button"
                onClick={async () => {
                  try {
                    const res = await api.getAllRatings();
                    setRatings(res);
                    show("Értékelések betöltve");
                  } catch (e) { setRatings(null); show(e.message || "Hiba", "error"); }
                }}>
                Értékelések lekérése
              </button>
            </div>

            {ratings ? (
              <>
                {ratings.avg != null && (
                  <div className="admin-card" style={{ marginTop: 12 }}>
                    <h4>Összegzés</h4>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                      <span>Átlag</span><b>{Number(ratings.avg).toFixed(2)}</b>
                    </div>
                    {ratings.count != null && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                        <span>Értékelések száma</span><b>{ratings.count}</b>
                      </div>
                    )}
                  </div>
                )}
                <div className="admin-card" style={{ marginTop: 12 }}>
                  <h4>Lista az értékelésekről:</h4>
                  {ratingsArr.length === 0 ? (
                    <div style={{ opacity: 0.85 }}>Nincs értékelés.</div>
                  ) : (
                    <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                      {ratingsArr.map((r) => (
                        <div key={r.rating_id || r.user_id} className="review-card">
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                            <div style={{ fontWeight: 800 }}>{r.email || `User #${r.user_id}`}</div>
                            <div><Stars n={r.rating} /></div>
                          </div>
                          {r.comment && <div style={{ marginTop: 6, opacity: 0.95 }}>{r.comment}</div>}
                          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                            {r.createdAt ? new Date(r.createdAt).toLocaleString("hu-HU") : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ opacity: 0.85, marginTop: 10 }}>Nincs betöltve.</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}