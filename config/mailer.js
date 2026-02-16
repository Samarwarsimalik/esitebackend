export const sendMail = async (email, password) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `Admin <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Client Account Password",
      html: `<h3>Login Credentials</h3>
             <p>Email: ${email}</p>
             <p>Password: <b>${password}</b></p>`,
    });

    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Error sending email:", err);
  }
};