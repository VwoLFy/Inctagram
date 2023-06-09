import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../../main/decorators/user.decorator';
import { ApiConfigService } from '../../api-config/api.config.service';
import { HTTP_Status } from '../../../main/enums/http-status.enum';
import { SubscriptionPriceViewModel } from './view-model/cost-monthly-subscription-view.dto';
import { SwaggerDecoratorsGetCostOfSubscription } from '../swagger/swagger.subscription.decorators';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class GetSubscriptionsController {
  constructor(private readonly apiConfigService: ApiConfigService) {}

  @SwaggerDecoratorsGetCostOfSubscription()
  @Get('cost-of-subscriptions')
  @HttpCode(HTTP_Status.OK_200)
  async getCurrentCostSubscription(@CurrentUserId() userId: number): Promise<SubscriptionPriceViewModel> {
    return new SubscriptionPriceViewModel(this.apiConfigService.COST_SUBSCRIPTION);
  }
}
