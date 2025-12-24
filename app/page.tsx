"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Sample business data
const featuredBusinesses = [
  {
    id: 1,
    name: "Premium Restaurant & Bar",
    category: "Restaurant",
    rating: 4.8,
    distance: "0.5 km",
    time: "5 min",
    badge: "Top Rated",
    image: "/next.svg",
    description: "Fine dining experience with authentic cuisine",
  },
  {
    id: 2,
    name: "Elite Fashion Boutique",
    category: "Fashion",
    rating: 4.9,
    distance: "1.2 km",
    time: "8 min",
    badge: "Popular",
    image: "/next.svg",
    description: "Latest fashion trends and designer collections",
  },
  {
    id: 3,
    name: "Luxury Spa & Wellness",
    category: "Wellness",
    rating: 4.7,
    distance: "0.8 km",
    time: "6 min",
    badge: "Nearby",
    image: "/next.svg",
    description: "Relax and rejuvenate with premium spa services",
  },
];

const featuredShops = [
  {
    id: 1,
    name: "Tech Solutions Hub",
    category: "Electronics",
    rating: 4.6,
    distance: "2.1 km",
    image: "/next.svg",
  },
  {
    id: 2,
    name: "Gourmet Coffee Shop",
    category: "Cafe",
    rating: 4.8,
    distance: "0.9 km",
    image: "/next.svg",
  },
  {
    id: 3,
    name: "Fitness Center Pro",
    category: "Fitness",
    rating: 4.7,
    distance: "1.5 km",
    image: "/next.svg",
  },
  {
    id: 4,
    name: "Art Gallery Modern",
    category: "Arts",
    rating: 4.9,
    distance: "3.2 km",
    image: "/next.svg",
  },
];

