import React from "react";
import { AlertCircle, ArrowRight, Check, Shield, Sparkles, X, Zap } from "lucide-react";

const PricingPage = () => {
  const plans = [
    {
      name: "Free",
      tagline: "Perfect for getting started",
      price: 0,
      quota: 10,
      popular: false,
      features: [
        { text: "5 pages per PDF", included: true },
        { text: "4MB file size limit", included: true },
        { text: "Mobile-friendly interface", included: true },
        { text: "Higher-quality responses", included: false },
        { text: "Priority support", included: false },
      ],
      gradient: "from-gray-50 to-gray-100",
      buttonStyle: "bg-gray-900 hover:bg-gray-800 text-white",
    },
    {
      name: "Pro",
      tagline: "For power users & professionals",
      price: 9.99,
      quota: 50,
      popular: true,
      features: [
        { text: "25 pages per PDF", included: true },
        { text: "16MB file size limit", included: true },
        { text: "Mobile-friendly interface", included: true },
        { text: "Higher-quality responses", included: true },
        { text: "Priority support", included: true },
      ],
      gradient: "from-blue-50 to-indigo-100",
      buttonStyle: "bg-gradient-to-r from-primary to-indigo-600 hover:from-primary hover:to-indigo-700 text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Disclaimer Banner */}
      <div className="bg-amber-500 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm md:text-base font-medium">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-center">
            <span className="font-bold">TEST PAGE ONLY</span> - Payment functionality is not available. This is for
            demonstration purposes.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-secondary text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="h-4 w-4" />
            Simple, Transparent Pricing
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Choose Your
            <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
              {" "}
              Perfect Plan
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:scale-105 ${
                plan.popular ? "ring-4 ring-primary ring-offset-4" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-indigo-600 text-white px-6 py-2 rounded-bl-3xl font-semibold text-sm flex items-center gap-1.5 shadow-lg">
                  <Zap className="h-4 w-4" />
                  Most Popular
                </div>
              )}

              <div className={`bg-gradient-to-br ${plan.gradient} p-8 md:p-10`}>
                <div className="flex items-center gap-3 mb-3">
                  {plan.name === "Pro" ? (
                    <Shield className="h-8 w-8 text-primary" />
                  ) : (
                    <Sparkles className="h-8 w-8 text-gray-600" />
                  )}
                  <h2 className="text-3xl font-bold text-gray-900">{plan.name}</h2>
                </div>

                <p className="text-gray-600 mb-6 text-lg">{plan.tagline}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-xl text-gray-500">/month</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl mb-8 shadow-sm border border-gray-200">
                  <span className="font-semibold text-gray-900">{plan.quota} PDFs</span>
                  <span className="text-gray-500">per month</span>
                </div>

                <button
                  className={`w-full ${plan.buttonStyle} px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group`}
                  disabled
                >
                  Get Started
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="mt-8 space-y-4">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    What's Included
                  </div>
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 rounded-full p-1 ${
                          feature.included ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {feature.included ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                      </div>
                      <span className={`text-base ${feature.included ? "text-gray-700" : "text-gray-400"}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Disclaimer */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 max-w-3xl mx-auto">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 text-lg mb-2">Important Notice</h3>
              <p className="text-amber-800 leading-relaxed">
                This is a demonstration page only. Payment processing is not configured and buttons are non-functional.
                This interface is designed to showcase the pricing structure and feature comparison.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 mb-4">Trusted by developers worldwide</p>
          <div className="flex justify-center items-center gap-8 flex-wrap opacity-50">
            <div className="text-gray-400 font-semibold">🚀 Fast & Reliable</div>
            <div className="text-gray-400 font-semibold">🔒 Secure</div>
            <div className="text-gray-400 font-semibold">💯 Money Back Guarantee</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
