"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        router.push("/login");
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950">
        <div className="text-center">
          <div className="mb-4 text-amber-400">⏳</div>
          <div className="text-lg text-zinc-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              User Dashboard
            </h1>
            <p className="mt-2 text-zinc-400">
              Welcome, {user?.name}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/shop-directory"
            className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-800/40 via-zinc-800/30 to-zinc-900/40 p-6 backdrop-blur-xl transition-all hover:border-amber-500/40"
          >
            <h3 className="mb-4 text-xl font-semibold text-white">Browse Shops</h3>
            <p className="text-zinc-400">Explore nearby shops</p>
          </Link>

          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-800/40 via-zinc-800/30 to-zinc-900/40 p-6 backdrop-blur-xl">
            <h3 className="mb-4 text-xl font-semibold text-white">Favorites</h3>
            <p className="text-zinc-400">Your saved shops</p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-800/40 via-zinc-800/30 to-zinc-900/40 p-6 backdrop-blur-xl">
            <h3 className="mb-4 text-xl font-semibold text-white">Profile</h3>
            <p className="text-zinc-400">Manage your profile</p>
          </div>
        </div>
      </div>
    </div>
  );
}

