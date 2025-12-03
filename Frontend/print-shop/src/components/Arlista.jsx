export default function Arlista() {
    return (
        <section className="arlista">
            <h1>Árlista</h1>

            <div className="price-grid">

                <div className="price-card">
                <h3>Fekete-fehér másolás</h3>
                <p>1 – 50 oldal: <strong>20 Ft / oldal</strong></p>
                <p>50+ oldal: <strong>15 Ft / oldal</strong></p>
                </div>

                <div className="price-card">
                <h3>Színes másolás</h3>
                <p>1 – 50 oldal: <strong>80 Ft / oldal</strong></p>
                <p>50+ oldal: <strong>60 Ft / oldal</strong></p>
                </div>

                <div className="price-card">
                <h3>Poszter nyomtatás</h3>
                <p>A3: <strong>1500 Ft</strong></p>
                <p>A2: <strong>2500 Ft</strong></p>
                <p>A1: <strong>3500 Ft</strong></p>
                </div>

                <div className="price-card">
                <h3>Naptár készítés</h3>
                <p>1 db: <strong>3990 Ft</strong></p>
                <p>5+ db: <strong>3490 Ft / db</strong></p>
                </div>

            </div>
        </section>
    );
}