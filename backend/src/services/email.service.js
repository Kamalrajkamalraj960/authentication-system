import nodemailer from 'nodemailer';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import {
  verificationEmailTemplate,
  passwordResetEmailTemplate,
  welcomeEmailTemplate,
} from '../emails/templates.js';

/**
 * Transactional email service backed by nodemailer/SMTP.
 *
 * In environments without SMTP credentials (local dev / tests) we fall back to
 * a "log transport" that prints the message instead of sending it, so flows can
 * be exercised end-to-end without a real mail server.
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.enabled = Boolean(config.smtp.user && config.smtp.pass);
  }

  getTransporter() {
    if (this.transporter) return this.transporter;
    if (!this.enabled) return null;

    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
    return this.transporter;
  }

  async send({ to, subject, html }) {
    const transporter = this.getTransporter();

    if (!transporter) {
      logger.warn(`[email:disabled] Would send "${subject}" to ${to}`);
      logger.debug(html);
      return { mocked: true };
    }

    const info = await transporter.sendMail({ from: config.smtp.from, to, subject, html });
    logger.info(`Email sent to ${to} (messageId: ${info.messageId})`);
    return info;
  }

  sendVerificationEmail({ to, name, token }) {
    const url = `${config.clientUrl}/verify-email?token=${token}`;
    return this.send({
      to,
      subject: 'Verify your email address',
      html: verificationEmailTemplate({ name, url }),
    });
  }

  sendPasswordResetEmail({ to, name, token }) {
    const url = `${config.clientUrl}/reset-password?token=${token}`;
    return this.send({
      to,
      subject: 'Reset your password',
      html: passwordResetEmailTemplate({ name, url }),
    });
  }

  sendWelcomeEmail({ to, name }) {
    return this.send({
      to,
      subject: 'Welcome to AuthPlatform',
      html: welcomeEmailTemplate({ name }),
    });
  }
}

export default new EmailService();
