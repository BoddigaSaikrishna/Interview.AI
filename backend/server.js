// server.js — Interview AI Express Backend
require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*", credentials: true }));
app.use(bodyParser.json());

// ── Helpers ─────────────────────────────────────────────────────────────────
function getScoreEmoji(score) {
  if (score >= 80) return "🏆";
  if (score >= 60) return "🎯";
  return "📈";
}

function getReadinessBadge(level) {
  const colors = {
    "Job-Ready": "#22c55e",
    Intermediate: "#f59e0b",
    Beginner: "#6366f1",
  };
  const color = colors[level] || "#6366f1";
  return `<span style="display:inline-block;background:${color};color:#fff;padding:4px 14px;border-radius:99px;font-size:13px;font-weight:700;letter-spacing:0.5px;">${level}</span>`;
}

function scoreBarStyle(score) {
  const bg =
    score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  return `width:${score}%;background:${bg};height:10px;border-radius:6px;`;
}

function buildHtmlEmail(toEmail, interviewType, evaluation) {
  const {
    technicalScore,
    hrScore,
    finalScore,
    strengths,
    weaknesses,
    suggestions,
    readinessLevel,
  } = evaluation;

  const scoreEmoji = getScoreEmoji(finalScore);
  const readinessBadge = getReadinessBadge(readinessLevel);
  const interviewLabel =
    interviewType.charAt(0).toUpperCase() + interviewType.slice(1);
  const appUrl = process.env.APP_URL || "http://localhost:8080";

  const technicalSection =
    technicalScore !== null
      ? `
    <div style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="font-weight:600;color:#374151;">💻 Technical Score</span>
        <span style="font-weight:700;color:#1a1a2e;">${technicalScore}/100</span>
      </div>
      <div style="background:#e5e7eb;border-radius:6px;overflow:hidden;">
        <div style="${scoreBarStyle(technicalScore)}"></div>
      </div>
    </div>`
      : "";

  const hrSection =
    hrScore !== null
      ? `
    <div style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="font-weight:600;color:#374151;">🤝 HR Score</span>
        <span style="font-weight:700;color:#1a1a2e;">${hrScore}/100</span>
      </div>
      <div style="background:#e5e7eb;border-radius:6px;overflow:hidden;">
        <div style="${scoreBarStyle(hrScore)}"></div>
      </div>
    </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Your Interview Results</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:36px 32px;text-align:center;">
              <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">🤖 Interview AI</div>
              <div style="color:rgba(255,255,255,0.85);font-size:14px;margin-top:4px;">${interviewLabel} Interview • Results Report</div>
            </td>
          </tr>

          <!-- Score Hero -->
          <tr>
            <td style="padding:36px 32px 24px;text-align:center;">
              <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);width:110px;height:110px;border-radius:50%;line-height:110px;font-size:36px;font-weight:800;color:#fff;margin:0 auto 16px;">
                ${scoreEmoji}${finalScore}
              </div>
              <div style="font-size:22px;font-weight:700;color:#1a1a2e;margin-bottom:10px;">Interview Complete!</div>
              <div style="margin-bottom:8px;">Readiness Level: ${readinessBadge}</div>
              <div style="color:#6b7280;font-size:14px;">Hi <strong>${toEmail}</strong> — here are your results 🎉</div>
            </td>
          </tr>

          <!-- Score Breakdown -->
          <tr>
            <td style="padding:0 32px 24px;">
              <div style="background:#f9fafb;border-radius:12px;padding:20px;">
                <div style="font-weight:700;color:#1a1a2e;margin-bottom:16px;font-size:15px;">📊 Score Breakdown</div>
                ${technicalSection}
                ${hrSection}
                <div style="margin-bottom:4px;">
                  <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                    <span style="font-weight:600;color:#374151;">🎯 Final Score</span>
                    <span style="font-weight:700;color:#6366f1;">${finalScore}/100</span>
                  </div>
                  <div style="background:#e5e7eb;border-radius:6px;overflow:hidden;">
                    <div style="${scoreBarStyle(finalScore)}"></div>
                  </div>
                </div>
              </div>
            </td>
          </tr>

          <!-- Strengths -->
          <tr>
            <td style="padding:0 32px 20px;">
              <div style="background:#f0fdf4;border-radius:12px;padding:20px;border-left:4px solid #22c55e;">
                <div style="font-weight:700;color:#15803d;margin-bottom:12px;font-size:15px;">✅ Strengths</div>
                <ul style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:1.8;">
                  ${strengths.map((s) => `<li>${s}</li>`).join("")}
                </ul>
              </div>
            </td>
          </tr>

          <!-- Weaknesses -->
          <tr>
            <td style="padding:0 32px 20px;">
              <div style="background:#fffbeb;border-radius:12px;padding:20px;border-left:4px solid #f59e0b;">
                <div style="font-weight:700;color:#b45309;margin-bottom:12px;font-size:15px;">⚠️ Areas to Improve</div>
                <ul style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:1.8;">
                  ${weaknesses.map((w) => `<li>${w}</li>`).join("")}
                </ul>
              </div>
            </td>
          </tr>

          <!-- Suggestions -->
          <tr>
            <td style="padding:0 32px 28px;">
              <div style="background:#eff6ff;border-radius:12px;padding:20px;border-left:4px solid #6366f1;">
                <div style="font-weight:700;color:#3730a3;margin-bottom:12px;font-size:15px;">💡 Improvement Suggestions</div>
                <ol style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:1.8;">
                  ${suggestions.map((s) => `<li>${s}</li>`).join("")}
                </ol>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 32px 36px;text-align:center;">
              <a href="${appUrl}/dashboard"
                 style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">
                Practice Again 🚀
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              <div style="color:#9ca3af;font-size:12px;">
                This email was sent automatically by <strong>Interview AI</strong> because you completed an interview.<br/>
                © 2026 Interview AI. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Static Frontend (production) ────────────────────────────────────────────
const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));

// ── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Interview AI Backend", port: PORT });
});

// POST /api/send-result-email
app.post("/api/send-result-email", async (req, res) => {
  try {
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
      return res
        .status(500)
        .json({ error: "BREVO_API_KEY is not configured in .env" });
    }

    const { toEmail, interviewType, evaluation } = req.body;

    if (!toEmail || !interviewType || !evaluation) {
      return res.status(400).json({
        error: "Missing required fields: toEmail, interviewType, evaluation",
      });
    }

    const subject = `Your ${
      interviewType.charAt(0).toUpperCase() + interviewType.slice(1)
    } Interview Results — Score: ${evaluation.finalScore}/100 🎯`;

    const htmlContent = buildHtmlEmail(toEmail, interviewType, evaluation);

    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Interview AI",
          email: process.env.EMAIL_FROM_ADDRESS || "noreply@interviewai.app",
        },
        to: [{ email: toEmail }],
        subject,
        htmlContent,
      }),
    });

    if (!brevoResponse.ok) {
      const errText = await brevoResponse.text();
      console.error("Brevo API error:", brevoResponse.status, errText);
      return res
        .status(502)
        .json({ error: `Brevo API error: ${errText}` });
    }

    const data = await brevoResponse.json();
    console.log(
      `✅ Email sent to ${toEmail} | messageId: ${data.messageId}`
    );

    return res.status(200).json({ success: true, messageId: data.messageId });
  } catch (err) {
    console.error("send-result-email error:", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to send email",
    });
  }
});

// React Router fallback — serve index.html for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Interview AI backend running on http://localhost:${PORT}`);
});
