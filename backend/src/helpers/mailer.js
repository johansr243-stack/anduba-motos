
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

const sendResetCodeEmail = async (to, code) => {
  await transporter.sendMail({
    from: `"AndubaMotos" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Código para recuperar tu contraseña',
    html: `
      <div style="font-family: sans-serif; text-align: center; padding: 20px;">
        <h2 style="color: #E53935;">AndubaMotos</h2>
        <p>Tu código de recuperación es:</p>
        <h1 style="letter-spacing: 8px;">${code}</h1>
        <p>Este código expira en 10 minutos.</p>
      </div>
    `,
  });
};

export default sendResetCodeEmail