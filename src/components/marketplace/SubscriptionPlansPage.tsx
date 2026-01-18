"use client";

import React, { useState, useEffect } from "react";
import {
  useGetSubscriptionPlansQuery,
  useCreateSubscriptionCheckoutMutation,
  useCreatePostPaymentCheckoutMutation,
  SubscriptionPlan,
} from "@/store/paymentApi";
import { Loader2, Check, Zap, Crown, Rocket } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import PaymentModal from "./PaymentModal";

export default function SubscriptionPlansPage() {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);
  const [paymentType, setPaymentType] = useState<"subscription" | "one_time">("subscription");
  const searchParams = useSearchParams();
  const { data, isLoading } = useGetSubscriptionPlansQuery();

  const plans = data?.data || [];

  // Handle success/cancel from Stripe redirect
  useEffect(() => {
    const success = searchParams?.get("success");
    const canceled = searchParams?.get("canceled");

    if (success === "true") {
      toast.success("Payment successful! Your subscription is now active.");
    } else if (canceled === "true") {
      toast.info("Payment canceled. You can try again anytime.");
    }
  }, [searchParams]);

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setSelectedPlanForPayment(plan);
    setPaymentType("subscription");
    setPaymentModalOpen(true);
  };

  const handleBuyPost = () => {
    setSelectedPlanForPayment(null);
    setPaymentType("one_time");
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    setSelectedPlanForPayment(null);
    toast.success("Payment successful!");
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "free":
        return <Zap className="w-6 h-6" />;
      case "basic":
        return <Check className="w-6 h-6" />;
      case "pro":
        return <Crown className="w-6 h-6" />;
      case "enterprise":
        return <Rocket className="w-6 h-6" />;
      default:
        return <Check className="w-6 h-6" />;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6">
      <div className="page-container">
        <div className="p-6 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Choose Your Plan
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Select a subscription plan that fits your needs or purchase individual posts.
            </p>
          </div>

          {/* Subscription Plans */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => {
                  const isRecommended = plan.name.toLowerCase() === "basic";
                  return (
                    <div
                      key={plan.id}
                      className={`relative p-6  rounded-xl border-2 transition-all duration-300 flex flex-col ${
                        isRecommended
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-white/20 bg-white/5 hover:border-white/40"
                      }`}
                    >
                      {isRecommended && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                            RECOMMENDED
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                          {getPlanIcon(plan.name)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {plan.display_name}
                          </h3>
                          <p className="text-2xl font-bold text-white mt-1">
                            ${plan.price}
                            <span className="text-sm font-normal text-white/60">
                              /month
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="mb-4 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-white/80">
                            {plan.posts_per_month === 0
                              ? "Unlimited"
                              : `${plan.posts_per_month} posts/month`}
                          </span>
                        </div>
                        {plan.features && plan.features.length > 0 && (
                          <ul className="space-y-2 mt-3">
                            {plan.features.map((feature, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm text-white/70"
                              >
                                <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <button
                        onClick={() => handleSubscribe(plan)}
                        className={`w-full cursor-pointer px-4 py-2 text-white rounded-lg font-medium transition-all duration-300 ${
                          isRecommended
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            : "bg-white/10 hover:bg-white/20 border border-white/20"
                        }`}
                      >
                        Subscribe
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* One-Time Post Purchase */}
              <div className="pt-6 border-t border-white/10">
                <div className="p-6 rounded-xl border-2 border-blue-500/30 bg-blue-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Need Just One Post?
                      </h3>
                      <p className="text-sm text-white/70">
                        Purchase a single promotion post without a subscription
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white">$2.99</p>
                      <p className="text-sm text-white/60">per post</p>
                    </div>
                  </div>
                  <button
                    onClick={handleBuyPost}
                    className="w-full cursor-pointer px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-300"
                  >
                    Buy One Post
                  </button>
                </div>
              </div>

              {/* Footer Info */}
              <div className="text-center space-y-2 text-white/60 text-sm pt-6">
                <p>Subscriptions automatically renew. Cancel anytime.</p>
                <p>All features are subject to availability and may vary by region.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Payment Modal */}
      {selectedPlanForPayment && paymentType === "subscription" && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedPlanForPayment(null);
          }}
          planId={selectedPlanForPayment.id}
          planName={selectedPlanForPayment.display_name}
          amount={selectedPlanForPayment.price}
          paymentType="subscription"
          onSuccess={handlePaymentSuccess}
        />
      )}

      {paymentType === "one_time" && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedPlanForPayment(null);
          }}
          planId={0}
          planName="One-Time Post"
          amount={2.99}
          paymentType="one_time"
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

