import { ConfigService } from '@nestjs/config';
import {
  MockOtpProvider,
  Msg91OtpProvider,
  TwilioOtpProvider,
  createOtpProvider,
} from './otp.provider';

describe('OtpProvider', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
  });

  it('MockOtpProvider should send without errors', async () => {
    const provider = new MockOtpProvider();
    await expect(provider.send('9876543210', '123456')).resolves.toBeUndefined();
  });

  it('createOtpProvider should return MockOtpProvider by default', () => {
    jest.spyOn(configService, 'get').mockReturnValue('mock');
    const provider = createOtpProvider(configService);
    expect(provider).toBeInstanceOf(MockOtpProvider);
  });

  it('createOtpProvider should return Msg91OtpProvider when OTP_PROVIDER is msg91', () => {
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'OTP_PROVIDER') return 'msg91';
      if (key === 'MSG91_AUTH_KEY') return 'test_key';
      if (key === 'MSG91_TEMPLATE_ID') return 'tmpl_123';
      return undefined;
    });
    const provider = createOtpProvider(configService);
    expect(provider).toBeInstanceOf(Msg91OtpProvider);
  });

  it('createOtpProvider should return TwilioOtpProvider when OTP_PROVIDER is twilio', () => {
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'OTP_PROVIDER') return 'twilio';
      if (key === 'TWILIO_ACCOUNT_SID') return 'AC123';
      if (key === 'TWILIO_AUTH_TOKEN') return 'tok123';
      if (key === 'TWILIO_PHONE_NUMBER') return '+1234567890';
      return undefined;
    });
    const provider = createOtpProvider(configService);
    expect(provider).toBeInstanceOf(TwilioOtpProvider);
  });
});
