import nodemailer from "nodemailer";

export const sendMail = async (email, password) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: "Admin <no-reply@company.com>",
    to: email,
    subject: "Your Client Account Password",
    html: `<h3>Login Credentials</h3>
           <p>Email: ${email}</p>
           <p>Password: <b>${password}</b></p>`
  });
};
