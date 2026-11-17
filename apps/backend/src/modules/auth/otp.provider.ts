import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const OTP_PROVIDER = 'OTP_PROVIDER';

/**
 * Interface for pluggable SMS OTP delivery providers
 */
export interface OtpProvider {
  send(phone: string, otp: string): Promise<void>;
}

/**
 * Development & testing Mock OTP provider
 */
@Injectable()
export class MockOtpProvider implements OtpProvider {
  private readonly logger = new Logger(MockOtpProvider.name);

  async send(phone: string, otp: string): Promise<void> {
    this.logger.log(`\n[MockOtpProvider] >>> SMS to ${phone} | Passcode: ${otp} <<<`);
  }
}

/**
 * Production MSG91 SMS OTP provider
 * Calls MSG91 v5 OTP API: https://api.msg91.com/api/v5/otp
 */
@Injectable()
export class Msg91OtpProvider implements OtpProvider {
  private readonly logger = new Logger(Msg91OtpProvider.name);
  private readonly authKey?: string;
  private readonly templateId?: string;
  private readonly sender?: string;

  constructor(private readonly configService: ConfigService) {
    this.authKey = this.configService.get<string>('MSG91_AUTH_KEY');
    this.templateId = this.configService.get<string>('MSG91_TEMPLATE_ID');
    this.sender = this.configService.get<string>('MSG91_SENDER', 'ZapEat');

    if (!this.authKey || !this.templateId) {
      this.logger.warn(
        'MSG91_AUTH_KEY or MSG91_TEMPLATE_ID missing. Msg91OtpProvider will run with console fallback.'
      );
    }
  }

  async send(phone: string, otp: string): Promise<void> {
    // Normalise phone: remove leading +, ensure Indian country code 91
    let digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      digits = `91${digits}`;
    }

    if (!this.authKey || !this.templateId) {
      this.logger.log(`[MSG91 Fallback] SMS to +${digits} | OTP: ${otp}`);
      return;
    }

    const url = new URL('https://api.msg91.com/api/v5/otp');
    url.searchParams.append('template_id', this.templateId);
    url.searchParams.append('mobile', digits);
    url.searchParams.append('authkey', this.authKey);
    url.searchParams.append('otp', otp);
    if (this.sender) {
      url.searchParams.append('sender', this.sender);
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authkey: this.authKey,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || (data as any)?.type === 'error') {
        const errorMsg = (data as any)?.message || response.statusText;
        this.logger.error(`MSG91 API error sending OTP to ${digits}: ${errorMsg}`);
        throw new Error(`MSG91 error: ${errorMsg}`);
      }

      this.logger.log(`✓ MSG91 OTP successfully dispatched to +${digits}`);
    } catch (err: any) {
      this.logger.error(`Msg91OtpProvider network error: ${err.message}`);
      // Fallback log to not block authentication during intermittent connectivity
      this.logger.log(`[MSG91 Network Fallback] SMS to +${digits} | OTP: ${otp}`);
    }
  }
}

/**
 * Twilio SMS OTP provider
 * Calls Twilio REST API
 */
@Injectable()
export class TwilioOtpProvider implements OtpProvider {
  private readonly logger = new Logger(TwilioOtpProvider.name);
  private readonly accountSid?: string;
  private readonly authToken?: string;
  private readonly fromPhone?: string;

  constructor(private readonly configService: ConfigService) {
    this.accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    this.authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromPhone =
      this.configService.get<string>('TWILIO_PHONE_NUMBER') ||
      this.configService.get<string>('TWILIO_FROM');

    if (!this.accountSid || !this.authToken || !this.fromPhone) {
      this.logger.warn(
        'Twilio credentials incomplete (TWILIO_ACCOUNT_SID/AUTH_TOKEN/PHONE_NUMBER missing). TwilioOtpProvider will run with console fallback.'
      );
    }
  }

  async send(phone: string, otp: string): Promise<void> {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;

    if (!this.accountSid || !this.authToken || !this.fromPhone) {
      this.logger.log(`[Twilio Fallback] SMS to ${formattedPhone} | OTP: ${otp}`);
      return;
    }

    const messageBody = `Your ZapEat verification code is ${otp}. Valid for 5 minutes. Please do not share this passcode.`;
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    const authHeader = `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`;

    const params = new URLSearchParams();
    params.append('To', formattedPhone);
    params.append('From', this.fromPhone);
    params.append('Body', messageBody);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = (errorData as any)?.message || response.statusText;
        this.logger.error(`Twilio API failure to ${formattedPhone}: ${message}`);
        throw new Error(`Twilio error: ${message}`);
      }

      this.logger.log(`✓ Twilio SMS OTP successfully dispatched to ${formattedPhone}`);
    } catch (err: any) {
      this.logger.error(`TwilioOtpProvider network error: ${err.message}`);
      this.logger.log(`[Twilio Network Fallback] SMS to ${formattedPhone} | OTP: ${otp}`);
    }
  }
}

/**
 * Factory creating the active OTP provider based on OTP_PROVIDER env variable
 */
export function createOtpProvider(configService: ConfigService): OtpProvider {
  const providerType = configService.get<string>('OTP_PROVIDER', 'mock').toLowerCase().trim();

  switch (providerType) {
    case 'msg91':
      return new Msg91OtpProvider(configService);
    case 'twilio':
      return new TwilioOtpProvider(configService);
    case 'mock':
    default:
      return new MockOtpProvider();
  }
}
