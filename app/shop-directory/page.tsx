"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type Shop = {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: number;
  photoUrl?: string;
  shopUrl?: string;
  owner?: string;
  views?: number;
  pincode?: string;
  city?: string;
};

export default function ShopDirectoryPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedPincode, setSelectedPincode] = useState("All Pincodes");
  const [categories, setCategories] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [pincodes, setPincodes] = useState<string[]>([]);

  // Fetch categories, cities, and pincodes
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Fetch categories
        const catResponse = await fetch("/api/shops/categories");
        const catData = await catResponse.json();
        if (Array.isArray(catData)) {
          setCategories(catData);
        }

        // Fetch all shops to extract cities and pincodes
        // This could be optimized with a separate API endpoint
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };
    fetchFilters();
  }, []);

  // Get user location and fetch shops
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
        setShops([]);
      } else {
        const shopsData = Array.isArray(data) ? data : [];
        setShops(shopsData);
        setFilteredShops(shopsData);
        
        // Extract unique cities and pincodes
        const uniqueCities = [...new Set(shopsData.map((s: Shop) => s.city).filter(Boolean))] as string[];
        const uniquePincodes = [...new Set(shopsData.map((s: Shop) => s.pincode).filter(Boolean))] as string[];
        setCities(uniqueCities.sort());
        setPincodes(uniquePincodes.sort());
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter shops based on search and filters
  useEffect(() => {
    let filtered = [...shops];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (shop) =>
          shop.name.toLowerCase().includes(query) ||
          shop.category.toLowerCase().includes(query) ||
          shop.owner?.toLowerCase().includes(query) ||
          shop.pincode?.includes(query) ||
          shop.city?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter((shop) => shop.category === selectedCategory);
    }

    // City filter
    if (selectedCity !== "All Cities") {
      filtered = filtered.filter((shop) => shop.city === selectedCity);
    }

    // Pincode filter
    if (selectedPincode !== "All Pincodes") {
      filtered = filtered.filter((shop) => shop.pincode === selectedPincode);
    }

    setFilteredShops(filtered);
  }, [searchQuery, selectedCategory, selectedCity, selectedPincode, shops]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedCity("All Cities");
    setSelectedPincode("All Pincodes");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <h1 className="text-4xl font-bold text-white md:text-5xl">Shop Directory</h1>
          <p className="mt-2 text-lg text-white/90">
            Discover and explore local shops near you
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {/* Search & Filter Section */}
        <div className="mb-8 rounded-2xl border border-amber-500/20 bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Search & Filter</h2>
          
          {/* Search Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by shop name, owner, category, area, city, pincode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Category Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="All Categories">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="All Cities">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Pincode Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Pincode</label>
              <select
                value={selectedPincode}
                onChange={(e) => setSelectedPincode(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="All Pincodes">All Pincodes</option>
                {pincodes.map((pin) => (
                  <option key={pin} value={pin}>
                    {pin}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={clearFilters}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Clear Filters
              </button>
              <button className="rounded-lg border border-amber-500 bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600">
                List View
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredShops.length} of {shops.length} shops
            </div>
          </div>
        </div>

        {/* Shops Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mb-4 text-amber-400">📍</div>
              <div className="text-lg text-zinc-400">Loading shops...</div>
            </div>
          </div>
        ) : filteredShops.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl"
              >
                {/* Shop Image */}
                {shop.photoUrl ? (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={shop.photoUrl}
                      alt={shop.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200">
                    <div className="text-4xl font-bold text-amber-600">
                      {shop.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}

                {/* Shop Info */}
                <div className="p-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-800 line-clamp-1">
                    {shop.name}
                  </h3>
                  
                  <p className="mb-2 text-sm text-gray-600">
                    Owner: {shop.owner || "N/A"}
                  </p>
                  
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                      {shop.category}
                    </span>
                  </div>

                  <div className="mb-2 text-xs text-gray-500">
                    ID: {shop.id}
                  </div>

                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <svg
                        className="h-4 w-4 text-amber-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-800">
                        {shop.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({Math.floor(Math.random() * 50) + 1} ratings)
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {shop.views || Math.floor(Math.random() * 10)} views
                    </div>
                  </div>

                  <Link
                    href={`/shop/${shop.shopUrl || shop.id}`}
                    className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    View Shop
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-lg text-zinc-400">No shops found</div>
              <button
                onClick={clearFilters}
                className="mt-4 text-amber-400 hover:text-amber-300"
              >
                Clear filters to see all shops
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

