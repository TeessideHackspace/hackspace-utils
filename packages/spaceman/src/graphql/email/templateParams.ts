export interface TemplateParams {
  recipient: string;
  [index: string]: string;
}

export interface WelcomeParams extends TemplateParams {
  name: string;
}

export interface GlobalParams {
  siteName: string;
}

export interface Email {
  template: string;
  subject: string;
  params: TemplateParams;
}
export class WelcomeEmail implements Email {
  template = 'welcome.mjml';
  subject = 'Welcome to ${name}';
  constructor(public params: WelcomeParams) {}
}
