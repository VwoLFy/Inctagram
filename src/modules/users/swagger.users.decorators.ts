import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { ApiErrorResultDto } from '../../main/validators/api-error-result.dto';
import { HTTP_Status } from '../../main/enums/http-status.enum';
import { ProfileViewDto } from './api/view-models/profile-view.dto';
import { UserImagesViewModel } from './api/view-models/user-images-view.dto';

export function SwaggerDecoratorsByUploadPhotoAvatar(): MethodDecorator {
  return applyDecorators(
    ApiTags('upload images'),
    ApiOperation({
      summary:
        'Upload providers square image for Avatar profile (.png or jpg (jpeg) file (max size is 160KB, width must be 192, height must be 192))',
    }),
    ApiResponse({
      status: HTTP_Status.CREATED_201,
      description: 'Uploaded image information object',
      type: UserImagesViewModel,
    }),
    ApiResponse({
      status: HTTP_Status.BAD_REQUEST_400,
      description: 'The inputModel has incorrect values',
      type: ApiErrorResultDto,
    }),
    ApiResponse({ status: HTTP_Status.UNAUTHORIZED_401, description: 'Unauthorized' }),
    ApiResponse({
      status: HTTP_Status.FORBIDDEN_403,
      description: 'You are not the owner this account',
    }),
  );
}

export function SwaggerDecoratorsByCreateProfile(): MethodDecorator {
  return applyDecorators(
    ApiTags('profile'),
    ApiOperation({ summary: 'Create profile for user' }),
    ApiResponse({
      status: HTTP_Status.CREATED_201,
      description: 'Created profile information object',
      type: ProfileViewDto,
    }),
    ApiResponse({
      status: HTTP_Status.BAD_REQUEST_400,
      description: 'The inputModel has incorrect values',
      type: ApiErrorResultDto,
    }),
    ApiResponse({ status: HTTP_Status.UNAUTHORIZED_401, description: 'Unauthorized' }),
    ApiResponse({
      status: HTTP_Status.NOT_FOUND_404,
      description: 'User not found',
    }),
  );
}
export function SwaggerDecoratorsByUpdateProfile(): MethodDecorator {
  return applyDecorators(
    ApiTags('profile'),
    ApiOperation({ summary: 'Update profile for user' }),
    ApiResponse({
      status: HTTP_Status.NO_CONTENT_204,
      description: 'Updated profile information object',
    }),
    ApiResponse({
      status: HTTP_Status.BAD_REQUEST_400,
      description: 'The inputModel has incorrect values',
      type: ApiErrorResultDto,
    }),
    ApiResponse({ status: HTTP_Status.UNAUTHORIZED_401, description: 'Unauthorized' }),
    ApiResponse({
      status: HTTP_Status.NOT_FOUND_404,
      description: 'User not found',
    }),
  );
}

export function SwaggerDecoratorsByFormData(): MethodDecorator {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            // 👈 this property
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
  );
}