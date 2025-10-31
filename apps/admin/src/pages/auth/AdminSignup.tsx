import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signupAdmin } from "@/services/adminAuth";
import { useNavigate, Link } from "react-router-dom";

export const AdminSignup: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = signupAdmin(name, email, password);
    setLoading(false);
    if (res.success) navigate("/admin");
    else setError(res.message || "Signup failed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <Card className="bg-white w-full max-w-md">
        <CardContent className="p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Create Admin</h1>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">Create an admin account.</p>
          <form onSubmit={submit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="text-xs sm:text-sm text-gray-700 block mb-1">Full name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Admin" className="text-sm" />
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-700 block mb-1">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="text-sm" />
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-700 block mb-1">Password</label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="text-sm" />
            </div>
            {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full text-sm sm:text-base" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
          </form>
          <div className="text-xs sm:text-sm text-gray-600 mt-4 text-center sm:text-left">
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
