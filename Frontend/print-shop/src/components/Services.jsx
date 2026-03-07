import { useMemo, useRef, useState, useEffect } from "react";
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

const COLOR_GROUPS = [
  {
    title: "Alapszínek",
    options: [
      { label: "Fehér", value: "Fehér", dot: "#ffffff" },
      { label: "Sárga", value: "Sárga", dot: "#facc15" },
      { label: "Kék", value: "Kék", dot: "#3b82f6" },
      { label: "Piros", value: "Piros", dot: "#ef4444" },
      { label: "Zöld", value: "Zöld", dot: "#22c55e" },
      { label: "Fekete", value: "Fekete", dot: "#000000" },
      { label: "Szürke", value: "Szürke", dot: "#9ca3af" },
      { label: "Barna", value: "Barna", dot: "#a16207" },
    ],
  },
  {
    title: "Világos színek",
    options: [
      { label: "Halványsárga", value: "Halványsárga", dot: "#fde68a" },
      { label: "Halványkék", value: "Halványkék", dot: "#93c5fd" },
      { label: "Halványzöld", value: "Halványzöld", dot: "#86efac" },
      { label: "Halványrózsaszín", value: "Halványrózsaszín", dot: "#fbcfe8" },
      { label: "Halványnarancs", value: "Halványnarancs", dot: "#fdba74" },
      { label: "Krém", value: "Krém", dot: "#f3e7c9" },
      { label: "Halványlila", value: "Halványlila", dot: "#ddd6fe" },
    ],
  },
  {
    title: "Erős(Intenzív) színek",
    options: [
      { label: "Neon sárga", value: "Neon sárga", dot: "#fef08a" },
      { label: "Neon narancs", value: "Neon narancs", dot: "#fb923c" },
      { label: "Sötétzöld", value: "Sötétzöld", dot: "#046d00" },
      { label: "Bordó", value: "Bordó", dot: "#8b0000" },
      { label: "Sötétkék", value: "Sötétkék", dot: "#001aac" },
    ],
  },
];

const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("file_read_error"));
    r.readAsDataURL(file);
  });

const countPdfPages = (buf) => {
  try {
    const bytes = new Uint8Array(buf);
    let text = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      text += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    const matches = text.match(/\/Type\s*\/Page(?!s)/g);
    return matches ? matches.length : null;
  } catch {
    return null;
  }
};

function findProductByName(products, wantedName) {
  const target = String(wantedName || "").trim().toLowerCase();
  const list = Array.isArray(products) ? products : [];
  return list.find((p) => String(p?.name || "").trim().toLowerCase() === target) || null;
}

function resolveWantedProductName(type, { paperSize, paperWeight, colorMode }) {
  if (type === "poster") {
    if (paperWeight === "80g") return "Poszter nyomtatás – tervrajz (80g)";
    if (paperWeight === "140g") return "Poszter nyomtatás – plakát (140g)";
    if (paperWeight === "Fotópapír") return "Poszter nyomtatás – fotópapír";
    return "Poszter nyomtatás – plakát (140g)";
  }

  if (type === "calendar") {
    if (paperSize === "A3") return "Falinaptár – 13 lapos A3";
    return "Falinaptár – 13 lapos A4";
  }

  const size = paperSize === "A3" ? "A3" : "A4";
  const isColor = colorMode === "Színes";

  if (isColor) return `${size} színes nyomtatás (egyoldalas)`;
  return `${size} fekete-fehér nyomtatás (egyoldalas)`;
}

