
import Stripe from 'stripe';

class StripeService {
        static stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        constructor() {
        }

        // create stripe customer
        static async createCustomer(name, email) {
                try {
                        let stripeCustomer;
                        if (email) {
                                const existingCustomers = await this.stripe.customers.list({
                                        email: email,
                                        limit: 1
                                });

                                if (existingCustomers.data.length > 0) {
                                        stripeCustomer = existingCustomers.data[0];
                                }
                        }

                        if (stripeCustomer) throw new Error(`The email : ${email} is already exist for stripe customer`);

                        const customerData = {
                                email,
                                name
                        };

                        stripeCustomer = await this.stripe.customers.create(customerData);
                        return stripeCustomer.id;
                } catch (error) {
                        throw new Error(`Failed to create customer: ${error.message}`);
                }
        }

        static async getCustomer(customerId) {
                try {
                        const customer = this.stripe.customers.retrieve(customerId)
                        return customer;
                } catch (error) {
                        throw new Error(`Failed to get customer: ${error.message}`);
                }
        }

        static async createSetupIntent(customerId, options = {}) {
                try {
                        const setupIntentData = {
                                customer: customerId,
                                usage: options.usage || 'off_session',
                                payment_method_types: options.payment_method_types || ['card'],
                                ...options
                        };

                        const setupIntent = await this.stripe.setupIntents.create(setupIntentData);

                        return {
                                id: setupIntent.id,
                                client_secret: setupIntent.client_secret,
                                status: setupIntent.status
                        };
                } catch (error) {
                        throw new Error(`Failed to create setup intent: ${error.message}`);
                }
        }

        static async getUserCards(customerId) {
                try {
                        const paymentMethods = await this.stripe.paymentMethods.list({
                                customer: customerId,
                                type: 'card',
                        });

                        const cards = paymentMethods.data.map((paymentMethod) => {
                                return this.formatPaymentMethod(paymentMethod);
                        })


                        return cards;
                } catch (error) {
                        throw new Error(`Failed to get user cards: ${error.message}`);
                }
        }

        static async getDefaultCard(customerId) {
                try {
                        const customer = await this.getCustomer(customerId);
                        const defaultPmId = customer?.invoice_settings?.default_payment_method;

                        if (!defaultPmId) return null;

                        const paymentMethod = await this.stripe.paymentMethods.retrieve(defaultPmId);
                        if (!paymentMethod) return null;
                        return this.formatPaymentMethod(paymentMethod);
                } catch (error) {
                        if (error.statusCode === 404) return null;
                        throw new Error(`Failed to get default card: ${error.message}`);
                }
        }

        static async setDefaultCard(customerId, defaultPaymentMethod) {
                try {
                        const customer = await this.stripe.customers.update(customerId, {
                                invoice_settings: {
                                        default_payment_method: defaultPaymentMethod,
                                },
                        });

                        const paymentMethod = await this.stripe.paymentMethods.retrieve(defaultPaymentMethod);
                        if (!paymentMethod) return null;
                        return this.formatPaymentMethod(paymentMethod);
                } catch (error) {
                        if (error.statusCode === 404) return null;
                        throw new Error(`Failed to get default card: ${error.message}`);
                }
        }

        static async deleteCard(paymentMethod) {
                try {
                        const detachedPaymentMethod = await this.stripe.paymentMethods.detach(paymentMethod);
                        return {
                                success: true,
                                paymentMethod: detachedPaymentMethod
                        };
                } catch (error) {
                        if (error.statusCode === 404) return null;
                        throw new Error(`Failed to get delete card: ${error.message}`);
                }
        }

        static async subscribe(customerId) {
                try {
                        const priceId = process.env.STRIPE_SUBSCRIPTION_ID
                        const price = await this.getPrice(priceId);
                        const subscription = await this.stripe.subscriptions.create({
                                customer: customerId,
                                items: [
                                        {
                                                price: priceId
                                        }
                                ]
                        })

                        await this.increaseCustomerBalance(customerId, price.amount);

                        return {
                                success: true,
                                subscription,
                        };
                } catch (error) {
                        console.error('Stripe subscription error:', error);
                        return {
                                success: false,
                                error: error.message,
                        };
                }
        }

        static async increaseCustomerBalance(customerId, total_added) {

                try {
                        const customer = await this.getCustomer(customerId)
                        let customer_balance =  customer.balance + total_added
                        this.stripe.customer.update(customerId, {
                                balance: customer_balance
                        })
                } catch (error) {
                        console.error('Stripe subscription error:', error);
                        return {
                                success: false,
                                error: error.message,
                        };
                }
        }

        static async getPrice(priceId) {

                try {
                        const price = await this.stripe.prices.retrieve(priceId);

                        return {
                                success: true,
                                price,
                                amount: price.unit_amount / 100
                        };
                } catch (error) {
                        console.error('Stripe subscription error:', error);
                        return {
                                success: false,
                                error: error.message,
                        };
                }
        }

        static verifyStripeWebHook(body, signature, endpointSecret) {
                try {
                        const event = this.stripe.webhooks.constructEvent(body, signature, endpointSecret);
                        return event
                } catch (err) {
                        throw new Error("Webhook signature verification failed " + err.message)
                }

        }

        static formatPaymentMethod(paymentMethod) {
                const card = paymentMethod.card

                return {
                        id: paymentMethod.id,
                        CardHolder: paymentMethod.billing_details.name,
                        cardNumber: card.last4,
                        expiryYear: card.exp_year,
                        expiryMonth: card.exp_month,
                        brand: card.brand,
                }
        }

}



export default StripeService