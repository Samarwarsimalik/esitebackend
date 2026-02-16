import nodemailer from "nodemailer";

export const sendMail = async (email, password) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log("📩 Attempting to send email...");

    await transporter.sendMail({
      from: `"Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Client Account Password",
      html: `
        <h3>Login Credentials</h3>
        <p>Email: ${email}</p>
        <p>Password: <b>${password}</b></p>
      `
    });

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Email failed:", error);
    throw error;
  }
};