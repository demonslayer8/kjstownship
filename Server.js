import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import validator from "validator";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval';");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
});

app.use(cors({
  origin: [
    "https://kjstownship.com",
    "https://www.kjstownship.com",
    "https://kjstownship.pages.dev",   // ✅ ADD THIS
    "https://splendid-moxie-2af031.netlify.app",
    "http://127.0.0.1:5500",
    "http://localhost:5500"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: "10kb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

app.use("/send-enquiry", limiter);
app.use("/api/brochure-lead", limiter);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 60000,
  greetingTimeout: 60000,
  socketTimeout: 60000,
});
console.log({
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS_EXISTS: !!process.env.SMTP_PASS
});

transporter.verify((error) => {
  if (error) {
    console.log("SMTP Verify Error:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
  } else {
    console.log("SMTP Server is ready");
  }
});

async function verifyCaptcha(token) {
  if (!token) return false;

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `secret=${process.env.RECAPTCHA_SECRET}&response=${token}`
  });

  const data = await response.json();
  console.log("Captcha Response:", data);
  return data.success;
}

function cleanInput(value) {
  if (!value) return "";
  return validator.escape(String(value).trim());
}

/* CONTACT FORM */
app.post("/send-enquiry", async (req, res) => {
  try {
    let { name, email, phone, interest, message, token } = req.body;

    // ✅ Support Google reCAPTCHA v2 checkbox also
    token = token || req.body["g-recaptcha-response"];

    const isHuman = await verifyCaptcha(token);

    if (!isHuman) {
      return res.status(400).json({
        success: false,
        message: "Captcha verification failed."
      });
    }

    name = cleanInput(name);
    email = cleanInput(email);
    phone = cleanInput(phone);
    interest = cleanInput(interest);
    message = cleanInput(message);

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields."
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address."
      });
    }

    if (!validator.isMobilePhone(phone, "en-IN")) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number."
      });
    }

    if (name.length > 80 || phone.length > 20 || message.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Input is too long."
      });
    }

    const spamWords = ["http://", "https://", "www.", ".ru", ".xyz", "casino", "loan offer"];
    const lowerMessage = message.toLowerCase();

    if (spamWords.some(word => lowerMessage.includes(word))) {
      return res.status(400).json({
        success: false,
        message: "Spam detected."
      });
    }

    await transporter.sendMail({
      from: `"KJS Township Website" <admin@kjstownship.com>`,
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

    res.json({
      success: true,
      message: "Message sent successfully."
    });

  } catch (error) {
   console.log("Server Error Full:", {
  message: error.message,
  code: error.code,
  command: error.command,
  response: error.response
});

    res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
});

/* BROCHURE LEAD FORM */
app.post("/api/brochure-lead", async (req, res) => {
  try {
    let { name, phone } = req.body;

    name = cleanInput(name);
    phone = cleanInput(phone);

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required."
      });
    }

    if (!validator.isMobilePhone(phone, "en-IN")) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number."
      });
    }

    await transporter.sendMail({
  from: `"KJS Township Website" <admin@kjstownship.com>`,
  to: process.env.TO_EMAIL,
  subject: "New Brochure Download Lead - KJS Township",
  html: `
    <h2>New Brochure Lead</h2>
    <p><b>Name:</b> ${name}</p>
    <p><b>Phone:</b> ${phone}</p>
    <p><b>Source:</b> Brochure Download</p>
    <p><b>Date:</b> ${new Date().toLocaleString("en-IN")}</p>
  `
});

    res.json({
      success: true,
      message: "Brochure lead sent successfully."
    });

  } catch (error) {
    console.log("Brochure Lead Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
});
app.get("/", (req, res) => {
  res.send("KJS Township backend is running securely.");
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found."
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Secure server running on port ${PORT}`);
});