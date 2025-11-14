import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  extractResetTokenFromURL,
  clearResetTokenFromURL,
} from "@/lib/resetTokenExtractor";
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
  const { resetPassword } = useAuth();

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
  const [errorDrawer, setErrorDrawer] = useState({
    isOpen: false,
    title: "",
    message: "",
    details: "",
  });

  // Extract reset token from URL on component mount
  useEffect(() => {
    const tokenData = extractResetTokenFromURL();

    if (tokenData && tokenData.token) {
      setResetToken(tokenData.token);
      clearResetTokenFromURL();
    }
  }, []);

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
        // Show error in drawer
        setErrorDrawer({
          isOpen: true,
          title: "Password Reset Failed",
          message: response.message || "Failed to reset password",
          details: response.error || "",
        });
      }
    } catch (error) {
      // Show error in drawer
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
    // Navigate to login page
    navigate("/login");
  };

  const handleDrawerClose = () => {
    // Reset to active state when drawer is closed
    setCurrentState("active");
  };

  const isFormValid =
    formData.newPassword.length >= 8 &&
    formData.confirmPassword.length >= 8 &&
    formData.newPassword === formData.confirmPassword;

  const passwordsMatch = formData.newPassword === formData.confirmPassword;
  const passwordError = formData.confirmPassword && !passwordsMatch;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-start px-6 py-8">
        {/* Logo */}
        <div className="flex justify-center mb-8 mt-14">
          <img src="/Logo2.svg" alt="Lisar Logo" className="h-5 w-auto" />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Reset password</h2>
          <p className="text-white/70 text-lg">Enter your new password below</p>
        </div>

        {/* Form */}
        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* New Password Input */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-white text-sm font-medium mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                className={`w-full px-4 py-3 pr-12 bg-[#121212] border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                  currentState === "active" || currentState === "success"
                    ? "border-[#C7EF6B]"
                    : "border-[#121212]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-white text-sm font-medium mb-2"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                className={`w-full px-4 py-3 pr-12 bg-[#121212] border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                  passwordError
                    ? "border-red-500 focus:border-red-500"
                    : currentState === "active" || currentState === "success"
                      ? "border-[#C7EF6B]"
                      : "border-[#121212]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-400 text-sm mt-1">
                Passwords do not match
              </p>
            )}
          </div>

          {/* Reset Password Button */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
              isFormValid && !isSubmitting
                ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
                : "bg-[#636363] text-white cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Processing..." : "Reset password"}
          </button>
        </form>

        {/* Drawer for Success State */}
        <Drawer
          open={currentState === "success"}
          onOpenChange={(open) => !open && handleDrawerClose()}
        >
          <DrawerContent>
            <DrawerHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-[#C7EF6B]/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-[#C7EF6B]" />
                </div>
              </div>
              <DrawerTitle>Success!</DrawerTitle>
              <DrawerDescription>
                Your password has been reset successfully
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <button
                onClick={handleGoToLogin}
                className="w-full py-3 px-6 rounded-lg font-semibold text-lg bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors"
              >
                Go to login
              </button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Footer Link */}
        <div className="text-center mt-8">
          <p className="text-white">
            Remember your password?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#C7EF6B] hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      </div>

      {/* Error Drawer */}
      <ErrorDrawer
        isOpen={errorDrawer.isOpen}
        onClose={() => setErrorDrawer({ ...errorDrawer, isOpen: false })}
        title={errorDrawer.title}
        message={errorDrawer.message}
        details={errorDrawer.details}
        onRetry={() => {
          setErrorDrawer({ ...errorDrawer, isOpen: false });
          // User can manually retry by clicking submit again
        }}
      />
    </div>
  );
};
