import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { SuccessDrawer } from "@/components/ui/SuccessDrawer";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import { EyeClosed, EyeIcon } from "lucide-react";

export const AdminSignup: React.FC = () => {
  const navigate = useNavigate();
  const { createWallet } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    "Admin account created successfully"
  );
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("An error occurred");

  const isFormValid = name && email && password.length >= 8;

  // Auto-redirect after 2 seconds when success opens
  useEffect(() => {
    if (successOpen) {
      const timer = setTimeout(() => {
        setSuccessOpen(false);
        navigate("/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successOpen, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await createWallet(email, password, name);
      if (res.success) {
        setSuccessMessage("Admin account created successfully");
        setSuccessOpen(true);
      } else {
        const msg = res.error || "Signup failed";
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
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src="/Logo.svg" alt="Lisar Logo" className="h-5 w-auto" />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create an admin account
            </h2>
            <p className="text-gray-600 text-lg">
              Enter details to add a new admin
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-gray-900 text-sm font-medium mb-2"
              >
                Enter Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Admin"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#235538] transition-colors"
              />
            </div>

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
                Set Your Password
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
              {password && password.length < 8 && (
                <div className="flex items-center mt-2 text-yellow-600 text-sm">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Must be at least 8 characters
                </div>
              )}
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
                isFormValid && !isSubmitting
                  ? "bg-[#235538] text-white hover:bg-[#3b925f]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
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
              Already have an admin account?{" "}
              <Link to="/login" className="text-[#235538] hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Drawers - Conditionally rendered to avoid React hook errors */}
      {errorOpen && (
        <ErrorDrawer
          isOpen={errorOpen}
          onClose={() => setErrorOpen(false)}
          message={errorMessage}
        />
      )}
      {successOpen && (
        <SuccessDrawer
          isOpen={successOpen}
          onClose={() => {
            setSuccessOpen(false);
            navigate("/login");
          }}
          message={successMessage}
        />
      )}
    </>
  );
};
