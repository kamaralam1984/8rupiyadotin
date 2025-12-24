"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user" as "admin" | "agent" | "operator" | "user",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Verify role matches selected account type
      if (data.user.role !== formData.role) {
        setError(`This account is registered as ${data.user.role}, not ${formData.role}. Please select the correct account type.`);
        setLoading(false);
        return;
      }

      // Redirect based on role
      const role = data.user.role;
      if (role === "admin") {
        router.push("/admin/dashboard");
      } else if (role === "agent") {
        router.push("/agent/dashboard");
      } else if (role === "operator") {
        router.push("/operator/dashboard");
      } else {
        router.push("/user/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-zinc-800/40 via-zinc-800/30 to-zinc-900/40 p-8 backdrop-blur-xl shadow-2xl shadow-amber-500/10">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent">
              8Rupiya
            </h1>
            <h2 className="text-2xl font-semibold text-white">Login</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Account Type
              </label>
              <select
                id="role"
                required
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as "admin" | "agent" | "operator" | "user",
                  })
                }
                className="w-full rounded-lg border border-amber-500/30 bg-zinc-800/50 px-4 py-3 text-white backdrop-blur-sm transition-all duration-300 focus:border-amber-500/60 focus:bg-zinc-800/70 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="user">User</option>
                <option value="agent">Agent</option>
                <option value="operator">Operator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded-lg border border-amber-500/30 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-400 backdrop-blur-sm transition-all duration-300 focus:border-amber-500/60 focus:bg-zinc-800/70 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full rounded-lg border border-amber-500/30 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-400 backdrop-blur-sm transition-all duration-300 focus:border-amber-500/60 focus:bg-zinc-800/70 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 px-6 py-3 text-sm font-semibold text-amber-400 transition-all duration-300 hover:border-amber-500/50 hover:bg-amber-500/20 hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-amber-400 transition-colors hover:text-amber-300"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

