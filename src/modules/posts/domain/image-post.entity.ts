import { BaseImageEntity } from '../../images/domain/base-image.entity';

export class ImagePostEntity extends BaseImageEntity {
  postId: number;
  constructor() {
    super();
  }
}
