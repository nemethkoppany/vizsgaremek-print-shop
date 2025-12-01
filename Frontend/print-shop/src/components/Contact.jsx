export default function Contact() {
    return (
        <section className="contact">
            <div className="contact-info">
                <h2>Elérhetőségeink</h2>

                <p><strong>Cím:</strong> Budapest, Ferenc krt. 18</p>
                <p><strong>Email:</strong> info@valami.hu</p>
                <p><strong>Telefonszám:</strong> +36 70 535 4745</p>
                <p><strong>Nyitva tartás:</strong> H–P: 10:00–17:00</p>
            </div>

            <div className="map">
                <iframe className="google-map" title="map"
                    src="https://maps.google.com/maps?q=Budapest%20Ferenc%20k%C3%B6r%C3%BAt%2018&t=&z=16&ie=UTF8&iwloc=&output=embed">
                </iframe>
            </div>
        </section>
    );
}
