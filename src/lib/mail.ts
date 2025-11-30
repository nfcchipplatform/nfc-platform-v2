// src/lib/mail.ts

import nodemailer from "nodemailer";

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Gmail送信用のトランスポーター設定
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// この export const が重要です
export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/new-password?token=${token}`;

  await transporter.sendMail({
    from: `"NFC Platform Support" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "【NFC Platform】パスワードのリセット",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>パスワードリセット</h2>
        <p>パスワードリセットのリクエストを受け付けました。</p>
        <p>以下のリンクをクリックして、新しいパスワードを設定してください。</p>
        <a href="${resetLink}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          パスワードをリセットする
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          ※このリンクは1時間有効です。<br/>
          ※お心当たりがない場合は、このメールを無視してください。
        </p>
      </div>
    `,
  });
};