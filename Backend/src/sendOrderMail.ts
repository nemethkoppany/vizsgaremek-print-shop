import { transporter } from "./mailer";

export const sendOrderConfirmation = async (
  email: string,orderId: number,total: number) => {
  await transporter.sendMail({
    from: `"Print Shop" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Sikeres rendelés",
    html: `
      <h2>Rendelés visszaigazolás</h2>
      <p>Rendelés azonosító: <b>${orderId}</b></p>
      <p>Fizetendő összeg: <b>${total} Ft</b></p>
      <hr>
      <p>Köszönjük a rendelést!</p>
    `
  });
};