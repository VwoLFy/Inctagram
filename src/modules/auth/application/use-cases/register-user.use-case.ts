import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailManager } from '../../../../providers/mailer/application/mail-manager.service';
import { RegisterInputDto } from '../../api/input-dto/register.input.dto';
import { User } from '../../../users/domain/user.entity';
import { AuthService } from '../auth.service';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BaseNotificationUseCase } from '../../../../main/use-cases/base-notification.use-case';
import { NotificationException } from '../../../../main/validators/result-notification';
import { NotificationCode } from '../../../../configuration/exception.filter';

/**
 * @description create new user and send email for confirmation
 */
export class RegisterUserCommand {
  constructor(public readonly userInputModel: RegisterInputDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  extends BaseNotificationUseCase<RegisterUserCommand, void>
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
    private readonly mailService: MailManager,
  ) {
    super();
  }

  /**
   * @description create new user and send email for confirmation
   * @param command
   */

  async executeUseCase(command: RegisterUserCommand) {
    //prepare a notification for result
    const { userName, email, password } = command.userInputModel;

    const foundUser = await this.usersRepository.findUserByNameOrEmail(userName, email);

    if (foundUser) {
      const field = foundUser.userName.toLowerCase() === userName.toLowerCase() ? 'name' : 'email';
      throw new NotificationException(`User with this ${field} is already exist`, field, NotificationCode.BAD_REQUEST);
    }
    //generate password hash
    const passwordHash = await this.authService.getPasswordHash(password);
    //create user
    const user = new User(userName, email, passwordHash);

    await this.usersRepository.saveUser(user); //save user
    await this.mailService.sendUserConfirmation(email, user.emailConfirmation.confirmationCode);
  }
}