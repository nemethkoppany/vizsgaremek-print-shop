import { useState } from "react";

export default function Hero({ setPage }) {
  const [lightboxImg, setLightboxImg] = useState(null);

  const offers = [
    {
      title: "Nyomtatás & Másolás",
      text: "A5/A4/A3, fekete-fehér vagy színes.",
      images: ["./src/assets/pr_1.png", "./src/assets/pr_2.jpg", "./src/assets/pr_3.png"],
      icons: ["./src/assets/cpyy.png", "./src/assets/print.png"],
    },
    {
      title: "Poszter készítés",
      text: "A5/A4/A3, színes.",
      images: ["./src/assets/pos_1.jpg", "./src/assets/pos_2.jpg", "./src/assets/pos_3.jpg"],
      icons: ["./src/assets/post.png"],
    },
    {
      title: "Falinaptár",
      text: "A/4, színes.",
      images: ["./src/assets/nap_1.png", "./src/assets/nap_2.png", "./src/assets/nap_3.png"],
      icons: ["./src/assets/nap.png"],
    },
  ];

  return (
    <section className="hero hero-card">
      <div className="hero-top">
        <div className="hero-left">
          <h1>
            Gyors és hatékony nyomtatás,
            <br />
            másolás illetve poszter és naptár
            <br />
            készítés az ön igénye szerint.
          </h1>
          <p className="hero-sub">
            Online feltöltés, előnézet, és átlátható rendelés – mindent egy helyen.
          </p>
        </div>
      </div>
      <div className="hero-divider" />
      <div className="hero-offers">
        <h2>Mit nyújtunk?</h2>
        <div className="offers-grid">
          {offers.map((o) => (
            <div className="offer-card" key={o.title}>
              <div className="offer-header">
                <div className="offer-title">{o.title}</div>
                <div className="offer-icons">
                  {o.icons.map((icon, i) => (
                    <img
                      key={icon + i}
                      src={icon}
                      alt={`${o.title} ikon`}
                      className="offer-icon"/>
                  ))}
                </div>
              </div>
              <div className="offer-text">{o.text}</div>
              <div className="offer-thumbs">
                {o.images.map((src, i) => (
                  <button
                    type="button"
                    className="thumb"
                    key={src + i}
                    onClick={() => setLightboxImg(src)}>
                    <img src={src} alt={`${o.title} ${i + 1}`} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="offers-actions">
          <button
            type="button"
            className="home-btn"
            onClick={() => setPage?.("services")}>
            Szolgáltatások megtekintése
          </button>
        </div>
      </div>
      {lightboxImg && (
        <div className="lightbox" onClick={() => setLightboxImg(null)}>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxImg(null)}>
              ✕
            </button>
            <img src={lightboxImg} alt="Nagyított kép" />
          </div>
        </div>
      )}
    </section>
  );
}