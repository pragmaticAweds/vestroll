"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/toast";
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "@/utils/validation";
import { useRouter } from "next/navigation";

const ForgotPasswordForm: React.FC = () => {
  const { forgotPassword, isLoading, error } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data.email);
      // for now just navigate to otp page
      success("Reset link sent to your email");
      router.push("verify-otp");
    } catch (err) {
      showError(error || "Failed to send reset link");
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="">
        {/* Form Content */}
        <div className="max-w-md">
          <div className="space-y-2">
            <h2 className="text-[#17171C] text-[1.75rem] md:text-[2rem] tracking-[-2%] lg:text-[2.5rem] font-bold  leading-[100%] ">
              Forgot your password?
            </h2>
            <p className="text-[#414F62] text-xs md:text-base font-medium leading-[100%]">
              Provide the email address linked to your VestRoll account to reset
              your password and login{" "}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-12 ">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-xs font-medium text-black"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Provide email address"
              className={`w-full h-[53px] px-3.5 py-4.5 mb-12 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm text-gray-900 placeholder-gray-400 ${
                errors.email ? "border-red-300 ring-red-200" : ""
              }`}
              aria-describedby={errors.email ? "email-error" : undefined}
              autoComplete="email"
            />
            {errors.email && (
              <p
                id="email-error"
                className="mt-2 text-xs text-red-600"
                role="alert"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-[56px] py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              !isLoading
                ? "bg-[#5E2A8C] text-white hover:bg-[#4A1F73] focus:outline-none focus:ring-2 focus:ring-[#5E2A8C] focus:ring-offset-2 focus:ring-offset-white transform hover:scale-[1.02]"
                : "bg-[#5E2A8C] text-white opacity-50 cursor-not-allowed"
            }`}
            aria-describedby="button-description"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 mr-2 border-2 rounded-lg border-white/30 border-t-white animate-spin"></div>
                Sending...
              </div>
            ) : (
              "Continue"
            )}
          </button>
          <p id="button-description" className="sr-only">
            {isLoading
              ? "Sending reset link"
              : "Send password reset link to your email"}
          </p>

          {/* Back to Login Link */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-[#5E2A8C] hover:text-[#4A1F73] font-medium text-base transition-colors duration-200 focus:outline-none "
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default ForgotPasswordForm;
