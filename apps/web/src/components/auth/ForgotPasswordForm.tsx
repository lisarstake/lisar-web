import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import { CheckCircle } from "lucide-react";

interface ForgotPasswordFormData {
  email: string;
}

type ForgotPasswordState = "inactive" | "active" | "email-sent" | "success";

export const ForgotPasswordForm: React.FC = () => {
  const { forgotPassword } = useAuth();

  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });

  const [currentState, setCurrentState] =
    useState<ForgotPasswordState>("inactive");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDrawer, setErrorDrawer] = useState({
    isOpen: false,
    title: "",
    message: "",
    details: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-transition to active state when email is entered
    if (value && currentState === "inactive") {
      setCurrentState("active");
    } else if (!value && currentState === "active") {
      setCurrentState("inactive");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await forgotPassword(formData.email);

      if (response.success) {
        setCurrentState("email-sent");
      } else {
        // Show error in drawer
        setErrorDrawer({
          isOpen: true,
          title: "Something went wrong",
          message: response.message || "Failed to send reset email",
          details: response.error || "",
        });
      }
    } catch (error) {
      // Show error in drawer
      setErrorDrawer({
        isOpen: true,
        title: "Something went wrong",
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
    window.location.href = "/login";
  };

  const handleDrawerClose = () => {
    // Reset to active state when drawer is closed
    setCurrentState("active");
  };

  const isFormValid = formData.email && formData.email.includes("@");

  return (
    <div className="min-h-screen bg-[#181818] flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-start px-6 py-8">
        {/* Logo */}
        <div className="flex justify-center mb-8 mt-14">
          <img src="/Logo2.svg" alt="Lisar Logo" className="h-5 w-auto" />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Forgot password?
          </h2>
          <p className="text-white/70 text-lg">
            Welcome back! Please enter your details
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-white text-sm font-medium mb-2"
            >
              Enter Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@gmail.com"
              className={`w-full px-4 py-3 bg-[#121212] border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                currentState === "active" ||
                currentState === "email-sent" ||
                currentState === "success"
                  ? "border-[#C7EF6B]"
                  : "border-[#121212]"
              }`}
            />
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

        {/* Drawer for Email Sent and Success States */}
        <Drawer
          open={currentState === "email-sent" || currentState === "success"}
          onOpenChange={(open) => !open && handleDrawerClose()}
        >
          <DrawerContent>
            <DrawerHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-[#C7EF6B]/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-[#C7EF6B]" />
                </div>
              </div>
              <DrawerTitle>
                {currentState === "email-sent"
                  ? "Email has been sent"
                  : "Success!"}
              </DrawerTitle>
              <DrawerDescription>
                {currentState === "email-sent"
                  ? "A link has been sent to your e-mail. Please check to reset password"
                  : "Your password has been reset successfully"}
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              {currentState === "email-sent" ? (
                <button
                  onClick={handleDrawerClose}
                  className="w-full py-3 px-6 rounded-lg font-semibold text-lg bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors"
                >
                  Got it
                </button>
              ) : (
                <button
                  onClick={handleGoToLogin}
                  className="w-full py-3 px-6 rounded-lg font-semibold text-lg bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors"
                >
                  Go to login
                </button>
              )}
            </DrawerFooter> 
          </DrawerContent>
        </Drawer>

        {/* Footer Link */}
        <div className="text-center mt-8">
          <p className="text-white">
            Remember your password?{" "}
            <Link to="/login" className="text-[#C7EF6B] hover:underline">
              Log in
            </Link>
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
