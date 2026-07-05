const RESEND_URL = "https://api.resend.com/emails";

async function sendReportEmail({ to, subject, textBody, pngBuffer, filename }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set — add it to backend/.env (see README).");
  }
  if (!to) {
    throw new Error("This LOB has no Head email set — add one in the Admin Console first.");
  }

  const html = textBody
    .split("\n")
    .map(line => (line ? `<p style="margin:0 0 6px;font:14px monospace">${escapeHtml(line)}</p>` : "<br/>"))
    .join("");

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "Delivery Reporter <onboarding@resend.dev>",
      to,
      subject,
      html,
      attachments: [{ filename, content: pngBuffer.toString("base64") }]
    })
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Resend API error (${res.status}): ${detail}`);
  }

  return res.json();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

module.exports = { sendReportEmail };