import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ResultNotification } from '../../../main/validators/result-notification';
import { CreateSubscriptionInputDto } from './input-dtos/create-subscription-input.dto';
import { CreateSubscriptionCommand } from '../application/use-cases/create-subscription-use.case';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../../main/decorators/user.decorator';
import { ApiConfigService } from '../../api-config/api.config.service';
import { JwtAuthGuard } from '../../auth/api/guards/jwt-auth.guard';

@ApiTags('subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly commandBus: CommandBus, private readonly apiConfigService: ApiConfigService) {}

  @Get('cost-subscriptions')
  async getCurrentCostSubscription(@CurrentUserId() userId: number) {
    //return current cost subscription from env
    const currentCostSubscription = this.apiConfigService.COST_SUBSCRIPTION;
    //need to get set for month, semi-annual and year
    //{period: 'month', cost: 10}
    return {
      month: `${currentCostSubscription}$ per month`,
      semiAnnual: `${currentCostSubscription * 6}$ per 6 months`,
      year: `${currentCostSubscription * 10}$ per year`, // 2 months free
    };
  }
  @Post()
  async createSubscription(@CurrentUserId() userId: number, @Body() createSubscriptionDto: CreateSubscriptionInputDto) {
    const notification = await this.commandBus.execute<CreateSubscriptionCommand, ResultNotification<any>>(
      new CreateSubscriptionCommand(userId, createSubscriptionDto),
    );
    return notification.getData();
  }

  @Get('success')
  async successSubscription() {
    return 'Payment was successful';
  }

  @Get('failed')
  async failedSubscription() {
    return 'Transaction failed, please try again';
  }

  @Get('current-subscription')
  async getCurrentSubscription(@CurrentUserId() userId: number) {}

  @Get('my-payments')
  async getMyPayments(@CurrentUserId() userId: number) {}
}