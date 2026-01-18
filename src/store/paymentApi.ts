// paymentApi.ts
import { baseApi } from "./baseApi";

export interface SubscriptionPlan {
  id: number;
  name: string;
  display_name: string;
  price: number;
  posts_per_month: number;
  features: string[];
  is_active: boolean;
}

export interface UserSubscription {
  id: number;
  plan: SubscriptionPlan | null;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  current_period_start: string | null;
  current_period_end: string | null;
  posts_used_this_month: number;
  remaining_posts: number;
  cancel_at_period_end: boolean;
}

export interface SubscriptionUsage {
  has_subscription: boolean;
  plan_name: string;
  posts_used: number;
  posts_limit: number | null; // null means unlimited
  remaining_posts: number | null;
  can_post: boolean;
  has_credits: boolean;
  credit_count: number;
}

export interface Payment {
  id: number;
  payment_type: 'subscription' | 'one_time';
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  description: string;
  created_at: string;
}

export interface PostCredit {
  id: number;
  amount: number;
  used: number;
  remaining: number;
  expires_at: string | null;
  created_at: string;
}

export interface CheckoutSessionResponse {
  success: boolean;
  message: string;
  data: {
    session_id: string;
    url: string;
  };
}

export interface SubscriptionUsageResponse {
  success: boolean;
  message: string;
  data: SubscriptionUsage;
}

export interface SubscriptionPlansResponse {
  success: boolean;
  message: string;
  data: SubscriptionPlan[];
}

export interface UserSubscriptionResponse {
  success: boolean;
  message: string;
  data: UserSubscription;
}

export interface PaymentsResponse {
  success: boolean;
  message: string;
  data: Payment[];
}

export interface PostCreditsResponse {
  success: boolean;
  message: string;
  data: PostCredit[];
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get subscription plans
    getSubscriptionPlans: builder.query<SubscriptionPlansResponse, void>({
      query: () => ({
        url: "/api/marketplace/subscription-plans/",
        method: "GET",
      }),
      providesTags: ["SubscriptionPlans"],
    }),

    // Get user subscription
    getUserSubscription: builder.query<UserSubscriptionResponse, void>({
      query: () => ({
        url: "/api/marketplace/subscription/",
        method: "GET",
      }),
      providesTags: ["UserSubscription"],
    }),

    // Get subscription usage
    getSubscriptionUsage: builder.query<SubscriptionUsageResponse, void>({
      query: () => ({
        url: "/api/marketplace/subscription/usage/",
        method: "GET",
      }),
      providesTags: ["SubscriptionUsage"],
    }),

    // Create subscription checkout session
    createSubscriptionCheckout: builder.mutation<
      CheckoutSessionResponse,
      { plan_id: number; success_url?: string; cancel_url?: string }
    >({
      query: (data) => ({
        url: "/api/marketplace/subscription/create_checkout_session/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["UserSubscription", "SubscriptionUsage"],
    }),

    // Create one-time post payment checkout session
    createPostPaymentCheckout: builder.mutation<
      CheckoutSessionResponse,
      { success_url?: string; cancel_url?: string }
    >({
      query: (data) => ({
        url: "/api/marketplace/subscription/create_post_payment/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SubscriptionUsage", "PostCredits"],
    }),

    // Cancel subscription
    cancelSubscription: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/api/marketplace/subscription/cancel_subscription/",
        method: "POST",
      }),
      invalidatesTags: ["UserSubscription", "SubscriptionUsage"],
    }),

    // Get payment history
    getPayments: builder.query<PaymentsResponse, void>({
      query: () => ({
        url: "/api/marketplace/payments/",
        method: "GET",
      }),
      providesTags: ["Payments"],
    }),

    // Get post credits
    getPostCredits: builder.query<PostCreditsResponse, void>({
      query: () => ({
        url: "/api/marketplace/credits/",
        method: "GET",
      }),
      providesTags: ["PostCredits"],
    }),

    // Create subscription with payment method (embedded payment)
    createSubscriptionWithPaymentMethod: builder.mutation<
      { success: boolean; message: string; data: { subscription_id: string; client_secret: string | null; payment_status: string; requires_action: boolean } },
      { plan_id: number; payment_method_id: string }
    >({
      query: (data) => ({
        url: "/api/marketplace/subscription/create_subscription_with_payment_method/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["UserSubscription", "SubscriptionUsage"],
    }),

    // Create one-time post payment with payment method (embedded payment)
    createPostPaymentWithPaymentMethod: builder.mutation<
      { success: boolean; message: string; data: { payment_intent_id: string; client_secret: string; status: string; requires_action: boolean } },
      { payment_method_id: string; return_url?: string }
    >({
      query: (data) => ({
        url: "/api/marketplace/subscription/create_post_payment_with_payment_method/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SubscriptionUsage", "PostCredits"],
    }),
  }),
});

export const {
  useGetSubscriptionPlansQuery,
  useGetUserSubscriptionQuery,
  useGetSubscriptionUsageQuery,
  useCreateSubscriptionCheckoutMutation,
  useCreatePostPaymentCheckoutMutation,
  useCreateSubscriptionWithPaymentMethodMutation,
  useCreatePostPaymentWithPaymentMethodMutation,
  useCancelSubscriptionMutation,
  useGetPaymentsQuery,
  useGetPostCreditsQuery,
} = paymentApi;

