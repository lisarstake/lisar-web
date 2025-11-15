import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import { LoadingSpinner } from "@/components/general/LoadingSpinner";
import { EyeClosed, EyeIcon } from "lucide-react";
import { isProduction } from "@/lib/utils";

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { signin, state } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("An error occurred");

  useEffect(() => {
    if (!state.isLoading && state.isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [state.isLoading, state.isAuthenticated, navigate]);

  const isFormValid = email && password;

  if (state.isLoading) {
    return <LoadingSpinner message="Checking session..." />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await signin(email, password, rememberMe);
      if (res.success) {
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 100);
      } else {
        const msg = res.error || "Invalid email or password";
        setErrorMessage(msg);
        setErrorOpen(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setErrorMessage(msg);
      setErrorOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
                Log in to your account
              </h2>
              <p className="text-gray-600 text-lg">
                Welcome back! Please enter your details
              </p>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-900 text-sm font-medium mb-2"
                >
                  Enter Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#235538] transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-gray-900 text-sm font-medium mb-2"
                >
                  Enter Your Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#235538] transition-colors"
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
                    className="w-4 h-4 text-[#235538] bg-gray-50 border-gray-300 rounded focus:ring-[#235538] focus:ring-2"
                  />
                  <span className="ml-2 text-gray-900 text-sm">
                    Remember for 30 days
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[#235538] text-sm hover:underline"
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
                    ? "bg-[#235538] text-white hover:bg-[#1d4530]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>

              {/* Divider (no Google for admin) */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>
            </form>

            {/* Footer Link */}

            <div className="text-center mt-8">
              <p className="text-gray-900">
                Don't have an admin account?{" "}
                <Link to="/signup" className="text-[#235538] hover:underline">
                  Create admin
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Drawers */}
      {errorOpen && (
        <ErrorDrawer
          isOpen={errorOpen}
          onClose={() => setErrorOpen(false)}
          message={errorMessage}
        />
      )}
    </>
  );
};
