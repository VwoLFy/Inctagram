import { BadRequestException, PipeTransform } from '@nestjs/common';
import { BaseParametersImageValidation } from './image-validation.type';

/**
 * @description This pipe is used to validate array images, check the type of each image
 */
export class ValidationArrayImagePipe<T extends BaseParametersImageValidation>
  implements PipeTransform<Express.Multer.File[], Promise<Express.Multer.File[]>>
{
  constructor(private readonly options: T) {}
  async transform(images: Express.Multer.File[]): Promise<Express.Multer.File[]> {
    const { contentTypes } = this.options;
    // checking types of all files in the array
    for (const file of images) {
      const inputMimeType = file.mimetype.split(' ');
      if (!contentTypes.includes(inputMimeType[0])) {
        throw new BadRequestException([
          { message: `The file format is incorrect, please upload the correct file`, field: 'file' },
        ]);
      }
    }
    return images;
  }
}