export default function Services({ addToCart, goToCart, products = [], me }) {
  const [tab, setTab] = useState("print");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const showMsg = (text, type) => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(""), 4000);
  };

  const [quantity, setQuantity] = useState(1);

  const [localProducts, setLocalProducts] = useState(products);
  useEffect(() => setLocalProducts(products), [products]);

  useEffect(() => {
    if (localProducts?.length) return;
    (async () => {
      try {
        const data = await api.getProducts();
        setLocalProducts(Array.isArray(data) ? data : []);
      } catch {}
    })();
  }, [localProducts]);

  const [paperSize, setPaperSize] = useState("A4");
  const [paperWeight, setPaperWeight] = useState("80g");
  const [paperColor, setPaperColor] = useState("Fehér");
  const [colorMode, setColorMode] = useState("Fekete-fehér");

  const options = useMemo(
    () => ({ paperSize, paperWeight, paperColor, colorMode }),
    [paperSize, paperWeight, paperColor, colorMode]
  );

  useEffect(() => {
    if (tab === "poster") {
      setPaperColor("Fehér");
      setColorMode("Fekete-fehér");
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "calendar") {
      setPaperSize("A4");
      setPaperWeight("200g");
      setPaperColor("Fehér");
      setColorMode("Fekete-fehér");
    }
  }, [tab]);

  const headerLine = `${paperSize} • ${paperWeight} • ${paperColor} • ${colorMode}`;

  const docRef = useRef(null);
  const posterRef = useRef(null);

  const [docMeta, setDocMeta] = useState(null); // { name, type, size, pages, dataUrl }
  const [posterImg, setPosterImg] = useState("");
  const [posterFile, setPosterFile] = useState(null);

  const [calendarImgs, setCalendarImgs] = useState(Array(12).fill(null));
  const calendarRefs = useRef(Array.from({ length: 12 }, () => null));

  const pick = (ref) => ref?.current?.click();

  const onDocFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = (file.type || "").toLowerCase().includes("pdf") || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      showMsg("Csak PDF dokumentumot tölts fel!", "error");
      e.target.value = "";
      return;
    }

    const maxMb = 10;
    if (file.size > maxMb * 1024 * 1024) {
      showMsg(`A fájl túl nagy (${maxMb}MB felett). Kisebb PDF-et tölts fel!`, "error");
      e.target.value = "";
      return;
    }

    try {
      const buf = await file.arrayBuffer();
      const pages = countPdfPages(buf);
      const dataUrl = await fileToDataUrl(file);

      setDocMeta({
        name: file.name,
        type: file.type || "application/pdf",
        size: file.size,
        pages: pages || null,
        dataUrl,
      });

      showMsg("Dokumentum betöltve!", "success");
    } catch {
      showMsg("Nem sikerült beolvasni a PDF-et.", "error");
    } finally {
      e.target.value = "";
    }
  };

  const onPosterFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPosterFile(file);
    setPosterImg(URL.createObjectURL(file));
    showMsg("Kép betöltve!", "success");
    e.target.value = "";
  };

  const onCalendarFile = (monthIndex, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    setCalendarImgs((prev) => {
      const next = [...prev];
      if (next[monthIndex]?.url) URL.revokeObjectURL(next[monthIndex].url);
      next[monthIndex] = { url, name: file.name, file };
      return next;
    });

    showMsg(`${monthsHU[monthIndex]} kép betöltve!`, "success");
    e.target.value = "";
  };

  const addItem = (type) => {
    if (!me) return showMsg("A rendeléshez jelentkezzen be!", "error");

    const wantedName = resolveWantedProductName(type, { paperSize, paperWeight, colorMode });
    const matched = findProductByName(localProducts, wantedName);
    const productId = matched?.product_id ?? matched?.id;

    if (!productId) {
      return showMsg("Ehhez a szolgáltatáshoz nincs megfelelő termék.", "error");
    }

    const qty = Math.max(1, Number(quantity) || 1);

    if (type === "print") {
      if (!docMeta?.dataUrl) return showMsg("Töltsön fel egy PDF dokumentumot!", "error");

      addToCart({
        id: uid(),
        category: "Nyomtatás / Másolás",
        productId,
        quantity: qty, // példányszám
        options,
        previewType: "document",
        preview: {
          name: docMeta.name,
          pages: docMeta.pages,
        },
        fileDataUrl: docMeta.dataUrl,
        fileName: docMeta.name,
        fileType: docMeta.type,
        fileSize: docMeta.size,
        filePages: docMeta.pages,
        files: [],
        price: 0,
      });

      return showMsg("Hozzáadva a kosárhoz!", "success");
    }

    if (type === "poster") {
      if (!posterImg) return showMsg("Töltsön fel egy képet a poszterhez!", "error");

      addToCart({
        id: uid(),
        category: "Poszter",
        productId,
        quantity: qty,
        options,
        previewType: "image",
        preview: posterImg,
        files: posterFile ? [posterFile] : [],
        price: 0,
      });

      return showMsg("Hozzáadva a kosárhoz!", "success");
    }

    if (type === "calendar") {
      const missing = calendarImgs.map((img, i) => (img ? null : monthsHU[i])).filter(Boolean);
      if (missing.length) {
        return showMsg(`Hiányzó képek az adott hónapban: ${missing.join(", ")}`, "error");
      }

      addToCart({
        id: uid(),
        category: "Naptár",
        productId,
        quantity: qty,
        options,
        previewType: "calendar",
        preview: calendarImgs.map((x) => x.url),
        files: calendarImgs.map((x) => x.file).filter(Boolean),
        price: 0,
      });

      return showMsg("Hozzáadva a kosárhoz!", "success");
    }
  };

  return (
    <section className="services-page">
      <div className="services-card">
        <h1>Szolgáltatások</h1>

        <div className="svc-tabs">
          <button className={tab === "print" ? "active" : ""} onClick={() => setTab("print")}>
            Nyomtatás / Másolás
          </button>
          <button className={tab === "poster" ? "active" : ""} onClick={() => setTab("poster")}>
            Poszter
          </button>
          <button className={tab === "calendar" ? "active" : ""} onClick={() => setTab("calendar")}>
            Naptár
          </button>
        </div>

        <div className="svc-qty">
          <div className="svc-field">
            <label>Mennyiség</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
        </div>

        <div className="svc-options">
          {tab !== "calendar" && (
            <div className="svc-row">
              <div className="svc-field">
                <label>Papír méret</label>
                <select value={paperSize} onChange={(e) => setPaperSize(e.target.value)}>
                  <option value="A5">A5</option>
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                </select>
              </div>

              {tab !== "poster" && (
                <div className="svc-field">
                  <label>Szöveg szín</label>
                  <select value={colorMode} onChange={(e) => setColorMode(e.target.value)}>
                    <option value="Fekete-fehér">Fekete-fehér</option>
                    <option value="Színes">Színes</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {tab === "calendar" && (
            <div className="svc-row">
              <div className="svc-field">
                <label>Papír méret</label>
                <select value={paperSize} onChange={() => setPaperSize("A4")}>
                  <option value="A4">A4</option>
                </select>
              </div>

              <div className="svc-field">
                <label>Papír súly</label>
                <select value={paperWeight} onChange={() => setPaperWeight("200g")}>
                  <option value="200g">200g</option>
                </select>
              </div>
            </div>
          )}

          {tab !== "calendar" && (
            <div className="svc-row">
              <div className="svc-field">
                <label>Papír súly</label>
                <select value={paperWeight} onChange={(e) => setPaperWeight(e.target.value)}>
                  <option value="80g">80g</option>
                  <option value="120g">120g</option>
                  <option value="140g">140g</option>
                  <option value="200g">200g</option>
                  {tab === "poster" && <option value="Fotópapír">Fotópapír</option>}
                </select>
              </div>

              {tab !== "poster" && (
                <div className="svc-field">
                  <label>Papír szín</label>

                  {COLOR_GROUPS.map((g) => (
                    <div className="color-group" key={g.title}>
                      <div className="color-group-title">{g.title}</div>

                      <div className="color-grid">
                        {g.options.map((o) => (
                          <button
                            type="button"
                            key={o.value}
                            className={`color-pill ${paperColor === o.value ? "active" : ""}`}
                            onClick={() => setPaperColor(o.value)}
                            title={o.label}
                          >
                            <span className="pill-dot" style={{ background: o.dot }} />
                            <span className="pill-name">{o.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {msg && (
          <div className={`message-box ${msgType}`} style={{ marginTop: 12 }}>
            {msg}
          </div>
        )}

        {tab === "print" && (
          <div className="svc-section">
            <h2>Nyomtatás / Másolás</h2>

            <input
              ref={docRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden-file"
              onChange={onDocFile}
            />

            <button type="button" className="svc-secondary" onClick={() => pick(docRef)}>
              Dokumentum feltöltése (PDF)
            </button>

            <div className="svc-preview-wrap">
              <div className="paper-mock">
                <div className="paper-head">{headerLine}</div>
                <div className="paper-body">
                  {docMeta ? (
                    <div className="doc-preview">
                      <div><strong>{docMeta.name}</strong></div>
                      <div className="doc-pages-badge">
                        <span className="big">{docMeta.pages ? docMeta.pages : "?"}</span>
                        <span className="small">oldal</span>
                      </div>
                    </div>
                  ) : (
                    "Töltsön fel egy PDF dokumentumot…"
                  )}
                </div>
              </div>
            </div>

            <button type="button" onClick={() => addItem("print")}>
              Kosárba
            </button>
          </div>
        )}

        {tab === "poster" && (
          <div className="svc-section">
            <h2>Poszter</h2>

            <input
              ref={posterRef}
              type="file"
              accept="image/*"
              className="hidden-file"
              onChange={onPosterFile}
            />

            <button type="button" className="svc-secondary" onClick={() => pick(posterRef)}>
              Kép feltöltése
            </button>

            <div className="svc-preview-wrap">
              <div className="poster-mock">
                <div className="poster-head">{headerLine}</div>
                <div className="poster-body">
                  {posterImg ? (
                    <img src={posterImg} alt="Poszter előnézet" />
                  ) : (
                    <div className="poster-placeholder">Töltsön fel egy képet…</div>
                  )}
                </div>
              </div>
            </div>

            <button type="button" onClick={() => addItem("poster")}>
              Kosárba
            </button>
          </div>
        )}

        {tab === "calendar" && (
          <div className="svc-section">
            <h2>Naptár</h2>

            <div className="calendar-mock">
              <div className="calendar-head">{headerLine}</div>

              <div className="calendar-grid">
                {monthsHU.map((m, i) => (
                  <div className="cal-cell" key={m}>
                    <div className="cal-month">{m}</div>

                    <div className="cal-photo">
                      {calendarImgs[i]?.url ? (
                        <img src={calendarImgs[i].url} alt={m} />
                      ) : (
                        <div className="cal-empty">Kép</div>
                      )}
                    </div>

                    <input
                      ref={(el) => (calendarRefs.current[i] = el)}
                      type="file"
                      accept="image/*"
                      className="hidden-file"
                      onChange={(e) => onCalendarFile(i, e)}
                    />

                    <div style={{ padding: "10px" }}>
                      <button
                        type="button"
                        className="svc-secondary"
                        onClick={() => calendarRefs.current[i]?.click()}
                        style={{ width: "100%", marginTop: 0 }}
                      >
                        Kép feltöltése
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="button" onClick={() => addItem("calendar")}>
              Kosárba
            </button>
          </div>
        )}

        <div className="svc-footer">
          <button type="button" className="svc-secondary" onClick={goToCart}>
            Kosárhoz
          </button>
        </div>
      </div>
    </section>
  );
}