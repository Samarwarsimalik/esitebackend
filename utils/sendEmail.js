// utils/sendEmail.js
export const sendEmail = async (to, subject, html) => {
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
    console.log("Email sent:", data);
  } catch (err) {
    console.error("Error sending email:", err);
  }
};