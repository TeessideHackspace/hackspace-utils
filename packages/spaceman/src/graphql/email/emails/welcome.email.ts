import { Email, TemplateParams } from '../email.service';

export interface WelcomeParams extends TemplateParams {
  name: string;
}

export class WelcomeEmail implements Email {
  template = 'welcome.mjml';
  subject = 'Welcome to ${siteName}';
  constructor(public params: WelcomeParams) {}
}
