import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject,
      text,
      html,
    });
  } catch (error: any) {
    console.error("SendGrid Error:", error.response?.body || error.message);
    throw new Error("Failed to send email");
  }
};
