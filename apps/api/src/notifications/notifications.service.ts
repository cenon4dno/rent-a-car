import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly transporter: nodemailer.Transporter | null = null;
  private readonly from: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    this.from = process.env.SMTP_FROM ?? 'noreply@rentacar.app';

    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT ?? '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      this.logger.warn('SMTP_HOST not set — email notifications are disabled (log-only mode)');
    }
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.log(`[EMAIL STUB] To: ${to} | Subject: ${subject}`);
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${String(err)}`);
    }
  }

  async sendBookingConfirmation(opts: {
    to: string;
    customerName: string;
    vehicleName: string;
    referenceNumber: string;
    startDate: Date;
    endDate: Date;
    totalAmount: number;
  }) {
    const subject = `Booking Confirmed — ${opts.referenceNumber}`;
    const html = `
      <h2>Your booking is confirmed!</h2>
      <p>Hi ${opts.customerName},</p>
      <p>Your rental for <strong>${opts.vehicleName}</strong> has been confirmed.</p>
      <ul>
        <li><strong>Reference:</strong> ${opts.referenceNumber}</li>
        <li><strong>Pick-up:</strong> ${opts.startDate.toDateString()}</li>
        <li><strong>Return:</strong> ${opts.endDate.toDateString()}</li>
        <li><strong>Total paid:</strong> ₱${opts.totalAmount.toLocaleString()}</li>
      </ul>
      <p>Show your QR code at pick-up. Safe travels!</p>
      <p>— RentACar Team</p>
    `;
    await this.send(opts.to, subject, html);
  }

  async sendBookingCancellation(opts: {
    to: string;
    customerName: string;
    vehicleName: string;
    referenceNumber: string;
    refundAmount: number;
    refundRate: number;
  }) {
    const subject = `Booking Cancelled — ${opts.referenceNumber}`;
    const refundMsg =
      opts.refundAmount > 0
        ? `A refund of <strong>₱${opts.refundAmount.toLocaleString()}</strong> (${Math.round(opts.refundRate * 100)}%) will be credited to your original payment method within 5–10 business days.`
        : 'No refund applies based on our cancellation policy (cancellation within 24 hours of pick-up).';

    const html = `
      <h2>Booking Cancelled</h2>
      <p>Hi ${opts.customerName},</p>
      <p>Your booking <strong>${opts.referenceNumber}</strong> for <strong>${opts.vehicleName}</strong> has been cancelled.</p>
      <p>${refundMsg}</p>
      <p>— RentACar Team</p>
    `;
    await this.send(opts.to, subject, html);
  }

  async sendRenterCancellationAlert(opts: {
    to: string;
    renterName: string;
    vehicleName: string;
    referenceNumber: string;
    startDate: Date;
  }) {
    const subject = `Booking Cancelled — ${opts.referenceNumber}`;
    const html = `
      <h2>Booking Cancellation Notice</h2>
      <p>Hi ${opts.renterName},</p>
      <p>Booking <strong>${opts.referenceNumber}</strong> for <strong>${opts.vehicleName}</strong> (scheduled pick-up: ${opts.startDate.toDateString()}) has been cancelled by the customer.</p>
      <p>The vehicle is now available again.</p>
      <p>— RentACar Team</p>
    `;
    await this.send(opts.to, subject, html);
  }

  async sendPaymentFailure(opts: {
    to: string;
    customerName: string;
    referenceNumber: string;
    vehicleName: string;
  }) {
    const subject = `Payment Failed — ${opts.referenceNumber}`;
    const html = `
      <h2>Payment Issue</h2>
      <p>Hi ${opts.customerName},</p>
      <p>We were unable to process your payment for booking <strong>${opts.referenceNumber}</strong> (${opts.vehicleName}).</p>
      <p>Please update your payment method within 1 hour to keep your reservation, otherwise it will be released.</p>
      <p>— RentACar Team</p>
    `;
    await this.send(opts.to, subject, html);
  }

  async sendLateReturnAlert(opts: {
    to: string;
    renterName: string;
    vehicleName: string;
    referenceNumber: string;
    endDate: Date;
  }) {
    const subject = `Late Return Alert — ${opts.referenceNumber}`;
    const html = `
      <h2>Late Return Alert</h2>
      <p>Hi ${opts.renterName},</p>
      <p>The customer has not returned <strong>${opts.vehicleName}</strong> (booking: ${opts.referenceNumber}). The scheduled return was <strong>${opts.endDate.toDateString()}</strong>.</p>
      <p>A late penalty charge has been applied automatically. Please contact the customer or reach out to our support team if needed.</p>
      <p>— RentACar Team</p>
    `;
    await this.send(opts.to, subject, html);
  }

  async sendDisputeUpdate(opts: {
    to: string;
    name: string;
    referenceNumber: string;
    status: string;
    resolution?: string | null;
  }) {
    const subject = `Dispute Update — ${opts.referenceNumber}`;
    const html = `
      <h2>Dispute Update</h2>
      <p>Hi ${opts.name},</p>
      <p>Your dispute for booking <strong>${opts.referenceNumber}</strong> has been updated.</p>
      <p><strong>Status:</strong> ${opts.status}</p>
      ${opts.resolution ? `<p><strong>Resolution:</strong> ${opts.resolution}</p>` : ''}
      <p>— RentACar Team</p>
    `;
    await this.send(opts.to, subject, html);
  }

  async sendDriverNoShow(opts: {
    to: string;
    customerName: string;
    vehicleName: string;
    referenceNumber: string;
  }) {
    const subject = `Driver No-Show — Full Refund Issued — ${opts.referenceNumber}`;
    const html = `
      <h2>Driver No-Show — Refund Issued</h2>
      <p>Hi ${opts.customerName},</p>
      <p>We're sorry your driver did not arrive for booking <strong>${opts.referenceNumber}</strong> (${opts.vehicleName}). A <strong>full refund</strong> has been issued automatically. A penalty has been applied to the rental company's profile.</p>
      <p>Please expect your refund within 5–10 business days.</p>
      <p>— RentACar Team</p>
    `;
    await this.send(opts.to, subject, html);
  }
}
