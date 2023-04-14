import { ImageEntity } from './image.entity';
import { BaseDateEntity } from './base-date.entity';
import { UpdateProfileInputDto } from '../api/inpu-dto/update-profile.input.dto';
import { Type } from 'class-transformer';

export class ProfileEntity extends BaseDateEntity {
  userId: number;
  firstName: string;
  lastName: string;
  city: string;
  dateOfBirth: Date;
  aboutMe: string;
  @Type(() => ImageEntity)
  images: ImageEntity[];

  constructor() {
    super();
  }

  static initCreate(userId: number) {
    const instance = new ProfileEntity();
    instance.userId = userId;
    instance.images = [];
    return instance;
  }

  private setValues(dto: UpdateProfileInputDto) {
    if (dto.firstName) this.firstName = dto.firstName;
    if (dto.lastName) this.lastName = dto.lastName;
    if (dto.city) this.city = dto.city;
    if (dto.dateOfBirth) this.dateOfBirth = dto.dateOfBirth;
    if (dto.aboutMe) this.aboutMe = dto.aboutMe;
  }

  public update(dto: UpdateProfileInputDto) {
    this.setValues(dto);
  }
}
