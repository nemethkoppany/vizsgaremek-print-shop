import { useMemo, useRef, useState, useEffect } from "react";

const monthsHU = [
  "Január","Február","Március","Április","Május","Június",
  "Július","Augusztus","Szeptember","Október","November","December",
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

export default function Services({ addToCart, goToCart }) {
  const [tab, setTab] = useState("print");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  const showMsg = (text, type) => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(""), 4000);
  };

  const [paperSize, setPaperSize] = useState("A4");
  const [paperWeight, setPaperWeight] = useState("80g");
  const [paperColor, setPaperColor] = useState("Fehér");
  const [colorMode, setColorMode] = useState("Fekete-fehér");

  const options = useMemo(
    () => ({ paperSize, paperWeight, paperColor, colorMode }),
    [paperSize, paperWeight, paperColor, colorMode]
  );

  useEffect(() => {
    if (tab === "print" && paperWeight === "Fotópapír") {
      setColorMode("Fekete-fehér");
      setPaperColor("Fehér");
    }
  }, [tab, paperWeight]);

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

  const txtRef = useRef(null);
  const posterRef = useRef(null);

  const [printText, setPrintText] = useState("");
  const [posterImg, setPosterImg] = useState("");

  const [calendarImgs, setCalendarImgs] = useState(Array(12).fill(null));
  const calendarRefs = useRef(Array.from({ length: 12 }, () => null));

  const pick = (ref) => ref?.current?.click();

  const onTxtFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setPrintText(text.slice(0, 2000));
      showMsg("Szöveg betöltve!", "success");
    } catch {
      showMsg("Nem sikerült beolvasni a fájlt.", "error");
    } finally {
      e.target.value = "";
    }
  };

  const onPosterFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
      next[monthIndex] = { url, name: file.name };
      return next;
    });

    showMsg(`${monthsHU[monthIndex]} kép betöltve!`, "success");
    e.target.value = "";
  };

  const addItem = (type) => {
    if (type === "print") {
      if (paperWeight === "Fotópapír") {
        if (!posterImg) return showMsg("Töltsön fel egy képet!", "error");

        addToCart({
          id: uid(),
          category: "Nyomtatás / Másolás",
          options,
          previewType: "image",
          preview: posterImg,
          price: 0,
        });

        return showMsg("Hozzáadva a kosárhoz!", "success");
      }

      const text = (printText || "").trim();
      if (!text) return showMsg("Adjon meg szöveget vagy töltsön fel .txt fájlt!", "error");

      addToCart({
        id: uid(),
        category: "Nyomtatás / Másolás",
        options,
        previewType: "text",
        preview: text.slice(0, 300),
        price: 0,
      });

      return showMsg("Hozzáadva a kosárhoz!", "success");
    }

    if (type === "poster") {
      if (!posterImg) return showMsg("Töltsön fel egy képet a poszterhez!", "error");

      addToCart({
        id: uid(),
        category: "Poszter",
        options,
        previewType: "image",
        preview: posterImg,
        price: 0,
      });

      return showMsg("Hozzáadva a kosárhoz!", "success");
    }

    if (type === "calendar") {
      const missing = calendarImgs
        .map((img, i) => (img ? null : monthsHU[i]))
        .filter(Boolean);

      if (missing.length) {
        return showMsg(
          `Hiányzó képek az adott hónapban: ${missing.join(", ")}`,
          "error"
        );
      }

      addToCart({
        id: uid(),
        category: "Naptár",
        options,
        previewType: "calendar",
        preview: calendarImgs.map((x) => x.url),
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

              {tab !== "poster" && !(tab === "print" && paperWeight === "Fotópapír") && (
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
                <select value={paperSize} onChange={(e) => setPaperSize("A4")}>
                  <option value="A4">A4</option>
                </select>
              </div>

              <div className="svc-field">
                <label>Papír súly</label>
                <select value={paperWeight} onChange={(e) => setPaperWeight("200g")}>
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
                  {tab !== "poster" && <option value="Fotópapír">Fotópapír</option>}
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

            {paperWeight !== "Fotópapír" ? (
              <>
                <input ref={txtRef} type="file" accept=".txt,text/plain" className="hidden-file" onChange={onTxtFile} />
                <button type="button" className="svc-secondary" onClick={() => pick(txtRef)}>
                  Szöveg feltöltése (.txt)
                </button>

                <label>Szöveg beírása:</label>
                <textarea
                  className="svc-textarea"
                  value={printText}
                  onChange={(e) => setPrintText(e.target.value)}
                  placeholder="Ide írja a szöveget vagy töltsön fel .txt fájlt…"
                />

                <div className="svc-preview-wrap">
                  <div className="paper-mock">
                    <div className="paper-head">{headerLine}</div>
                    <div className="paper-body">
                      {(printText || "Itt fog megjelenni a fent beírt szöveg…").slice(0, 600)}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <input ref={posterRef} type="file" accept="image/*" className="hidden-file" onChange={onPosterFile} />
                <button type="button" className="svc-secondary" onClick={() => pick(posterRef)}>
                  Kép feltöltése
                </button>

                <div className="svc-preview-wrap">
                  <div className="poster-mock">
                    <div className="poster-head">{headerLine}</div>
                    <div className="poster-body">
                      {posterImg ? <img src={posterImg} alt="Fotópapír előnézet" /> : <div className="poster-placeholder">Töltsön fel egy képet…</div>}
                    </div>
                  </div>
                </div>
              </>
            )}

            <button type="button" onClick={() => addItem("print")}>Kosárba</button>
          </div>
        )}

        {tab === "poster" && (
          <div className="svc-section">
            <h2>Poszter</h2>

            <input ref={posterRef} type="file" accept="image/*" className="hidden-file" onChange={onPosterFile} />
            <button type="button" className="svc-secondary" onClick={() => pick(posterRef)}>
              Kép feltöltése
            </button>

            <div className="svc-preview-wrap">
              <div className="poster-mock">
                <div className="poster-head">{headerLine}</div>
                <div className="poster-body">
                  {posterImg ? <img src={posterImg} alt="Poszter előnézet" /> : <div className="poster-placeholder">Töltsön fel egy képet…</div>}
                </div>
              </div>
            </div>

            <button type="button" onClick={() => addItem("poster")}>Kosárba</button>
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

            <button type="button" onClick={() => addItem("calendar")}>Kosárba</button>
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
