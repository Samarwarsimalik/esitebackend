// utils/sendEmail.js

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args)); // Node <18 fallback

const sendEmail = async (to, subject, html) => {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "My Shop", email: "no-reply@yourdomain.com" }, // Brevo verified email
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    const data = await response.json();
    console.log("Email sent successfully:", data);
  } catch (err) {
    console.error("Brevo send error:", err);
  }
};

module.exports = sendEmail;