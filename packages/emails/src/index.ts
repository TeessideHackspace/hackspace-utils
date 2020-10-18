import { createTransport, Transporter } from 'nodemailer';
import { SES } from 'aws-sdk';
import { readFile } from 'fs/promises';

const FROM_ADDRESS = 'trustees@teessidehackspace.org.uk';

export interface PersonalisedEmail {
  name: string;
}

export class Email {
  private transport: Transporter;

  constructor() {
    this.transport = createTransport({
      SES: new SES(),
    });
  }

  async welcome(to: string, params: PersonalisedEmail) {
    return this.sendTemplatedMail(
      to,
      'welcome',
      'Welcome to Teesside Hackspace!',
      params,
    );
  }

  async cancelled(to: string, params: PersonalisedEmail) {
    return this.sendTemplatedMail(
      to,
      'cancelled',
      'Your membership to Teesside Hackspace has been cancelled',
      params,
    );
  }

  private async sendTemplatedMail(
    to: string,
    template: string,
    subject: string,
    params: any,
  ) {
    const htmlTemplate = await readFile(
      `${__dirname}/emails/html/${template}.html`,
      'utf8',
    );
    const textTemplate = await readFile(
      `${__dirname}/emails/text/${template}.txt`,
      'utf8',
    );
    return this.transport.sendMail({
      to,
      subject,
      from: FROM_ADDRESS,
      html: htmlTemplate.replace(/\${(.*?)}/g, (_, g) => params[g]),
      text: textTemplate.replace(/\${(.*?)}/g, (_, g) => params[g]),
    });
  }
}
