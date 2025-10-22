import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface ForgotPasswordFormData {
  email: string;
}

type ForgotPasswordState = 'inactive' | 'active' | 'email-sent' | 'success';

export const ForgotPasswordForm: React.FC = () => {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });

  const [currentState, setCurrentState] = useState<ForgotPasswordState>('inactive');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Auto-transition to active state when email is entered
    if (value && currentState === 'inactive') {
      setCurrentState('active');
    } else if (!value && currentState === 'active') {
      setCurrentState('inactive');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email) {
      // Simulate API call
      setTimeout(() => {
        setCurrentState('email-sent');
      }, 1000);
    }
  };

  const handleProceedToReset = () => {
    // Simulate password reset process
    setTimeout(() => {
      setCurrentState('success');
    }, 1000);
  };

  const handleGoToLogin = () => {
    // Navigate to login page
    window.location.href = '/login';
  };

  const handleDrawerClose = () => {
    // Reset to active state when drawer is closed
    setCurrentState('active');
  };

  const isFormValid = formData.email && formData.email.includes('@');

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
                currentState === 'active' || currentState === 'email-sent' || currentState === 'success'
                  ? 'border-[#C7EF6B]'
                  : 'border-[#121212]'
              }`}
            />
          </div>

          {/* Reset Password Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
              isFormValid
                ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
                : "bg-[#636363] text-white cursor-not-allowed"
            }`}
          >
            Reset password
          </button>
        </form>

        {/* Drawer for Email Sent and Success States */}
        <Drawer open={currentState === 'email-sent' || currentState === 'success'} onOpenChange={(open) => !open && handleDrawerClose()}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                {currentState === 'email-sent' ? 'Email has been sent' : 'Success!'}
              </DrawerTitle>
              <DrawerDescription>
                {currentState === 'email-sent' 
                  ? 'A link has been sent to your e-mail. Please check to reset password'
                  : 'Your password has been reset successfully'
                }
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              {currentState === 'email-sent' ? (
                <button
                  onClick={handleProceedToReset}
                  className="w-full py-3 px-6 rounded-lg font-semibold text-lg bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors"
                >
                  Proceed to reset password
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
    </div>
  );
};
