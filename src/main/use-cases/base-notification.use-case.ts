import { ResultNotification } from '../validators/result-notification';
import { Logger } from '@nestjs/common';
import { NotificationErrors } from '../validators/checker-notification.errors';

export abstract class BaseNotificationUseCase<TCommand, TResult> {
  private readonly logger = new Logger(BaseNotificationUseCase.name);
  /**
   *
   * @param command
   */
  async execute(command: TCommand): Promise<ResultNotification<TResult>> {
    //prepare a notification for result
    const notification = new ResultNotification<TResult>();
    try {
      const result = await this.executeUseCase(command);
      if (result) notification.addData(result);
    } catch (e) {
      notification.addErrorFromNotificationException(e);
      // console.log('BaseNotificationUseCase: ', e);
      this.logger.log('BaseNotificationUseCase:', +JSON.stringify(command));
      this.logger.error(JSON.stringify(e));
    }

    if (notification.hasError()) throw new NotificationErrors(notification);

    return notification;
  }

  abstract executeUseCase(command: TCommand): Promise<TResult>;
}
