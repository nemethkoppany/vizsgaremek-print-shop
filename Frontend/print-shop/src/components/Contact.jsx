export default function Contact() {
  return (
    <section className="home-card-block">
      <div className="section-head">
        <h2>Elérhetőségeink</h2>
        <p className="section-sub">Keressen minket bátran — online és személyesen is.</p>
      </div>
      <div className="contact-grid">
        <div className="contact-info">
          <p><strong>Cím:</strong> Budapest, Ferenc krt. 18</p>
          <p><strong>Email:</strong> info@valami.hu</p>
          <p><strong>Telefonszám:</strong> +36 70 535 4745</p>
          <p><strong>Nyitva tartás:</strong> H–P: 10:00–17:00</p>
         <div className="fb-card">
            <div className="fb-head">
                <span className="fb-dot" />
                <span className="fb-brand" aria-hidden="true">
                    <span className="fb-brandIcon">f</span>
                </span>
                <div className="fb-headtext">
                    <div className="fb-title">Facebook oldalunk:</div>
                    <div className="fb-page">Duplex Print Ferenc körút</div>
                </div>
              </div>
            <div className="fb-body">
                <div className="fb-avatarWrap">
                <img
                    className="fb-avatar"
                    src="./src/assets/fb_1.jpg"
                    alt="Duplex Print"/>
                </div>
                <div className="fb-actions">
                <a  className="fb-follow"
                    href="https://www.facebook.com/duplexprint/?ref=embed_page"
                    target="_blank"
                    rel="noreferrer">
                    <span className="fb-ficon">f</span>
                    Oldal követése
                </a>
                </div>
            </div>
            </div>
        </div>
        <div className="map">
          <iframe
            title="map"
            className="google-map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2696.368666832364!2d19.065730413035883!3d47.48273099640148!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4741dc563fcc017d%3A0x1e586074863a93cd!2sBudapest%2C%20Ferenc%20krt.%2018%2C%201092!5e0!3m2!1shu!2shu!4v1764762921397!5m2!1shu!2shu"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"/>
        </div>
      </div>
    </section>
  );
}