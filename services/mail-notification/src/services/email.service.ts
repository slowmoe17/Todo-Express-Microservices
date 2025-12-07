import nodemailer from 'nodemailer';
import { EmailData } from '../types/email.types';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const port = parseInt(process.env.SMTP_PORT || '587');
    // Port 465 requires secure: true, port 587 uses STARTTLS (secure: false)
    const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;
    
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: port,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(emailData: EmailData): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text || emailData.html.replace(/<[^>]*>/g, ''),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${emailData.to}:`, info.messageId);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();

