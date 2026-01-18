"use client";

import React, { useState } from "react";
import {
  useGetSubscriptionPlansQuery,
  SubscriptionPlan,
} from "@/store/paymentApi";
import { Loader2, Check, Zap, Crown, Rocket } from "lucide-react";
import { toast } from "sonner";
import CustomDialog from "@/components/ui/CustomDialog";
import PaymentModal from "./PaymentModal";

interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  showOneTimePost?: boolean;
}

export default function SubscriptionPlansModal({
  isOpen,
  onClose,
  showOneTimePost = true,
}: SubscriptionPlansModalProps) {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);
  const [paymentType, setPaymentType] = useState<"subscription" | "one_time">("subscription");
  const { data, isLoading } = useGetSubscriptionPlansQuery();

  const plans = data?.data || [];

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (!plan || !plan.id) {
      toast.error("Invalid plan selected");
      return;
    }
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
    // Optionally refresh subscription usage
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
    <CustomDialog
      open={isOpen}
      onOpenChange={onClose}
      title="Choose Your Plan"
      maxWidth="70vw"
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : (
          <>
            {/* Subscription Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2  xl:grid-cols-4 gap-6">
              {plans.map((plan,index) => {
                const isRecommended = plan.name.toLowerCase() === "basic";
                return (
                  <div
                    key={plan.id}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-300 flex flex-col ${
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
                        <p className="xl:text-2xl text-xl font-bold text-white mt-1">
                          ${plan.price}
                          <span className="text-xs font-normal text-white/60">
                            /Month
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

                    {index > 0 && <button
                      onClick={() => handleSubscribe(plan)}
                      className={`w-full cursor-pointer px-4 py-2 text-white rounded-lg font-medium transition-all duration-300 ${
                        isRecommended
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          : "cursor-pointer bg-white/10 hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      Subscribe
                    </button>}
                  </div>
                );
              })}
            </div>

            {/* One-Time Post Purchase */}
            {showOneTimePost && (
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
                    className="w-full cursor-pointer px-4 py-2 bg- text-white rounded-lg font-medium transition-all duration-300  bg-white/10 hover:bg-white/20 border border-white/20"
                  >
                    Buy One Post
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Embedded Payment Modal */}
      {selectedPlanForPayment && paymentType === "subscription" && selectedPlanForPayment.id && (
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
    </CustomDialog>
  );
}

