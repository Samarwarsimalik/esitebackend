import axios from "axios";

export const sendMail = async (email, password) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Admin", email: "no-reply@yourdomain.com" }, // Verified Brevo email
        to: [{ email: email }],
        subject: "Your Client Account Password",
        htmlContent: `
          <h3>Login Credentials</h3>
          <p>Email: ${email}</p>
          <p>Password: <b>${password}</b></p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Email sent successfully:", response.data);
  } catch (err) {
    console.error("Brevo send error:", err.response?.data || err);
  }
};