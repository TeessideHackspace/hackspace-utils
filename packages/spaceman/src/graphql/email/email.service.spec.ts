import { Test } from '@nestjs/testing';
import { EmailService } from './email.service';
import { join } from 'path';
import nock from 'nock';

const mockConnection = {
  awsRegion: 'eu-west-1',
  awsAccessKeyId: 'foo-key',
  awsSecretAccessKey: 'foo-secret',
};

const mockGlobalSettings = {
  siteName: 'my site',
  adminEmail: 'admin@example.com',
};
const mockSesConnectionService = new (class {
  public getConnection = jest.fn(() => mockConnection);
})();
const mockGlobalSettingsService = new (class {
  public getGlobalSettings = jest.fn(() => mockGlobalSettings);
})();

describe('Email', () => {
  let emailService: EmailService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        { provide: 'EmailService', useClass: EmailService },
        {
          provide: 'SesConnectionService',
          useValue: mockSesConnectionService,
        },
        {
          provide: 'GlobalSettingsService',
          useValue: mockGlobalSettingsService,
        },
      ],
    }).compile();
    emailService = moduleRef.get<EmailService>(EmailService);
  });

  afterEach(() => {
    delete process.env.EMAIL_TEMPLATE_PATH;
  });

  describe('Load Template', () => {
    it('should process a bundled template', async () => {
      const html = await emailService.loadTemplate('welcome.mjml');
      expect(html).not.toHaveLength(0);
    });

    it('should throw an error if the template was not found', async () => {
      await expect(async () =>
        emailService.loadTemplate('foo.mjml'),
      ).rejects.toThrowError();
    });

    it('should process a valid template from a specified directory', async () => {
      process.env.EMAIL_TEMPLATE_PATH = join(
        __dirname,
        '../../../test/fixtures/email-templates/',
      );
      const html = await emailService.loadTemplate('valid.mjml');
      expect(html).not.toHaveLength(0);
    });

    it('should throw an error on an invalid template', async () => {
      process.env.EMAIL_TEMPLATE_PATH = join(
        __dirname,
        '../../../test/fixtures/email-templates/',
      );
      await expect(async () =>
        emailService.loadTemplate('invalid.mjml'),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Error processing template: invalid.mjml"`,
      );
    });
  });

  describe('Process Email', () => {
    it('should substitute variables in a found template', async () => {
      process.env.EMAIL_TEMPLATE_PATH = join(
        __dirname,
        '../../../test/fixtures/email-templates/',
      );
      const html = await emailService.processEmail(
        new (class {
          template = 'templated.mjml';
          subject = 'Foo';
          params = {
            recipient: 'user@example.com',
            name: 'Bar',
          };
        })(),
      );
      expect(html).toContain('>Bar<');
    });

    it('should retain template tokens when values were not found', async () => {
      process.env.EMAIL_TEMPLATE_PATH = join(
        __dirname,
        '../../../test/fixtures/email-templates/',
      );
      const html = await emailService.processEmail(
        new (class {
          template = 'templated.mjml';
          subject = 'Foo';
          params = {
            recipient: 'user@example.com',
          };
        })(),
      );
      expect(html).toContain('>${name}<');
    });

    it('should substitute values from the global settings', async () => {
      process.env.EMAIL_TEMPLATE_PATH = join(
        __dirname,
        '../../../test/fixtures/email-templates/',
      );
      const html = await emailService.processEmail(
        new (class {
          template = 'template-global.mjml';
          subject = 'Foo';
          params = {
            recipient: 'user@example.com',
          };
        })(),
      );
      expect(html).toContain('>my site<');
    });

    it('should override values from the global settings', async () => {
      process.env.EMAIL_TEMPLATE_PATH = join(
        __dirname,
        '../../../test/fixtures/email-templates/',
      );
      const html = await emailService.processEmail(
        new (class {
          template = 'template-global.mjml';
          subject = 'Foo';
          params = {
            recipient: 'user@example.com',
            siteName: 'foo site',
          };
        })(),
      );
      expect(html).toContain('>foo site<');
    });
  });

  describe('Send Email', () => {
    it('should make a call to SES', async () => {
      process.env.EMAIL_TEMPLATE_PATH = join(
        __dirname,
        '../../../test/fixtures/email-templates/',
      );
      let receivedBody: any = {};
      nock('https://email.eu-west-1.amazonaws.com/')
        .post('/', (body) => {
          receivedBody = body;
          return body;
        })
        .reply(200);
      await emailService.sendEmail(
        new (class {
          template = 'templated.mjml';
          subject = 'Foo';
          params = {
            recipient: 'user@example.com',
          };
        })(),
      );
      expect(receivedBody.Action).toBe('SendRawEmail');
      expect(receivedBody['Destinations.member.1']).toBe('user@example.com');
      expect(receivedBody['Source']).toBe('admin@example.com');
      expect(receivedBody['Version']).toBe('2010-12-01');
    });

    it('should throw an exception if the call to SES fails', async () => {
      process.env.EMAIL_TEMPLATE_PATH = join(
        __dirname,
        '../../../test/fixtures/email-templates/',
      );
      nock('https://email.eu-west-1.amazonaws.com/').post('/').reply(400);
      await expect(async () => {
        await emailService.sendEmail(
          new (class {
            template = 'templated.mjml';
            subject = 'Foo';
            params = {
              recipient: 'user@example.com',
            };
          })(),
        );
      }).rejects.toThrowErrorMatchingInlineSnapshot('"Error sending email"');
    });
  });
});
