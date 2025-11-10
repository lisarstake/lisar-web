import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  extractResetTokenFromURL,
  clearResetTokenFromURL,
} from "@/utils/resetTokenExtractor";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CheckCircle, Eye, EyeOff } from "lucide-react";

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

type ResetPasswordState = "inactive" | "active" | "success";

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword, verifyPasswordResetToken } = useAuth();

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    newPassword: "",
    confirmPassword: "",
  });

  const [resetToken, setResetToken] = useState<string | null>(null);
  const [currentState, setCurrentState] =
    useState<ResetPasswordState>("inactive");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [errorDrawer, setErrorDrawer] = useState({
    isOpen: false,
    title: "",
    message: "",
    details: "",
  });

  // Extract and verify reset token from URL on component mount
  useEffect(() => {
    const verifyToken = async () => {
      setIsVerifyingToken(true);
      const tokenData = extractResetTokenFromURL();

      if (tokenData && tokenData.token) {
        try {
          const response = await verifyPasswordResetToken(tokenData.token);

          if (response.success) {
            setResetToken(tokenData.token);
            setIsTokenValid(true);
            clearResetTokenFromURL();
          } else {
            setTokenError(response.message || "Invalid or expired reset token");
            setIsTokenValid(false);

            setErrorDrawer({
              isOpen: true,
              title: "Invalid Reset Token",
              message:
                response.message ||
                "This password reset link is invalid or has expired.",
              details: response.error || "",
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to verify reset token";
          setTokenError(errorMessage);
          setIsTokenValid(false);

          setErrorDrawer({
            isOpen: true,
            title: "Token Verification Failed",
            message:
              "Unable to verify the reset token. Please try requesting a new reset link.",
            details: errorMessage,
          });
        }
      } else {
        setTokenError("No reset token found in URL");
        setIsTokenValid(false);

        setErrorDrawer({
          isOpen: true,
          title: "No Reset Token",
          message:
            "No reset token found in the URL. Please request a new password reset link.",
          details: "",
        });
      }

      setIsVerifyingToken(false);
    };

    verifyToken();
  }, [verifyPasswordResetToken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-transition to active state when password is entered
    if (value && currentState === "inactive") {
      setCurrentState("active");
    } else if (!value && currentState === "active") {
      setCurrentState("inactive");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid || isSubmitting || !resetToken) return;

    setIsSubmitting(true);

    try {
      const response = await resetPassword(resetToken, formData.newPassword);

      if (response.success) {
        setCurrentState("success");
      } else {
        setErrorDrawer({
          isOpen: true,
          title: "Password Reset Failed",
          message: response.message || "Failed to reset password",
          details: response.error || "",
        });
      }
    } catch (error) {
      setErrorDrawer({
        isOpen: true,
        title: "Network Error",
        message:
          "Unable to connect to the server. Please check your internet connection and try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  const handleDrawerClose = () => {
    setCurrentState("active");
  };

  const isFormValid =
    formData.newPassword.length >= 8 &&
    formData.confirmPassword.length >= 8 &&
    formData.newPassword === formData.confirmPassword;

  const passwordsMatch = formData.newPassword === formData.confirmPassword;
  const passwordError = formData.confirmPassword && !passwordsMatch;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="w-full max-w-md mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/Logo.svg" alt="Lisar Logo" className="h-5 w-auto" />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Reset password
          </h2>
          <p className="text-gray-600 text-lg">Enter your new password below</p>
        </div>

        {/* Form */}
        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* New Password Input */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-gray-900 text-sm font-medium mb-2"
            >
              New Password
            </label>
            <div className="relative">
              {isVerifyingToken ? (
                <div className="h-12 bg-gray-50 border border-gray-200 rounded-lg animate-pulse" />
              ) : (
                <>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    disabled={!isTokenValid}
                    className={`w-full px-4 py-3 pr-12 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-colors ${
                      currentState === "active" || currentState === "success"
                        ? "border-[#235538]"
                        : "border-gray-200"
                    } ${!isTokenValid ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={!isTokenValid}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-gray-900 text-sm font-medium mb-2"
            >
              Confirm New Password
            </label>
            <div className="relative">
              {isVerifyingToken ? (
                <div className="h-12 bg-gray-50 border border-gray-200 rounded-lg animate-pulse" />
              ) : (
                <>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                    disabled={!isTokenValid}
                    className={`w-full px-4 py-3 pr-12 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-colors ${
                      passwordError
                        ? "border-red-500 focus:border-red-500"
                        : currentState === "active" ||
                            currentState === "success"
                          ? "border-[#235538]"
                          : "border-gray-200"
                    } ${!isTokenValid ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={!isTokenValid}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </>
              )}
            </div>
            {passwordError && !isVerifyingToken && (
              <p className="text-red-500 text-sm mt-1">
                Passwords do not match
              </p>
            )}
          </div>

          {/* Reset Password Button */}
          {isVerifyingToken ? (
            <div className="h-12 bg-gray-300 rounded-lg animate-pulse" />
          ) : (
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting || !isTokenValid}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
                isFormValid && !isSubmitting && isTokenValid
                  ? "bg-[#235538] text-white hover:bg-[#1d4530]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Processing..." : "Reset password"}
            </button>
          )}
        </form>

        {/* Drawer for Success State */}
        <Drawer
          open={currentState === "success"}
          onOpenChange={(open) => !open && handleDrawerClose()}
        >
          <DrawerContent className="bg-white border-gray-200">
            <DrawerHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-[#235538]/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-[#235538]" />
                </div>
              </div>
              <DrawerTitle className="text-gray-900">Success!</DrawerTitle>
              <DrawerDescription className="text-gray-600">
                Your password has been reset successfully
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <button
                onClick={handleGoToLogin}
                className="w-full py-3 px-6 rounded-lg font-semibold text-lg bg-[#235538] text-white hover:bg-[#1d4530] transition-colors"
              >
                Go to login
              </button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Footer Link */}
        <div className="text-center mt-8">
          <p className="text-gray-900">
            Remember your password?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#235538] hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
        </div>
      </div>

      {/* Error Drawer */}
      <ErrorDrawer
        isOpen={errorDrawer.isOpen}
        onClose={() => {
          setErrorDrawer({ ...errorDrawer, isOpen: false });
          // If token error, navigate to forgot password page
          if (tokenError && !isTokenValid) {
            navigate("/forgot-password");
          }
        }}
        title={errorDrawer.title}
        message={errorDrawer.message}
        details={errorDrawer.details}
        onRetry={() => {
          if (tokenError && !isTokenValid) {
            // Navigate to forgot password to request new link
            navigate("/forgot-password");
          } else {
            setErrorDrawer({ ...errorDrawer, isOpen: false });
            // User can manually retry by clicking submit again
          }
        }}
        retryText={
          tokenError && !isTokenValid ? "Request New Reset Link" : undefined
        }
      />
    </div>
  );
};
