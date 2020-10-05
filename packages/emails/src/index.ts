import { render, configure } from 'nunjucks';
import { createTransport, Transporter } from 'nodemailer';
import { SES } from 'aws-sdk';

const FROM_ADDRESS = 'trustees@teessidehackspace.org.uk';

export interface PersonalisedEmail {
  name: string;
}

export class Email {
  private transport: Transporter;

  constructor() {
    configure('./emails');
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
    return this.transport.sendMail({
      to,
      subject,
      from: FROM_ADDRESS,
      html: render(`html/${template}.html`, params),
      text: render(`text/${template}.txt`, params),
    });
  }
}
