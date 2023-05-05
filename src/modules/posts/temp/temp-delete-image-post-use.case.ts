import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BaseNotificationUseCase } from '../../../main/use-cases/base-notification.use-case';
import { IPostsRepository } from '../infrastructure/posts.repository';
import { NotificationException } from '../../../main/validators/result-notification';
import { NotificationCode } from '../../../configuration/exception.filter';
import { PostsService } from '../application/posts.service';

/**
 * Delete image command
 */
export class TempDeleteImagePostCommand {
  constructor(public readonly userId: number, public readonly postId: number, public readonly uploadId: string) {}
}

@CommandHandler(TempDeleteImagePostCommand)
export class TempDeleteImagePostUseCase
  extends BaseNotificationUseCase<TempDeleteImagePostCommand, void>
  implements ICommandHandler<TempDeleteImagePostCommand>
{
  constructor(private readonly postsRepository: IPostsRepository, private readonly postsService: PostsService) {
    super();
  }

  /**
   * @description Checking the user's existence and deleting the image
   * @param command
   */
  async executeUseCase(command: TempDeleteImagePostCommand): Promise<void> {
    const { userId, postId, uploadId } = command;
    //find post and check owner
    const post = await this.postsService.findPostAndCheckUserForOwner(userId, postId);
    //check owner and last image with huge size
    if (post.hasLastImage())
      throw new NotificationException(
        `Post with id: ${post.id} must have at least one image`,
        'post',
        NotificationCode.BAD_REQUEST,
      );
    //change status to deleted for image
    post.changeStatusToDeletedForImage(uploadId);
    //update post
    await this.postsRepository.savePost(post);
  }
}
