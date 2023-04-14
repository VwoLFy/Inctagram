import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BaseNotificationUseCase } from '../../../../main/use-cases/base-notification.use-case';
import { NotificationException } from '../../../../main/validators/result-notification';
import { NotificationCode } from '../../../../configuration/exception.filter';
import { ImageSizeType, ImageType } from '../../domain/image.entity';
import { ProfileAvatarViewModel } from '../../api/view-models/user-images-view.dto';
import { IUsersRepository } from '../../infrastructure/users.repository';
import { ImageEntitiesAndUrls, ImagesEditorService } from '../../../images-editor/images-editor.service';
import { ImagesMapperServiceForView } from '../../../images-editor/images-mapper-for-view.service';

export class UploadImageAvatarCommand {
  constructor(public readonly userId: number, public readonly mimetype: string, public readonly photo: Buffer) {}
}

@CommandHandler(UploadImageAvatarCommand)
export class UploadImageAvatarUseCase
  extends BaseNotificationUseCase<UploadImageAvatarCommand, ProfileAvatarViewModel>
  implements ICommandHandler<UploadImageAvatarCommand>
{
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly imagesEditor: ImagesEditorService,
    private readonly imageMapperService: ImagesMapperServiceForView,
  ) {
    super();
  }

  /**
   * @description Upload image avatar profile for current user
   * @param command
   */
  async executeUseCase(command: UploadImageAvatarCommand): Promise<ProfileAvatarViewModel> {
    const { userId, photo, mimetype } = command;
    //find profile
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotificationException(`User with id: ${userId} not found`, 'user', NotificationCode.NOT_FOUND);
    if (!user.isOwner(userId))
      throw new NotificationException(`Account is not yours`, 'user', NotificationCode.FORBIDDEN);
    if (!user.profile)
      throw new NotificationException(`User with id: ${userId} not has profile`, 'profile', NotificationCode.NOT_FOUND);

    //set type and sizes for images
    const type = ImageType.AVATAR;
    const sizes = [ImageSizeType.MEDIUM, ImageSizeType.THUMBNAIL];

    //generate keys for images and save images on s3 storage and create instances images
    const result: ImageEntitiesAndUrls = await this.imagesEditor.generatorKeysWithSaveImagesAndCreateImages(
      user,
      photo,
      type,
      mimetype,
      sizes,
    );

    //result is array of instances images need to save
    await Promise.all(result.instancesImages.map(image => this.usersRepository.saveImageProfile(image)));

    return this.imageMapperService.imageEntityToViewModel(result.urlImages, result.instancesImages);
  }
}
