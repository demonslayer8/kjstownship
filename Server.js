import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

app.post("/send-enquiry", async (req, res) => {
  const { name, email, phone, interest, message } = req.body;

  try {
    await transporter.sendMail({
      from: `"KJS Township Website" <${process.env.EMAIL}>`,
      to: process.env.TO_EMAIL,
      replyTo: email,
      subject: "New Website Enquiry - KJS Township",
      html: `
        <h2>New Website Enquiry</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Interested In:</b> ${interest}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.log("Email Error:", error);
    res.json({ success: false });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});