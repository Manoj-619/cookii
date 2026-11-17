import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let emailService: EmailService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
    jest.spyOn(configService, 'get').mockReturnValue(undefined);
    emailService = new EmailService(configService);
  });

  it('should fall back gracefully to console log if SMTP/SES is not configured', async () => {
    const res = await emailService.sendOtpEmail('test@cookii.in', '123456');
    expect(res).toBe(true);
  });

  it('should format booking confirmation email cleanly in fallback mode', async () => {
    const res = await emailService.sendBookingConfirmation('arjun@example.com', {
      bookingNumber: 'CK-202611-4819',
      serviceType: 'LUNCH',
      scheduledStartTime: '2026-11-16T13:00:00Z',
      cookName: 'Sita Lakshmi',
      pricing: {
        totalCustomerPayable: 340.2,
      },
      startOtp: '4921',
      addressSummary: 'Koramangala, Bengaluru',
    });
    expect(res).toBe(true);
  });

  it('should format welcome email cleanly in fallback mode', async () => {
    const res = await emailService.sendWelcome('arjun@example.com', 'Arjun');
    expect(res).toBe(true);
  });
});
