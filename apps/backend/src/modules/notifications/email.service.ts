import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface BookingEmailData {
  id?: string;
  bookingNumber?: string;
  serviceType?: string;
  scheduledStartTime?: string | Date;
  personCount?: number;
  cuisinesSelected?: string[];
  startOtp?: string;
  addressSummary?: string;
  cookName?: string;
  pricing?: {
    basePrice?: number;
    platformFee?: number;
    gstAmount?: number;
    discountAmount?: number;
    totalCustomerPayable?: number;
  };
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly fromEmail: string;
  private readonly isConfigured: boolean = false;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    this.fromEmail =
      this.configService.get<string>('SMTP_FROM') ||
      this.configService.get<string>('AWS_SES_FROM_EMAIL') ||
      'ZapEat <no-reply@ZapEat.in>';

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port: Number(port),
          secure: Number(port) === 465,
          auth: {
            user,
            pass,
          },
        });
        this.isConfigured = true;
        this.logger.log(`✓ EmailService initialized with SMTP host: ${host}:${port}`);
      } catch (err: any) {
        this.logger.warn(`Failed to initialize SMTP transporter: ${err.message}. Using console fallback.`);
        this.isConfigured = false;
      }
    } else {
      this.logger.log(
        'ℹ SMTP not fully configured (SMTP_HOST/USER/PASS missing). EmailService running in console.log fallback mode.'
      );
    }
  }

  /**
   * Internal helper to dispatch or fallback
   */
  private async dispatchEmail(to: string, subject: string, html: string, textFallback?: string): Promise<boolean> {
    if (this.isConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.fromEmail,
          to,
          subject,
          html,
          text: textFallback || subject,
        });
        this.logger.log(`✓ Dispatched email to ${to} [Subject: "${subject}"]`);
        return true;
      } catch (err: any) {
        this.logger.error(`Failed to send email to ${to} via SMTP: ${err.message}`);
        this.logFallback(to, subject, textFallback || subject);
        return false;
      }
    }

    this.logFallback(to, subject, textFallback || subject);
    return true;
  }

  private logFallback(to: string, subject: string, previewText: string) {
    this.logger.log(
      `\n==================== [EMAIL FALLBACK] ====================\n` +
      `To: ${to}\n` +
      `From: ${this.fromEmail}\n` +
      `Subject: ${subject}\n` +
      `Content Preview:\n${previewText}\n` +
      `==========================================================`
    );
  }

  /**
   * Send 6-digit OTP verification code via email
   */
  async sendOtpEmail(to: string, otp: string): Promise<boolean> {
    const subject = `Your ZapEat Verification Code: ${otp}`;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F6FAF7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F6FAF7; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 22px; padding: 40px 32px; box-shadow: 0 4px 20px rgba(5, 150, 105, 0.08); text-align: center;">
          <tr>
            <td align="center">
              <div style="display: inline-block; background-color: #ECFDF5; border-radius: 16px; padding: 12px 20px; margin-bottom: 24px;">
                <span style="font-size: 26px; font-weight: 800; color: #059669; letter-spacing: -0.5px;">ZapEat</span>
              </div>
              <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">Verify Your Email</h1>
              <p style="font-size: 15px; color: #4B5563; line-height: 1.5; margin: 0 0 28px 0;">
                Please use the single-use verification code below to sign in or verify your ZapEat account.
              </p>
              
              <div style="background-color: #F6FAF7; border: 2px dashed #10B981; border-radius: 18px; padding: 20px; margin-bottom: 24px;">
                <span style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #059669; font-family: 'Courier New', Courier, monospace;">
                  ${otp}
                </span>
              </div>

              <p style="font-size: 13px; color: #6B7280; line-height: 1.4; margin: 0 0 28px 0;">
                ⏱ This code is valid for <strong>5 minutes</strong>. For your security, do not share this passcode with anyone, including ZapEat representatives.
              </p>

              <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 28px 0;" />

              <p style="font-size: 12px; color: #9CA3AF; line-height: 1.5; margin: 0;">
                ZapEat Technologies Pvt. Ltd.<br/>
                Bengaluru, Karnataka, India • <a href="https://ZapEat.in" style="color: #059669; text-decoration: none;">ZapEat.in</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.dispatchEmail(
      to,
      subject,
      html,
      `Your ZapEat verification code is: ${otp}. It expires in 5 minutes.`
    );
  }

  /**
   * Send booking confirmation with full details and start OTP
   */
  async sendBookingConfirmation(to: string, booking: BookingEmailData): Promise<boolean> {
    const bookingNum = booking.bookingNumber || booking.id || 'CK-BOOKING';
    const subject = `Booking Confirmed #${bookingNum} - ZapEat`;
    const formattedDate = booking.scheduledStartTime
      ? new Date(booking.scheduledStartTime).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : 'As Scheduled';

    const cuisines = booking.cuisinesSelected?.join(', ') || 'Custom Home Style';
    const totalAmount = booking.pricing?.totalCustomerPayable
      ? `₹${booking.pricing.totalCustomerPayable.toFixed(2)}`
      : '₹290.20';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F6FAF7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F6FAF7; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 22px; padding: 40px 32px; box-shadow: 0 4px 20px rgba(5, 150, 105, 0.08);">
          <tr>
            <td>
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background-color: #ECFDF5; border-radius: 16px; padding: 10px 20px;">
                  <span style="font-size: 26px; font-weight: 800; color: #059669;">ZapEat</span>
                </div>
                <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 16px 0 6px 0;">Booking Confirmed!</h1>
                <p style="font-size: 14px; color: #059669; font-weight: 600; margin: 0;">Order #${bookingNum}</p>
              </div>

              ${
                booking.startOtp
                  ? `
              <div style="background-color: #ECFDF5; border: 1.5px solid #A7F3D0; border-radius: 18px; padding: 18px; margin-bottom: 28px; text-align: center;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #047857;">Doorstep Start Passcode</div>
                <div style="font-size: 32px; font-weight: 800; color: #065F46; letter-spacing: 6px; font-family: 'Courier New', monospace; margin: 6px 0;">${booking.startOtp}</div>
                <div style="font-size: 12px; color: #047857;">Share this with your cook upon arrival to commence cooking.</div>
              </div>`
                  : ''
              }

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Service Type:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #111827; text-align: right;">${booking.serviceType || 'Home Cooking Session'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Scheduled Slot:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #111827; text-align: right;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6B7280;">People Count:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #111827; text-align: right;">${booking.personCount || 2} Persons</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Cuisines:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #111827; text-align: right;">${cuisines}</td>
                </tr>
                ${
                  booking.cookName
                    ? `
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Assigned Cook:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #059669; text-align: right;">${booking.cookName}</td>
                </tr>`
                    : ''
                }
                <tr>
                  <td colspan="2" style="padding-top: 12px; border-top: 1px dashed #E5E7EB;">
                    <table width="100%">
                      <tr>
                        <td style="font-size: 15px; font-weight: 700; color: #111827;">Total Paid:</td>
                        <td style="font-size: 18px; font-weight: 800; color: #059669; text-align: right;">${totalAmount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="background-color: #F6FAF7; border-radius: 14px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #065F46; line-height: 1.5;">
                  🌿 <strong>Pure hygiene assurance:</strong> Our verified cooks undergo food safety training, health checks, and police verification. Please ensure basic pantry ingredients and utensils are clean and ready.
                </p>
              </div>

              <div style="text-align: center; margin-top: 28px;">
                <a href="https://ZapEat.in/bookings/${booking.id || ''}" style="background-color: #059669; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; font-weight: 600; display: inline-block;">
                  Track Live Booking
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0 20px 0;" />

              <p style="font-size: 12px; color: #9CA3AF; text-align: center; line-height: 1.5; margin: 0;">
                ZapEat Technologies Pvt. Ltd. • Bengaluru, Karnataka<br/>
                Need help? Contact support at <a href="mailto:support@ZapEat.in" style="color: #059669;">support@ZapEat.in</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.dispatchEmail(
      to,
      subject,
      html,
      `Your ZapEat booking #${bookingNum} is confirmed for ${formattedDate}. Start Passcode: ${booking.startOtp || 'N/A'}. Total: ${totalAmount}.`
    );
  }

  /**
   * Send welcome email to newly onboarded diners or cooks
   */
  async sendWelcome(to: string, name: string): Promise<boolean> {
    const subject = `Welcome to ZapEat, ${name}! Fresh Home Food Awaits 🍲`;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F6FAF7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F6FAF7; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 22px; padding: 40px 32px; box-shadow: 0 4px 20px rgba(5, 150, 105, 0.08); text-align: left;">
          <tr>
            <td>
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background-color: #ECFDF5; border-radius: 16px; padding: 12px 24px;">
                  <span style="font-size: 26px; font-weight: 800; color: #059669;">ZapEat</span>
                </div>
              </div>

              <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">
                Namaskara, ${name}! Welcome to ZapEat.
              </h1>
              <p style="font-size: 15px; color: #4B5563; line-height: 1.6; margin: 0 0 24px 0;">
                Say goodbye to unhealthy restaurant deliveries and hectic kitchen chores. With ZapEat, verified home cooks prepare hot, nutritious, customized meals right in your Bengaluru kitchen.
              </p>

              <div style="background-color: #F6FAF7; border-radius: 18px; padding: 24px; margin-bottom: 28px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #065F46; margin: 0 0 16px 0;">How ZapEat Works:</h3>
                
                <div style="margin-bottom: 14px;">
                  <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; background-color: #059669; color: #fff; border-radius: 50%; font-size: 12px; font-weight: 700; margin-right: 8px;">1</span>
                  <span style="font-size: 14px; font-weight: 600; color: #111827;">Pick your meal & cuisine:</span>
                  <span style="font-size: 14px; color: #6B7280; display: block; margin-left: 32px;">South Indian, North Indian, Jain, Continental & more.</span>
                </div>

                <div style="margin-bottom: 14px;">
                  <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; background-color: #059669; color: #fff; border-radius: 50%; font-size: 12px; font-weight: 700; margin-right: 8px;">2</span>
                  <span style="font-size: 14px; font-weight: 600; color: #111827;">A verified cook arrives:</span>
                  <span style="font-size: 14px; color: #6B7280; display: block; margin-left: 32px;">Background-checked, hygiene-certified neighbourhood home cooks.</span>
                </div>

                <div>
                  <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; background-color: #059669; color: #fff; border-radius: 50%; font-size: 12px; font-weight: 700; margin-right: 8px;">3</span>
                  <span style="font-size: 14px; font-weight: 600; color: #111827;">Savor fresh home cooking:</span>
                  <span style="font-size: 14px; color: #6B7280; display: block; margin-left: 32px;">Hot, fresh, aromatic meals cooked to your exact taste.</span>
                </div>
              </div>

              <div style="text-align: center; margin-bottom: 24px;">
                <a href="https://ZapEat.in" style="background-color: #059669; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; display: inline-block;">
                  Book Your First Cook
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0 20px 0;" />

              <p style="font-size: 12px; color: #9CA3AF; text-align: center; line-height: 1.5; margin: 0;">
                ZapEat Technologies Pvt. Ltd. • Bengaluru, Karnataka<br/>
                Questions? Reply directly to this email or reach us at <a href="mailto:support@ZapEat.in" style="color: #059669;">support@ZapEat.in</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.dispatchEmail(
      to,
      subject,
      html,
      `Namaskara ${name}! Welcome to ZapEat. Fresh, healthy home cooking on demand in Bengaluru.`
    );
  }
}
