import { BaseDateEntity } from '../../../main/entities/base-date.entity';
import { BusinessAccount } from '@prisma/client';
import { Type } from 'class-transformer';
import { SubscriptionEntity } from './subscription.entity';
import { CreateSubscriptionInputDto } from '../api/input-dtos/create-subscription-input.dto';

export class BusinessAccountEntity extends BaseDateEntity implements BusinessAccount {
  userId: number;
  stipeCustomerId: string;
  @Type(() => SubscriptionEntity)
  subscriptions: SubscriptionEntity[];

  constructor() {
    super();
  }

  static create(userId: number) {
    const instance = new BusinessAccountEntity();
    instance.userId = userId;
    instance.subscriptions = [];
    return instance;
  }

  updateCurrentSubscriptionAndAddNewSubscriptionWithPayment(
    sessionId: string,
    customerId: string,
    createSubscriptionDto: CreateSubscriptionInputDto,
  ): BusinessAccountEntity {
    //if there is a subscription change status to inactive
    if (this.subscriptions.length > 0) {
      //map current subscription with status active and set autoRenew to false
      this.subscriptions = this.subscriptions.map(s => {
        return s.updateCurrentSubscriptionToInactive();
      });
    }
    this.stipeCustomerId = customerId;
    //create new subscription
    const subscription = SubscriptionEntity.createSubscriptionWithPayment(
      this.userId,
      customerId,
      createSubscriptionDto,
      sessionId,
    );
    this.subscriptions = [...this.subscriptions, subscription];
    return this;
  }

  changeStatusToCanceledAutoRenewal() {
    this.subscriptions = this.subscriptions.map(s => {
      return s.updateCurrentSubscriptionToInactive();
    });
    return this;
  }
}
