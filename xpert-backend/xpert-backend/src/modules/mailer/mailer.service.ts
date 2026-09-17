import nodemailer from 'nodemailer';
import pino from 'pino';
import { config } from '../../config/env.js';
import {
  otpEmailTemplate,
  type OtpEmailPurpose,
} from './templates/otp-email.template.js';

const logger = pino({ name: 'mailer' });

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: Number(config.SMTP_PORT),
  secure: Number(config.SMTP_PORT) === 465,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

export async function verifyMailer(): Promise<void> {
  await transporter.verify();
  logger.info({ host: config.SMTP_HOST, port: config.SMTP_PORT }, 'SMTP transporter verified');
}

const subjects: Record<OtpEmailPurpose, string> = {
  registration: 'Verify your XpertAssistant account',
  password_reset: 'Reset your XpertAssistant password',
};

export async function sendOtpEmail(
  to: string,
  otp: string,
  purpose: OtpEmailPurpose,
): Promise<void> {
  try {
    await transporter.sendMail({
      from: config.SMTP_FROM,
      to,
      subject: subjects[purpose],
      html: otpEmailTemplate({ otp, purpose }),
    });
    logger.info({ to, purpose }, 'OTP email sent');
  } catch (error) {
    logger.error({ err: error, to, purpose }, 'Failed to send OTP email');
    throw new Error('OTP email delivery failed');
  }
}
