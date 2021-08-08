import { createTransport, Transporter } from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { SesConnectionService } from '../admin/sesConnection/sesConnection.service';
import { SES } from 'aws-sdk';
import mjml2html from 'mjml';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { Email, TemplateParams } from './templateParams';
import { GlobalSettingsService } from '../admin/globalSettings/globalSettings.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly sesConnection: SesConnectionService,
    private readonly globalSettings: GlobalSettingsService,
  ) {}

  async getClient(): Promise<Transporter> {
    const ses = await this.sesConnection.getConnection();
    if (!ses) {
      throw new Error('SES Must be configured before sending emails');
    }
    return createTransport({
      SES: new SES({
        region: ses!.awsRegion,
        credentials: {
          accessKeyId: ses!.awsAccessKeyId,
          secretAccessKey: ses!.awsSecretAccessKey,
        },
      }),
    });
  }

  async getGlobalSettings() {
    const globalSettings = await this.globalSettings.getGlobalSettings();
    if (!globalSettings) {
      throw new Error(
        'Global Settings Must be configured before sending emails',
      );
    }
    return globalSettings;
  }

  private templatePath() {
    return process.env.EMAIL_TEMPLATE_PATH || join(__dirname, './templates');
  }

  async loadTemplate(templateName: string) {
    const path = join(this.templatePath(), templateName);
    const template = await readFile(path, 'utf-8');

    try {
      const output = mjml2html(template, {
        filePath: path,
      });
      if (!output.errors.length) {
        return output.html;
      }
    } catch (e) {}
    throw new Error(`Error processing template: ${templateName}`);
  }

  async processTemplate(template: string, params: TemplateParams) {
    const globalSettings: any = await this.getGlobalSettings();
    return template.replace(
      /\${(.*?)}/g,
      (t, g: string) => params[g] || globalSettings[g] || t,
    );
  }

  async processEmail(email: Email) {
    const template = await this.loadTemplate(email.template);
    return this.processTemplate(template, email.params);
  }

  async sendEmail(email: Email) {
    const globalSettings = await this.getGlobalSettings();
    const body = await this.processEmail(email);
    const subject = await this.processTemplate(email.subject, email.params);
    const transport = await this.getClient();
    return transport
      .sendMail({
        to: email.params.recipient,
        subject,
        from: globalSettings.adminEmail,
        html: body,
      })
      .catch((_e) => {
        throw new Error(`Error sending email`);
      });
  }
}
