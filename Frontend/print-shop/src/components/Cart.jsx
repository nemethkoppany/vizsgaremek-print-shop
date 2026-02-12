import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

const monthsHU = [
  "Január",
  "Február",
  "Március",
  "Április",
  "Május",
  "Június",
  "Július",
  "Augusztus",
  "Szeptember",
  "Október",
  "November",
  "December",
];

const weekHU = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];

const money = (n) => `${Number(n || 0).toLocaleString("hu-HU")} Ft`;

const getMonthCells = (y, m) => {
  const first = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const start = (first.getDay() + 6) % 7;

  const cells = [];
  for (let i = 0; i < start; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length < 42) cells.push(null);

  return { cells };
};

function CalendarPreview({ images, year }) {
  const y = Number(year) || new Date().getFullYear();

  return (
    <div className="cart-cal-preview">
      <div className="cart-cal-title">Naptár előnézet:</div>

      <div className="cart-cal-grid">
        {monthsHU.map((month, mi) => {
          const { cells } = getMonthCells(y, mi);
          const img = Array.isArray(images) ? images[mi] : null;

          return (
            <div className="calpage" key={`${month}-${mi}`}>
              <div className="calpage-spiral" />

              <div className="calpage-photo">
                {img ? (
                  <img src={img} alt={`${month} kép`} />
                ) : (
                  <div className="calpage-photo-empty">Nincs kép</div>
                )}
              </div>

              <div className="calpage-bottom">
                <div className="calpage-head">
                  <div className="calpage-year">{y}</div>
                  <div className="calpage-month">{month.toUpperCase()}</div>
                </div>

                <div className="calpage-week">
                  {weekHU.map((d) => (
                    <span key={d} className={`calpage-wd ${d === "V" ? "sun" : ""}`}>
                      {d}
                    </span>
                  ))}
                </div>

                <div className="calpage-days">
                  {cells.map((d, i) => {
                    const isEmpty = !d;
                    const isSunday = i % 7 === 6;

                    return (
                      <span
                        key={i}
                        className={["calpage-day", isEmpty ? "empty" : "", !isEmpty && isSunday ? "sun" : ""]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {d || ""}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

async function uploadFilesForItem(item) {
  let files = item?.files;

  if ((!files || files.length === 0) && item.previewType === "calendar") {
    if (Array.isArray(item.preview)) {
      files = item.preview.map((src, i) => {
        const arr = src.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], `calendar-${i}.png`, { type: mime });
      });
    }
  }

  if (!files || files.length === 0) return null;

  if (files.length > 1 && typeof api.uploadFilesMultiple === "function") {
    const res = await api.uploadFilesMultiple(files);
    const first = res?.savedFiles?.[0];
    return first?.file_id ?? null;
  }

  if (typeof api.uploadFile === "function") {
    const res = await api.uploadFile(files[0]);
    return res?.file_id ?? res?.id ?? null;
  }

  return null;
}

function normalize(s) {
  return String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function resolveWantedProductName(item) {
  const cat = normalize(item?.category);
  const size = normalize(item?.options?.paperSize);
  const mode = normalize(item?.options?.colorMode);
  const weight = normalize(item?.options?.paperWeight);

  const isA4 = size.includes("a4");
  const isA3 = size.includes("a3");

  const isBW = mode.includes("fekete") || mode.includes("bw") || mode.includes("black");
  const isColor = mode.includes("színes") || mode.includes("szines") || mode.includes("color");

  if (cat.includes("naptár") || cat.includes("naptar") || item?.previewType === "calendar") {
    if (isA3) return "Falinaptár – 13 lapos A3";
    return "Falinaptár – 13 lapos A4";
  }

  if (cat.includes("poszter") || cat.includes("poster")) {
    if (weight.includes("80")) return "Poszter nyomtatás – tervrajz (80g)";
    if (weight.includes("140")) return "Poszter nyomtatás – plakát (140g)";
    return "Poszter nyomtatás – fotópapír";
  }

  if (cat.includes("nyomtat") || cat.includes("másol") || cat.includes("masol") || cat.includes("print")) {
    if (isA3 && isBW) return "A3 fekete-fehér nyomtatás (egyoldalas)";
    if (isA3 && isColor) return "A3 színes nyomtatás (egyoldalas)";
    if (isA4 && isBW) return "A4 fekete-fehér nyomtatás (egyoldalas)";
    if (isA4 && isColor) return "A4 színes nyomtatás (egyoldalas)";
  }

  return "";
}

export default function Cart({ cartItems, removeFromCart, goToServices, me, onOrderCreated }) {
  const count = cartItems.length;

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const [products, setProducts] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  const show = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 7000);
  };

  useEffect(() => {
    if (productsLoaded) return;
    if (!count) return;

    (async () => {
      try {
        const list = await api.getProducts();
        setProducts(Array.isArray(list) ? list : []);
      } catch {
        setProducts([]);
      } finally {
        setProductsLoaded(true);
      }
    })();
  }, [count, productsLoaded]);

  const productById = useMemo(() => {
    const map = new Map();
    for (const p of Array.isArray(products) ? products : []) {
      map.set(Number(p.product_id), p);
    }
    return map;
  }, [products]);

  const productIdByName = useMemo(() => {
    const map = new Map();
    for (const p of Array.isArray(products) ? products : []) {
      map.set(normalize(p.name), Number(p.product_id));
    }
    return map;
  }, [products]);

  const effectiveProductId = (it) => {
    const direct = Number(it?.productId);
    if (direct) return direct;

    const wanted = resolveWantedProductName(it);
    if (!wanted) return 0;

    return Number(productIdByName.get(normalize(wanted)) || 0);
  };

  const totals = useMemo(() => {
    let total = 0;
    const perItem = {};
    const resolved = {};

    for (const it of cartItems) {
      const pid = effectiveProductId(it);
      const p = productById.get(Number(pid));
      const qty = Number(it.quantity) || 1;
      const unit = Number(p?.base_price) || 0;
      const sub = unit * qty;

      perItem[it.id] = { unit, sub, ok: Boolean(p), pid };
      resolved[it.id] = pid;
      total += sub;
    }

    return { total, perItem, resolved };
  }, [cartItems, productById, productIdByName]);

  const canCheckout =
    Boolean(me) &&
    count > 0 &&
    cartItems.every((x) => Number(effectiveProductId(x)) > 0);

  const checkout = async () => {
    if (!me) return show("Rendeléshez jelentkezzen be!", "error");
    if (!count) return;

    const missing = cartItems.filter((x) => Number(effectiveProductId(x)) <= 0);
    if (missing.length) {
      return show("Van olyan tétel, aminél nem található termék.", "error");
    }

    setBusy(true);

    try {
      const items = [];

      for (const it of cartItems) {
        const pid = effectiveProductId(it);
        const fileId = await uploadFilesForItem(it);

        items.push({
          productId: pid,
          quantity: Number(it.quantity) || 1,
          fileId: fileId || null,
        });
      }

      const res = await api.createOrder({ items });
      show(`Rendelés létrehozva (#${res.order_id})`, "success");

      try {
        await api.createSystemLog({
          event_type: "ORDER_CREATED",
          message: `Order ${res.order_id} created`,
        });
      } catch {}

      onOrderCreated?.(res.order_id);
    } catch (e) {
      show(e.message || "Rendelés hiba", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="cart-page">
      <div className="cart-card">
        <h1>Kosár</h1>

        <div className="cart-summary">
          <p>
            <strong>Tételek száma:</strong> {count}
          </p>

          <p style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <strong>Összesen:</strong>
            <span className="order-price">{money(totals.total)}</span>
          </p>

          <p className="cart-note">A rendelés összege a kiválasztott termékekből számolódik.</p>
        </div>

        {msg && <div className={`message-box ${msg.type}`}>{msg.text}</div>}

        {count === 0 ? (
          <div className="cart-empty">
            A kosár üres.
            <button type="button" className="svc-secondary" onClick={goToServices} style={{ marginTop: 14 }}>
              Vissza a szolgáltatásokhoz
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-list">
              {cartItems.map((it) => {
                const p = totals.perItem?.[it.id];
                const resolvedId = Number(p?.pid || 0);
                const resolvedName = resolvedId ? productById.get(resolvedId)?.name : "";
                const wanted = resolveWantedProductName(it);

                return (
                  <li className="cart-item" key={it.id}>
                    <div className="cart-left">
                      <div className="cart-title">{it.category}</div>

                      <div className="cart-meta">
                        Mennyiség: <strong>{it.quantity || 1}</strong>
                      </div>

                      <div className="cart-meta">
                        {it.options?.paperSize} • {it.options?.paperWeight} • {it.options?.paperColor} •{" "}
                        {it.options?.colorMode}
                      </div>

                      {!it.productId && wanted && (
                        <div className="cart-meta" style={{ marginTop: -6 }}>
                          <span className="muted">
                            Backend termék: <strong style={{ color: "#e2e8f0" }}>{resolvedName || wanted}</strong>
                          </span>
                        </div>
                      )}

                      {!it.productId && !wanted && (
                        <div className="cart-meta" style={{ marginTop: -6 }}>
                          <span className="muted">Nincs termék ami azonosítható ehhez a tételhez.</span>
                        </div>
                      )}

                      <div
                        className="cart-meta"
                        style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}
                      >
                        <div className="muted">Ár</div>

                        {p?.ok ? (
                          <div style={{ textAlign: "right" }}>
                            <div className="muted" style={{ fontSize: 13 }}>
                              {money(p.unit)} / db
                            </div>
                            <div className="order-price">{money(p.sub)}</div>
                          </div>
                        ) : (
                          <span className="muted">Nincs termékár (termék nem található)</span>
                        )}
                      </div>

                      {it.previewType === "text" && <div className="cart-preview-text">{it.preview}</div>}

                      {it.previewType === "image" && (
                        <div className="cart-preview-img">
                          <img src={it.preview} alt="Előnézet" />
                        </div>
                      )}

                      {it.previewType === "calendar" && (
                        <CalendarPreview
                          images={it.preview}
                          year={it.options?.year || it.options?.calendarYear || 2026}
                        />
                      )}
                    </div>

                    <div className="cart-right">
                      <button type="button" className="cart-remove" onClick={() => removeFromCart(it.id)} disabled={busy}>
                        Törlés
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="admin-actions" style={{ marginTop: 14, justifyContent: "space-between" }}>
              <button type="button" className="svc-secondary" onClick={goToServices} disabled={busy}>
                + Tovább vásárolok
              </button>

              <button type="button" onClick={checkout} disabled={!canCheckout || busy}>
                {busy ? "Rendelés..." : "Megrendelés leadása"}
              </button>
            </div>

            {!me && (
              <div className="cart-note" style={{ marginTop: 10 }}>
                Rendeléshez jelentkezzen be!
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}