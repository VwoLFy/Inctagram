import { Module } from '@nestjs/common';
import { CreateSubscriptionUseCase } from './application/use-cases/create-subscription-use.case';
import { CqrsModule } from '@nestjs/cqrs';
import { SubscriptionsController } from './api/subscriptions.controllers';
import { UsersModule } from '../users/users.module';
import { PaymentsModule } from '../../providers/payment/payments.module';
import { ApiConfigModule } from '../api-config/api.config.module';
import { ISubscriptionsRepository, SubscriptionsRepository } from './infrastructure/subscriptions.repository';
import { SuccessSubscriptionHandler } from './application/event-handlers/success-subscription.handler';
import { FailedSubscriptionHandler } from './application/event-handlers/failed-subscription.handler';
import {
  ISubscriptionsQueryRepository,
  SubscriptionsQueryRepository,
} from './infrastructure/subscriptions-query.repository';
import { GetSubscriptionsController } from './api/get-subscriptions.controllers';
import { CanceledAutoRenewalUseCase } from './application/use-cases/canceled-auto-renewal-use.case';

const useCases = [CreateSubscriptionUseCase, CanceledAutoRenewalUseCase];
const handlers = [SuccessSubscriptionHandler, FailedSubscriptionHandler];

@Module({
  imports: [CqrsModule, UsersModule, PaymentsModule, ApiConfigModule],
  controllers: [SubscriptionsController, GetSubscriptionsController],
  providers: [
    ...useCases,
    ...handlers,
    {
      provide: ISubscriptionsRepository,
      useClass: SubscriptionsRepository,
    },
    {
      provide: ISubscriptionsQueryRepository,
      useClass: SubscriptionsQueryRepository,
    },
  ],
})
export class SubscriptionsModule {}
