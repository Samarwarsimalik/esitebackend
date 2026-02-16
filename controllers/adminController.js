import bcrypt from "bcryptjs";
import User from "../models/User";
import { sendEmail } from "../utils/sendEmail.js";

export const approveClient = async (req, res) => {
  const { clientId } = req.params;

  const client = await User.findById(clientId);
  if (!client) return res.status(404).json({ message: "Client not found" });
  if (client.isApproved)
    return res.json({ message: "Client already approved" });

  // Generate random password
  const rawPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  client.password = hashedPassword;
  client.isApproved = true;
  await client.save();

  // Send password email via Brevo
  await sendEmail(
    client.email,
    "Your Account is Approved",
    `<h3>Login Credentials</h3>
     <p>Email: ${client.email}</p>
     <p>Password: <b>${rawPassword}</b></p>`
  );

  res.json({ message: "Client approved and email sent" });
};


// Get all clients
exports.getAllClients = async (req, res) => {
  const clients = await User.find({ role: "client" }).select("-password");
  res.json(clients);
};

// Approve client
exports.approveClient = async (req, res) => {
  const { clientId } = req.params;
  const client = await User.findById(clientId);
  if (!client) return res.status(404).json({ message: "Client not found" });

  if (client.isApproved)
    return res.json({ message: "Client already approved" });

  // Generate password and hash
  const rawPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  client.password = hashedPassword;
  client.isApproved = true;
  await client.save();

  // Send password email
  await sendEmail(
    client.email,
    "Your account is approved",
    `Your password is: ${rawPassword}`
  );

  res.json({ message: "Client approved and email sent" });
};

// Cancel approval (disapprove)
exports.cancelApproval = async (req, res) => {
  const { clientId } = req.params;
  const client = await User.findById(clientId);
  if (!client) return res.status(404).json({ message: "Client not found" });

  client.isApproved = false;
  await client.save();

  res.json({ message: "Client approval cancelled" });
};