const nearbyShops = [
  {
    id: 1,
    name: "Quick Mart",
    category: "Grocery",
    rating: 4.5,
    distance: "0.3 km",
    image: "/next.svg",
  },
  {
    id: 2,
    name: "Beauty Salon Elite",
    category: "Beauty",
    rating: 4.6,
    distance: "0.7 km",
    image: "/next.svg",
  },
  {
    id: 3,
    name: "Book Store Central",
    category: "Books",
    rating: 4.4,
    distance: "1.1 km",
    image: "/next.svg",
  },
  {
    id: 4,
    name: "Pharmacy 24/7",
    category: "Health",
    rating: 4.7,
    distance: "0.5 km",
    image: "/next.svg",
  },
  {
    id: 5,
    name: "Pet Care Center",
    category: "Pet Care",
    rating: 4.8,
    distance: "1.8 km",
    image: "/next.svg",
  },
  {
    id: 6,
    name: "Auto Repair Shop",
    category: "Automotive",
    rating: 4.3,
    distance: "2.3 km",
    image: "/next.svg",
  },
];

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
  pincode?: string;
  city?: string;
  owner?: string;
  views?: number;
};

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyShopsData, setNearbyShopsData] = useState<NearbyShop[]>([]);
  const [leftRailShops, setLeftRailShops] = useState<NearbyShop[]>([]);
  const [rightRailShops, setRightRailShops] = useState<NearbyShop[]>([]);
  const [heroShops, setHeroShops] = useState<NearbyShop[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchType, setSearchType] = useState<"category" | "pincode" | "search">("category");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [pincode, setPincode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NearbyShop[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Get user location - Optimized with parallel requests
  const getNearby = async (lat: number, lng: number) => {
    try {
      // Fetch all shops in parallel for faster loading
      const [generalResponse, leftResponse, rightResponse, heroResponse] = await Promise.all([
        fetch(`/api/nearby?lat=${lat}&lng=${lng}`),
        fetch(`/api/nearby?lat=${lat}&lng=${lng}&rail=left`),
        fetch(`/api/nearby?lat=${lat}&lng=${lng}&rail=right`),
        fetch(`/api/nearby?lat=${lat}&lng=${lng}&rail=hero`),
      ]);

      const [shops, leftShops, rightShops, heroShopsData] = await Promise.all([
        generalResponse.json(),
        leftResponse.json(),
        rightResponse.json(),
        heroResponse.json(),
      ]);

      if (!shops.error) setNearbyShopsData(Array.isArray(shops) ? shops : []);
      if (!leftShops.error) setLeftRailShops(Array.isArray(leftShops) ? leftShops : []);
      if (!rightShops.error) setRightRailShops(Array.isArray(rightShops) ? rightShops : []);
      if (!heroShopsData.error) setHeroShops(Array.isArray(heroShopsData) ? heroShopsData : []);
    } catch (error) {
      console.error("Error fetching nearby shops:", error);
    }
  };

  // Fetch categories from database - Lazy load after initial render
  useEffect(() => {
    // Delay category fetch to prioritize critical content
    const timer = setTimeout(() => {
      const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
          const response = await fetch("/api/shops/categories");
          const data = await response.json();
          if (data.error) {
            setCategories([]);
          } else {
            setCategories(Array.isArray(data) ? data : []);
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
          setCategories([]);
        } finally {
          setLoadingCategories(false);
        }
      };
      fetchCategories();
    }, 100); // Small delay to not block initial render

    return () => clearTimeout(timer);
  }, []);

  // Get user location and fetch nearby shops - Optimized for fast initial load
  useEffect(() => {
    // Use default location immediately for faster initial load
    const defaultLat = 28.6139;
    const defaultLng = 77.209;
    setUserLocation({ lat: defaultLat, lng: defaultLng });
    getNearby(defaultLat, defaultLng);

    // Then try to get actual location in background
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
          getNearby(lat, lng);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Keep using default location
        },
        {
          timeout: 5000,
          maximumAge: 300000, // Cache for 5 minutes
        }
      );
    }
  }, []);

  useEffect(() => {
    if (heroShops.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroShops.length);
      }, 5000);
      return () => clearInterval(interval);
    }
    // Reset slide when heroShops changes
    if (heroShops.length > 0) {
      setCurrentSlide(0);
    }
  }, [heroShops]);

  // Search shops function
  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchType === "category" && selectedCategory) {
        params.set("category", selectedCategory);
      } else if (searchType === "pincode" && pincode) {
        params.set("pincode", pincode);
      } else if (searchType === "search" && searchQuery) {
        params.set("search", searchQuery);
      }

      const response = await fetch(`/api/shops/search?${params.toString()}`);
      const data = await response.json();
      if (data.error) {
        console.error("Search Error:", data.error);
        setSearchResults([]);
      } else {
        setSearchResults(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error searching shops:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950">
      {/* Top Section - Slider and Find Shop Search */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Side - Slider */}
          <div className="relative h-[280px] overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-zinc-800/80 via-zinc-800/60 to-zinc-900/80 backdrop-blur-xl shadow-2xl shadow-amber-500/10 md:h-[350px]">
            {heroShops.length > 0 ? (
              <>
                {heroShops.map((shop, index) => (
                  <div
                    key={shop.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {/* Background Image */}
                    {shop.photoUrl && (
                      <div className="absolute inset-0">
                        <Image
                          src={shop.photoUrl}
                          alt={shop.name}
                          fill
                          className="object-cover"
                          sizes="100vw"
                          priority={index === currentSlide}
                          quality={90}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/30 via-zinc-900/20 to-zinc-900/40" />
                      </div>
                    )}
                    <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-12">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-amber-500/50 bg-amber-500/20 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-sm">
                          Nearby
                        </span>
                        <span className="rounded-full border border-amber-500/50 bg-amber-500/20 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-sm">
                          {typeof shop.distance === "number"
                            ? `${shop.distance.toFixed(1)} km`
                            : shop.distance}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="mb-2 inline-block rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                            {shop.category}
                          </span>
                          <h2 className="mt-2 text-3xl font-bold text-white md:text-5xl">
                            {shop.name}
                          </h2>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-5 w-5 ${
                                  i < Math.floor(shop.rating)
                                    ? "text-amber-400"
                                    : "text-zinc-600"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-lg font-semibold text-amber-400">
                            {shop.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Slider Dots */}
                {heroShops.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                    {heroShops.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentSlide
                            ? "w-8 bg-amber-400"
                            : "w-2 bg-zinc-600"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : loadingLocation ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-2 text-amber-400">📍</div>
                  <div className="text-sm text-zinc-400">Loading nearby shops...</div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="text-lg text-zinc-400">No hero shops found nearby</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Find Shop Search */}
          <div className="relative h-[280px] overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-zinc-800/40 via-zinc-800/30 to-zinc-900/40 p-6 backdrop-blur-xl shadow-xl shadow-amber-500/5 md:h-[350px] md:p-8">
            {/* Search Type Buttons */}
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setSearchType("category")}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                  searchType === "category"
                    ? "border-amber-500/50 bg-amber-500/20 text-amber-400"
                    : "border-amber-500/20 bg-zinc-800/50 text-zinc-300 hover:border-amber-500/40 hover:bg-amber-500/10"
                }`}
              >
                Category
              </button>
              <button
                onClick={() => setSearchType("pincode")}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                  searchType === "pincode"
                    ? "border-amber-500/50 bg-amber-500/20 text-amber-400"
                    : "border-amber-500/20 bg-zinc-800/50 text-zinc-300 hover:border-amber-500/40 hover:bg-amber-500/10"
                }`}
              >
                Pincode
              </button>
              <button
                onClick={() => setSearchType("search")}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                  searchType === "search"
                    ? "border-amber-500/50 bg-amber-500/20 text-amber-400"
                    : "border-amber-500/20 bg-zinc-800/50 text-zinc-300 hover:border-amber-500/40 hover:bg-amber-500/10"
                }`}
              >
                Search
              </button>
            </div>

            {/* Search Input and Button */}
            <div className="mb-6 flex gap-3">
              {searchType === "category" && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={loadingCategories}
                  className="flex-1 rounded-lg border border-amber-500/30 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-400 backdrop-blur-sm transition-all duration-300 focus:border-amber-500/60 focus:bg-zinc-800/70 focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingCategories ? "Loading categories..." : "Select Category"}
                  </option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              )}

              {searchType === "pincode" && (
                <input
                  type="text"
                  placeholder="Enter Pincode (6 digits)"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  maxLength={6}
                  className="flex-1 rounded-lg border border-amber-500/30 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-400 backdrop-blur-sm transition-all duration-300 focus:border-amber-500/60 focus:bg-zinc-800/70 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              )}

              {searchType === "search" && (
                <input
                  type="text"
                  placeholder="Search shop name, service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 rounded-lg border border-amber-500/30 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-400 backdrop-blur-sm transition-all duration-300 focus:border-amber-500/60 focus:bg-zinc-800/70 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              )}

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="whitespace-nowrap rounded-lg border border-amber-500/30 bg-amber-500/10 px-6 py-3 text-sm font-semibold text-amber-400 transition-all duration-300 hover:border-amber-500/50 hover:bg-amber-500/20 hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searchLoading ? "Searching..." : "Search Shops"}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-6 max-h-96 space-y-3 overflow-y-auto scrollbar-thin">
                <h3 className="mb-4 text-sm font-semibold text-white">
                  Search Results ({searchResults.length})
                </h3>
                {searchResults.map((shop) => (
                  <a
                    key={shop.id}
                    href={`/shop/${shop.shopUrl || shop.id}`}
                    className="block overflow-hidden rounded-lg border border-amber-500/20 bg-zinc-800/50 p-3 transition-all duration-300 hover:border-amber-500/40 hover:bg-amber-500/10"
                  >
                    {/* Shop Image */}
                    {shop.photoUrl && (
                      <div className="relative mb-2 h-20 w-full overflow-hidden rounded">
                        <Image
                          src={shop.photoUrl}
                          alt={shop.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 300px"
                        />
                      </div>
                    )}
                    <div className="mb-1 text-sm font-semibold text-white line-clamp-1">
                      {shop.name}
                    </div>
                    <div className="mb-2 text-xs text-amber-400">{shop.category}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <svg
                          className="h-3 w-3 text-amber-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs font-semibold text-amber-400">
                          {shop.rating}
                        </span>
                      </div>
                      {shop.pincode && (
                        <span className="text-xs text-zinc-400">{shop.pincode}</span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}

            {searchResults.length === 0 && !searchLoading && (
              <div className="mt-6 text-center text-sm text-zinc-400">
                Search for shops using category, pincode, or search query
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Hero Section with Left and Right Rails */}
      <section className="relative mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left Rail */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              {/* Nearby Shops in Left Rail */}
              <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-800/40 via-zinc-800/30 to-zinc-900/40 p-6 backdrop-blur-xl shadow-xl shadow-amber-500/5">
                <h3 className="mb-4 text-lg font-semibold text-white">Nearby Shops</h3>
                {loadingLocation ? (
                  <div className="text-center py-4">
                    <div className="text-sm text-zinc-400">Loading...</div>
                  </div>
                ) : leftRailShops.length > 0 ? (
                  <div className="space-y-3">
                    {leftRailShops.map((shop) => (
                      <a
                        key={shop.id}
                        href={`/shop/${shop.shopUrl || shop.id}`}
                        className="block overflow-hidden rounded-lg border border-amber-500/20 bg-zinc-800/50 transition-all duration-300 hover:border-amber-500/40 hover:bg-amber-500/10"
                      >
                        {/* Shop Image */}
                        {shop.photoUrl && (
                          <div className="relative h-24 w-full overflow-hidden">
                            <Image
                              src={shop.photoUrl}
                              alt={shop.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 200px"
                            />
                          </div>
                        )}
                        <div className="p-3">
                          <div className="mb-1 text-sm font-semibold text-white line-clamp-1">
                            {shop.name}
                          </div>
                          <div className="mb-2 text-xs text-amber-400">{shop.category}</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <svg
                                className="h-3 w-3 text-amber-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-xs font-semibold text-amber-400">
                                {shop.rating}
                              </span>
                            </div>
                            <span className="text-xs text-zinc-400">
                              {typeof shop.distance === "number"
                                ? `${shop.distance.toFixed(1)} km`
                                : shop.distance}
                            </span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-sm text-zinc-400">No nearby shops found</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hero Slider - Center */}
          <div className="lg:col-span-8">
            <div className="relative h-[400px] overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-zinc-800/80 via-zinc-800/60 to-zinc-900/80 backdrop-blur-xl shadow-2xl shadow-amber-500/10 md:h-[500px]">
              {loadingLocation ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mb-2 text-amber-400">📍</div>
                    <div className="text-sm text-zinc-400">Loading nearby shops...</div>
                  </div>
                </div>
              ) : heroShops.length > 0 ? (
                <>
                  {heroShops.map((shop, index) => (
                    <div
                      key={shop.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentSlide ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {/* Background Image */}
                      {shop.photoUrl && (
                        <div className="absolute inset-0">
                          <Image
                            src={shop.photoUrl}
                            alt={shop.name}
                            fill
                            className="object-cover"
                            sizes="100vw"
                            priority={index === currentSlide}
                            quality={90}
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/30 via-zinc-900/20 to-zinc-900/40" />
                        </div>
                      )}
                      <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-12">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full border border-amber-500/50 bg-amber-500/20 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-sm">
                            Nearby
                          </span>
                          <span className="rounded-full border border-amber-500/50 bg-amber-500/20 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-sm">
                            {typeof shop.distance === "number"
                              ? `${shop.distance.toFixed(1)} km`
                              : shop.distance}
                          </span>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <span className="mb-2 inline-block rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                              {shop.category}
                            </span>
                            <h2 className="mt-2 text-3xl font-bold text-white md:text-5xl">
                              {shop.name}
                            </h2>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-5 w-5 ${
                                    i < Math.floor(shop.rating)
                                      ? "text-amber-400"
                                      : "text-zinc-600"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-lg font-semibold text-amber-400">
                              {shop.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Slider Dots */}
                  {heroShops.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                      {heroShops.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentSlide
                              ? "w-8 bg-amber-400"
                              : "w-2 bg-zinc-600"
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg text-zinc-400">No hero shops found nearby</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Rail */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              {/* Nearby Shops in Right Rail */}
              <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-800/40 via-zinc-800/30 to-zinc-900/40 p-6 backdrop-blur-xl shadow-xl shadow-amber-500/5">
                <h3 className="mb-4 text-lg font-semibold text-white">Nearby Shops</h3>
                {loadingLocation ? (
                  <div className="text-center py-4">
                    <div className="text-sm text-zinc-400">Loading...</div>
                  </div>
                ) : rightRailShops.length > 0 ? (
                  <div className="space-y-3">
                    {rightRailShops.map((shop) => (
                      <a
                        key={shop.id}
                        href={`/shop/${shop.shopUrl || shop.id}`}
                        className="block overflow-hidden rounded-lg border border-amber-500/20 bg-zinc-800/50 transition-all duration-300 hover:border-amber-500/40 hover:bg-amber-500/10"
                      >
                        {/* Shop Image */}
                        {shop.photoUrl && (
                          <div className="relative h-24 w-full overflow-hidden">
          <Image
                              src={shop.photoUrl}
                              alt={shop.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 200px"
                            />
                          </div>
                        )}
                        <div className="p-3">
                          <div className="mb-1 text-sm font-semibold text-white line-clamp-1">
                            {shop.name}
                          </div>
                          <div className="mb-2 text-xs text-amber-400">{shop.category}</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <svg
                                className="h-3 w-3 text-amber-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-xs font-semibold text-amber-400">
                                {shop.rating}
                              </span>
                            </div>
                            <span className="text-xs text-zinc-400">
                              {typeof shop.distance === "number"
                                ? `${shop.distance.toFixed(1)} km`
                                : shop.distance}
                            </span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-sm text-zinc-400">No nearby shops found</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Rail */}
        <div className="mt-6 w-full">
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-800/40 via-zinc-800/30 to-zinc-900/40 p-6 backdrop-blur-xl shadow-xl shadow-amber-500/5">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {[
                { icon: "🍽️", label: "Restaurants", count: "1.2K" },
                { icon: "🛍️", label: "Shopping", count: "856" },
                { icon: "💆", label: "Beauty & Spa", count: "432" },
                { icon: "🏥", label: "Healthcare", count: "678" },
                { icon: "🎓", label: "Education", count: "234" },
                { icon: "🚗", label: "Automotive", count: "189" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-amber-500/20 bg-zinc-800/50 p-4 transition-all duration-300 hover:border-amber-500/40 hover:bg-amber-500/10 hover:shadow-lg hover:shadow-amber-500/10"
                >
                  <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                    {item.icon}
                  </span>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-white transition-colors group-hover:text-amber-400">
                      {item.label}
                    </div>
                    <div className="text-xs text-zinc-400">{item.count} places</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Shops Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Featured Shops
          </h2>
          <a
            href="/shops"
            className="text-sm font-medium text-amber-400 transition-colors hover:text-amber-300"
          >
            View All →
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {nearbyShopsData.length > 0
            ? nearbyShopsData.slice(0, 4).map((shop) => (
                <a
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
                </a>
              ))
            : featuredShops.map((shop) => (
                <div
                  key={shop.id}
                  className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-800/40 via-zinc-800/30 to-zinc-900/40 p-6 backdrop-blur-xl shadow-xl shadow-amber-500/5 transition-all duration-300 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10"
                >
                  {/* Glassmorphism Effect */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative z-10">
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
                      <span>{shop.distance}</span>
                    </div>
                  </div>
                </div>
              ))}
        </div>
        </section>

      {/* Nearby Shops Section - Horizontal Scroll */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Nearby Shops
          </h2>
          <a
            href="/shops"
            className="text-sm font-medium text-amber-400 transition-colors hover:text-amber-300"
          >
            View All →
          </a>
        </div>

        <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-4">
          {loadingLocation ? (
            <div className="flex min-w-[280px] items-center justify-center rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-800/40 via-zinc-800/30 to-zinc-900/40 p-6 backdrop-blur-xl">
              <div className="text-center">
                <div className="mb-2 text-amber-400">📍</div>
                <div className="text-sm text-zinc-400">Loading location...</div>
              </div>
            </div>
          ) : nearbyShopsData.length > 0 ? (
            nearbyShopsData.map((shop) => (
              <a
                key={shop.id}
                href={`/shop/${shop.shopUrl || shop.id}`}
                className="group relative flex min-w-[280px] flex-col overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-800/40 via-zinc-800/30 to-zinc-900/40 backdrop-blur-xl shadow-xl shadow-amber-500/5 transition-all duration-300 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10"
              >
                {/* Shop Image */}
                {shop.photoUrl && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={shop.photoUrl}
                      alt={shop.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 280px"
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
              </a>
            ))
          ) : (
            nearbyShops.map((shop) => (
              <div
                key={shop.id}
                className="group relative flex min-w-[280px] flex-col overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-800/40 via-zinc-800/30 to-zinc-900/40 p-6 backdrop-blur-xl shadow-xl shadow-amber-500/5 transition-all duration-300 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10"
              >
                {/* Glassmorphism Effect */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10">
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
                    <span>{shop.distance}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        </section>
    </div>
  );
}
