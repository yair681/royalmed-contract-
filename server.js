const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Email config ──────────────────────────────
const GMAIL_USER = process.env.GMAIL_USER || "przyyryair@gmail.com";
const GMAIL_PASS = process.env.GMAIL_PASS || ""; // App Password
const NOTIFY_TO  = process.env.NOTIFY_TO  || "przyyryair@gmail.com";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
app.use(express.json({ limit: "5mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ── POST /sign ────────────────────────────────
app.post("/sign", async (req, res) => {
  const { name, company, id_num, phone, email, date, signature } = req.body;

  if (!name || !signature) {
    return res.status(400).json({ ok: false, error: "חסרים פרטים" });
  }

  // שלח מייל
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_PASS }
    });

    const signatureImg = `<img src="${signature}" style="max-width:300px;border:1px solid #ccc;border-radius:6px;">`;

    await transporter.sendMail({
      from: `"רויאל-מד חוזים" <${GMAIL_USER}>`,
      to: NOTIFY_TO,
      subject: `✅ הסכם נחתם — ${name} | ${company}`,
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;">
          <h2 style="color:#006889">✅ הסכם רויאל-מד AI נחתם!</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:6px;color:#666">שם:</td><td style="padding:6px"><strong>${name}</strong></td></tr>
            <tr><td style="padding:6px;color:#666">חברה:</td><td style="padding:6px">${company || "—"}</td></tr>
            <tr><td style="padding:6px;color:#666">ח.פ/ת.ז:</td><td style="padding:6px">${id_num || "—"}</td></tr>
            <tr><td style="padding:6px;color:#666">טלפון:</td><td style="padding:6px">${phone || "—"}</td></tr>
            <tr><td style="padding:6px;color:#666">מייל:</td><td style="padding:6px">${email || "—"}</td></tr>
            <tr><td style="padding:6px;color:#666">תאריך:</td><td style="padding:6px">${date}</td></tr>
          </table>
          <h3 style="color:#006889;margin-top:20px">חתימה:</h3>
          ${signatureImg}
          <p style="color:#999;font-size:12px;margin-top:20px">מאסטר קוד | yairmaster.info</p>
        </div>
      `
    });

    console.log(`[SIGN] ${name} — ${company} — ${new Date().toLocaleString("he-IL")}`);
    res.json({ ok: true });

  } catch (err) {
    console.error("[SIGN ERROR]", err.message);
    // שמור לוג גם אם מייל נכשל
    res.json({ ok: true, warn: "מייל לא נשלח" });
  }
});

app.listen(PORT, () => {
  console.log(`שרת חוזים פועל: http://localhost:${PORT}`);
});
