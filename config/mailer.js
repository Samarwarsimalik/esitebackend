import nodemailer from "nodemailer";

export const sendMail = async (email, password) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,              // ✅ explicitly define port
    secure: true,           // ✅ required for 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Admin" <${process.env.EMAIL_USER}>`,  // ⚠️ use same email
    to: email,
    subject: "Your Client Account Password",
    html: `
      <h3>Login Credentials</h3>
      <p>Email: ${email}</p>
      <p>Password: <b>${password}</b></p>
    `
  });
};