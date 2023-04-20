import { PrismaService } from '../../../providers/prisma/prisma.service';
import { PostImageViewModel } from '../api/view-models/post-image-view.dto';
import { PostEntity, PostStatus } from '../domain/post.entity';
import { plainToInstance } from 'class-transformer';
import { PostViewModel } from '../api/view-models/post-view.dto';
import { Injectable } from '@nestjs/common';
import { UploadedImageViewModel } from '../api/view-models/uploaded-image-view.dto';
import { PaginationViewModel } from '../../../main/shared/pagination-view.dto';
import { PaginationPostsInputDto } from '../api/input-dto/pagination-posts.input.dto';

export abstract class IPostsQueryRepository {
  abstract getPost(postId: number, status: PostStatus): Promise<PostViewModel>;
  abstract getUploadImages(resourceId: string): Promise<UploadedImageViewModel>;

  abstract getPosts(
    userId: number,
    paginationInputModel: PaginationPostsInputDto,
  ): Promise<PaginationViewModel<PostViewModel>>;
}

@Injectable()
export class PostsQueryRepository implements IPostsQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPost(postId: number, status: PostStatus): Promise<PostViewModel> {
    const foundPost = await this.prisma.post.findFirst({
      where: {
        id: postId,
        status,
      },
      include: {
        images: { where: { status: 'PUBLISHED' } },
      },
    });
    if (!foundPost) return null;

    const post = plainToInstance(PostEntity, foundPost);
    post.images.sort((a, b) => b.width - a.width);
    return new PostViewModel(post);
  }
  async getUploadImages(resourceId: string): Promise<UploadedImageViewModel> {
    const images = await this.prisma.postImage.findMany({
      where: {
        resourceId,
        status: PostStatus.PENDING,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return new UploadedImageViewModel(
      images.map(
        image => new PostImageViewModel(image.url, image.width, image.height, image.fileSize, image.resourceId),
      ),
    );
  }

  async getPosts(
    userId: number,
    paginationInputModel: PaginationPostsInputDto,
  ): Promise<PaginationViewModel<PostViewModel>> {
    const posts = await this.prisma.post.findMany({
      where: {
        ownerId: userId,
        status: PostStatus.PUBLISHED,
      },
      orderBy: {
        createdAt: paginationInputModel.isSortDirection(),
      },
      skip: paginationInputModel.skip, //(page - 1) * limit,
      take: paginationInputModel.getPageSize(), //limit
      include: {
        images: { where: { status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' } },
      },
    });
    const total = await this.prisma.post.count({
      where: {
        ownerId: userId,
        status: PostStatus.PUBLISHED,
      },
    });
    const pagesCountRes = Math.ceil(total / paginationInputModel.getPageSize());
    return new PaginationViewModel(
      pagesCountRes,
      paginationInputModel.getPageNumber(),
      paginationInputModel.getPageSize(),
      total,
      posts.map(post => new PostViewModel(plainToInstance(PostEntity, post))),
    );
  }
}
