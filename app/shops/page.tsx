"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type NearbyShop = {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: number;
  photoUrl?: string;
  shopUrl?: string;
  planType?: string;
  location?: { lat: number; lng: number };
};

export default function ShopsPage() {
  const [shops, setShops] = useState<NearbyShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
          fetchShops(lat, lng);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to default location (Delhi)
          const defaultLat = 28.6139;
          const defaultLng = 77.209;
          setUserLocation({ lat: defaultLat, lng: defaultLng });
          fetchShops(defaultLat, defaultLng);
        }
      );
    } else {
      // Fallback to default location
      const defaultLat = 28.6139;
      const defaultLng = 77.209;
      setUserLocation({ lat: defaultLat, lng: defaultLng });
      fetchShops(defaultLat, defaultLng);
    }
  }, []);

  const fetchShops = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/nearby?lat=${lat}&lng=${lng}`);
      const data = await response.json();
      if (data.error) {
        console.error("API Error:", data.error);
      } else {
        setShops(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-amber-400 transition-colors hover:text-amber-300"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-white md:text-4xl">All Shops</h1>
          <p className="mt-2 text-zinc-400">
            {loading
              ? "Loading shops..."
              : `${shops.length} shops found nearby`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mb-4 text-amber-400">📍</div>
              <div className="text-lg text-zinc-400">Loading shops...</div>
            </div>
          </div>
        ) : shops.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shops.map((shop) => (
              <Link
                key={shop.id}
                href={`/shop/${shop.shopUrl || shop.id}`}
                className="group relative block overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-800/40 via-zinc-800/30 to-zinc-900/40 backdrop-blur-xl shadow-xl shadow-amber-500/5 transition-all duration-300 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10"
              >
                {/* Shop Image */}
                {shop.photoUrl && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={shop.photoUrl}
                      alt={shop.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                )}
                {/* Glassmorphism Effect */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10 p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                      {shop.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <svg
                        className="h-4 w-4 text-amber-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-semibold text-amber-400">
                        {shop.rating}
                      </span>
                    </div>
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-white transition-colors group-hover:text-amber-300">
                    {shop.name}
                  </h3>

                  <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>
                      {typeof shop.distance === "number"
                        ? `${shop.distance.toFixed(1)} km`
                        : shop.distance}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-lg text-zinc-400">No shops found nearby</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

