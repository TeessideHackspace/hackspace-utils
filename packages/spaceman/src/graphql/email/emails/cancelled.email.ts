import { Email, TemplateParams } from '../email.service';

export interface CancelledParams extends TemplateParams {
  name: string;
}

export class CancelledEmail implements Email {
  template = 'cancelled.mjml';
  subject = 'Your membership to ${siteName} has been cancelled';
  constructor(public params: CancelledParams) {}
}
