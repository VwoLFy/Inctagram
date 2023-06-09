import { Injectable, Logger } from '@nestjs/common';
import { Stripe } from 'stripe';
import { ApiConfigService } from '../../../modules/api-config/api.config.service';
import { SubscriptionType } from '../../../modules/subscriptions/types/subscription.type';

@Injectable()
export class PaymentStripeService {
  private logger = new Logger(PaymentStripeService.name);
  private stripe = new Stripe(this.configService.API_KEY_STRIPE, { apiVersion: '2022-11-15' });
  serverUrl: string;
  monthlySubscriptionPriceId: string;
  semiAnnuallySubscriptionPriceId: string;
  yearlySubscriptionPriceId: string;

  constructor(private readonly configService: ApiConfigService) {
    this.serverUrl = this.configService.TEST_CLIENT_URL;
    this.monthlySubscriptionPriceId = this.configService.STRIPE_MONTHLY_SUBSCRIPTION_PRICE_ID;
    this.semiAnnuallySubscriptionPriceId = this.configService.STRIPE_SEMIANNUAL_SUBSCRIPTION_PRICE_ID;
    this.yearlySubscriptionPriceId = this.configService.STRIPE_YEARLY_SUBSCRIPTION_PRICE_ID;
  }

  public async createCustomer(name: string, email: string) {
    return this.stripe.customers.create({ name, email });
  }

  async createSession(params: {
    customerId: string;
    email: string;
    userName: string;
    subscriptionType: SubscriptionType;
  }) {
    //default params for create session
    const defaultParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      success_url: `${this.serverUrl}` + '/profile/settings/edit?success=true',
      cancel_url: `${this.serverUrl}/profile/settings/edit?success=false`,
      expires_at: Math.floor(Date.now() / 1000) + 3600 * 1, // Configured to expire after 1 hours
      customer: params.customerId,
    } as Stripe.Checkout.SessionCreateParams;
    //check customerId coming
    if (!params.customerId) {
      //create customer
      const customer = await this.createCustomer(params.userName, params.email);
      defaultParams['customer'] = customer.id;
    }
    //check if user has subscription
    const subscriptions = await this.findSubscriptions(defaultParams['customer']);
    try {
      if (subscriptions.data.length > 0) {
        //check if subscription is active
        if (subscriptions.data[0].status === 'active') {
          //cancel subscription
          await this.cancelSubscription(subscriptions.data[0].id);
        }
      }
      // Prepare line items from the subscription type
      defaultParams.line_items = this._getLineItems(params.subscriptionType);
      // Create the checkout session
      const session = await this.stripe.checkout.sessions.create(defaultParams);
      return session;
    } catch (error) {
      this.logger.error(error, 'error');
      console.log(error, 'error');
    }
  }

  private _getLineItems(subscriptionType: SubscriptionType) {
    const priceIds = {
      [SubscriptionType.MONTHLY]: this.monthlySubscriptionPriceId,
      [SubscriptionType.SEMI_ANNUALLY]: this.semiAnnuallySubscriptionPriceId,
      [SubscriptionType.YEARLY]: this.yearlySubscriptionPriceId,
    };
    const priceId = priceIds[subscriptionType];
    if (!priceId) {
      return [];
    }
    return [
      {
        price: priceId,
        quantity: 1,
      },
    ];
  }

  async findSubscriptions(customerId: string): Promise<Stripe.ApiListPromise<Stripe.Subscription>> {
    return this.stripe.subscriptions.list({ customer: customerId });
  }
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Response<Stripe.Subscription>> {
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}
