import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}
  sendWelcomeEmail(loginUrl: string, email: string, password: string) {
    this.logger.debug(`Sending welcome email to ${email}`);
    this.mailerService
      .sendMail({
        to: email,
        subject: 'Account Information Notification',
        template: `./welcome.hbs`,
        context: {
          loginUrl,
          email,
          password,
        },
      })
      .then(() => {
        return true;
      })
      .catch((e) => {
        this.logger.error(e.message, e.stack, MailService.name);
      });
  }
}
