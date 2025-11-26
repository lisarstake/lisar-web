import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import { SuccessDrawer } from "@/components/ui/SuccessDrawer";
import { LoadingSpinner } from "@/components/general/LoadingSpinner";
import { extractTokensFromHash, clearHashFromURL } from "@/lib/tokenExtractor";
import { EyeClosed, EyeIcon } from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signin, signinWithGoogle, handleGoogleCallback, state } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorDrawer, setErrorDrawer] = useState({
    isOpen: false,
    title: "",
    message: "",
    details: "",
  });
  const [successDrawer, setSuccessDrawer] = useState({
    isOpen: false,
    title: "",
    message: "",
    details: "",
  });

  const fromSignup = location.state?.fromSignup;

  useEffect(() => {

    if (!state.isLoading && state.isAuthenticated && !fromSignup) {
      navigate("/wallet", { replace: true });
    }
  }, [state.isLoading, state.isAuthenticated, navigate, location.state]);

  useEffect(() => {
    const tokens = extractTokensFromHash();
    if (tokens) {
      // Check if this is a Google OAuth token (has provider_token)
      if (tokens.provider_token) {
        handleGoogleOAuthLogin(tokens);
      } else {
        clearHashFromURL();

        localStorage.setItem(
          "pending_confirmation_tokens",
          JSON.stringify(tokens)
        );

        setSuccessDrawer({
          isOpen: true,
          title: "Email Confirmed!",
          message: "Your email has been successfully confirmed.",
          details: "",
        });
      }
    }
  }, []);

  const handleGoogleOAuthLogin = async (tokens: any) => {
    try {
      setIsSubmitting(true);

      localStorage.setItem("auth_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);

      if (tokens.expires_at) {
        localStorage.setItem("auth_expiry", tokens.expires_at.toString());
      }

      const response = await handleGoogleCallback();

      clearHashFromURL();

      if (response.success) {
        setSuccessDrawer({
          isOpen: true,
          title: "Sign-in Successful!",
          message: "You have successfully signed in with Google.",
          details: "",
        });

        setTimeout(() => {
          if (state.user?.is_onboarded === false) {
            navigate("/learn/what-is-lisar", { replace: true });
          } else {
            navigate("/wallet", { replace: true });
          }
        }, 1500);
      } else {
        throw new Error(response.message || "Google sign-in failed");
      }
    } catch (error) {
      // Show error drawer
      setErrorDrawer({
        isOpen: true,
        title: "Something went wrong",
        message: "Failed to process Google sign-in. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await signin(
        formData.email,
        formData.password,
        rememberMe
      );

      if (response.success) {
        setTimeout(() => {
          navigate("/wallet", { replace: true });
        }, 100);
      } else {
        setErrorDrawer({
          isOpen: true,
          title: "Something went wrong",
          message: response.error || "Invalid email or password",
          details: response.error || "",
        });
      }
    } catch (error) {
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

  const handleGoogleLogin = async () => {
    try {
      await signinWithGoogle();
    } catch (error) {
      setErrorDrawer({
        isOpen: true,
        title: "Something went wrong",
        message: "Failed to initiate Google sign-in. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const isFormValid = formData.email && formData.password;

  if (!fromSignup && state.isLoading && !isSubmitting) {
    return <LoadingSpinner message="Checking session..." />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/Logo2.svg" alt="Lisar Logo" className="h-5 w-auto" />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Log in to your account
          </h2>
          <p className="text-white/70 text-lg">
            Welcome back! Please enter your details
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
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
              className="w-full px-4 py-3 bg-[#121212] border border-[#121212] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#C7EF6B] transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-white text-sm font-medium mb-2"
            >
              Enter Your Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-[#121212] border border-[#121212] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#C7EF6B] transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeIcon className="w-5 h-5" />
                ) : (
                  <EyeClosed className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#C7EF6B] bg-[#121212] border-[#121212] rounded "
              />
              <span className="ml-2 text-white text-sm">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-[#C7EF6B] text-sm hover:underline"
            >
              Forgot password
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
              isFormValid && !isSubmitting
                ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
                : "bg-[#636363] text-white cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#121212]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-white">Or</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 px-6 rounded-lg font-semibold text-lg border-2 border-[#C7EF6B] bg-black text-white hover:bg-gray-800 transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-8">
          <p className="text-white">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#C7EF6B] hover:underline">
              Sign up
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
      />

      {/* Success Drawer */}
      <SuccessDrawer
        isOpen={successDrawer.isOpen}
        onClose={() => setSuccessDrawer({ ...successDrawer, isOpen: false })}
        title={successDrawer.title}
        message={successDrawer.message}
        details={successDrawer.details}
      />
    </div>
  );
};
