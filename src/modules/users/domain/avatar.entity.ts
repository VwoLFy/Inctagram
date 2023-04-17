import { BaseImageEntity } from '../../images/domain/base-image.entity';

export class AvatarEntity extends BaseImageEntity {
  profileId: number;
  constructor() {
    super();
  }

  static initCreate(userId: number, baseImage: BaseImageEntity): AvatarEntity {
    const avatar = new AvatarEntity();
    avatar.profileId = userId;
    avatar.imageType = baseImage.imageType;
    avatar.sizeType = baseImage.sizeType;
    avatar.url = baseImage.url;
    avatar.width = baseImage.width;
    avatar.height = baseImage.height;
    avatar.fileSize = baseImage.fileSize;
    avatar.fieldId = baseImage.fieldId;
    return avatar;
  }
}
