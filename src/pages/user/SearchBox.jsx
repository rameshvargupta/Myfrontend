import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, TrendingUp, Clock, X, Star, Mic, MicOff, ShoppingBag } from "lucide-react";
import RecentlyViewed from "./RecentlyViewed";
import FooterNavbar from "@/components/user/FooterNavbar";

const API_URL = import.meta.env.VITE_API_URL;

const SearchBox = () => {
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState([]);
    const [popular, setPopular] = useState([]);
    const [recent, setRecent] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const navigate = useNavigate();
    const searchTimeout = useRef(null);
    const recognitionRef = useRef(null);

    // Load recent searches from localStorage
    useEffect(() => {
        const storedSearches = localStorage.getItem("recentSearches");
        if (storedSearches) {
            setRecentSearches(JSON.parse(storedSearches));
        }
    }, []);

    // Save recent search
    const saveRecentSearch = useCallback((searchTerm) => {
        if (!searchTerm?.trim()) return;
        const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
    }, [recentSearches]);

    // Fetch popular products
    useEffect(() => {
        const fetchPopular = async () => {
            try {
                const res = await fetch(`${API_URL}/api/v1/products?sort=-soldCount&limit=8`);
                const data = await res.json();
                if (data.success) {
                    setPopular(data.products || []);
                }
            } catch (err) {
                console.error("Error fetching popular:", err);
            }
        };
        fetchPopular();
    }, []);

    // Load recently viewed from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("recentlyViewed");
        if (stored) {
            try {
                setRecent(JSON.parse(stored));
            } catch (e) {
                console.error("Error parsing recently viewed:", e);
            }
        }
    }, []);

    // Live search with debounce - FIXED
    useEffect(() => {
        // Clear previous timeout
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        // Don't search for short keywords
        if (keyword.trim().length < 2) {
            setResults([]);
            setSearchPerformed(false);
            setSuggestions([]);
            return;
        }

        // Set loading after a small delay to avoid flicker
        searchTimeout.current = setTimeout(async () => {
            setLoading(true);
            setSearchPerformed(true);

            try {
                // Try search endpoint first
                let response = await fetch(`${API_URL}/api/v1/products/search?keyword=${encodeURIComponent(keyword)}`);
                let data = await response.json();

                // If search endpoint fails, try main endpoint with keyword
                if (!data.success || data.products?.length === 0) {
                    response = await fetch(`${API_URL}/api/v1/products?keyword=${encodeURIComponent(keyword)}&limit=20`);
                    data = await response.json();
                }

                if (data.success && data.products) {
                    setResults(data.products);
                    // Generate suggestions from product names
                    const productNames = data.products.slice(0, 5).map(p => p.name);
                    setSuggestions(productNames);
                } else {
                    setResults([]);
                    setSuggestions([]);
                }
            } catch (err) {
                console.error("Search error:", err);
                setResults([]);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 400);

        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [keyword]);

    // Voice Search Functionality
    const startVoiceSearch = useCallback(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Your browser doesn't support voice search. Please use Chrome, Edge, or Safari.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        setIsListening(true);

        recognition.onstart = () => {
            console.log("Voice recognition started");
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setKeyword(transcript);
            saveRecentSearch(transcript);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error("Voice recognition error:", event.error);
            if (event.error === 'not-allowed') {
                alert("Please allow microphone access to use voice search.");
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
    }, [saveRecentSearch]);

    const handleSearch = useCallback((searchTerm) => {
        if (searchTerm?.trim()) {
            saveRecentSearch(searchTerm);
            setKeyword(searchTerm);
        }
    }, [saveRecentSearch]);

    const clearSearch = useCallback(() => {
        setKeyword("");
        setResults([]);
        setSearchPerformed(false);
        setSuggestions([]);
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }
    }, []);

    const handleProductClick = useCallback((product) => {
        // Save to recently viewed
        const updatedRecent = [product, ...recent.filter(p => p._id !== product._id)].slice(0, 10);
        setRecent(updatedRecent);
        localStorage.setItem("recentlyViewed", JSON.stringify(updatedRecent));

        // Navigate to product details
        navigate(`/product/${product.slug || product._id}`, {
            state: {
                fromSearch: true,
                searchKeyword: keyword,
                categoryId: product.category?._id || product.category
            }
        });
    }, [recent, keyword, navigate]);

    const showSuggestions = keyword.trim().length < 2 && !searchPerformed && !loading;

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100  mb-15">
                {/* Premium Search Header */}
                <div className="bg-white shadow-lg sticky top-0 z-50 border-b">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex-1 relative">
                                <div className="flex items-center bg-gradient-to-r from-gray-50 to-white rounded-2xl px-5 py-3 border-2 focus-within:border-blue-500 transition-all shadow-sm">
                                    <Search className="text-gray-400 mr-3" size={20} />
                                    <input
                                        type="text"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        placeholder="Search for products, brands and more..."
                                        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                                        autoFocus
                                    />

                                    <button
                                        onClick={startVoiceSearch}
                                        disabled={isListening}
                                        className={`ml-2 p-2 rounded-full transition-all duration-200 ${isListening
                                            ? "bg-red-500 text-white animate-pulse"
                                            : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                                            }`}
                                        title="Search by voice"
                                    >
                                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                                    </button>

                                    {keyword && (
                                        <button
                                            onClick={clearSearch}
                                            className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>

                                {isListening && (
                                    <div className="absolute -bottom-8 left-0 right-0 text-center">
                                        <span className="text-xs text-red-500 bg-red-50 px-3 py-1 rounded-full inline-flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                                            Listening... Speak now
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 py-6 ">
                    {/* Search Results */}
                    {searchPerformed && !loading && results.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Search Results for "{keyword}"
                                </h2>
                                <span className="text-sm text-gray-500">{results.length} products found</span>
                            </div>

                            {/* Suggestions chips */}
                            {suggestions.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {suggestions.map((sug, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setKeyword(sug)}
                                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-600 transition"
                                        >
                                            {sug}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Products Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                                {results.map((product) => (
                                    <div
                                        key={product._id}
                                        onClick={() => handleProductClick(product)}
                                        className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                                    >
                                        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                            <img
                                                src={product.images?.[0]?.url || "/api/placeholder/300/300"}
                                                alt={product.name}
                                                className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.src = "/api/placeholder/300/300";
                                                }}
                                            />
                                            {product.discountPrice > 0 && (
                                                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                    {Math.round((product.discountPrice / product.price) * 100)}% OFF
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">
                                                {product.name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-base font-bold text-blue-600">
                                                    ₹{product.finalPrice?.toLocaleString()}
                                                </span>
                                                {product.price > product.finalPrice && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        ₹{product.price?.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                            {product.category?.name && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {product.category.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Results Found */}
                    {searchPerformed && !loading && results.length === 0 && keyword.length >= 2 && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found for "{keyword}"</h3>
                            <p className="text-gray-500">Try searching with different keywords</p>
                            <div className="mt-6">
                                <button
                                    onClick={clearSearch}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Clear Search
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {searchPerformed && loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                            <p className="text-gray-500 mt-3">Searching products...</p>
                        </div>
                    )}

                    {/* Suggestions UI */}
                    {showSuggestions && (
                        <div className="space-y-8">

                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Clock size={18} className="text-blue-500" />
                                            <h2 className="font-semibold text-gray-800">Recent Searches</h2>
                                        </div>
                                        <button
                                            onClick={() => {
                                                localStorage.removeItem("recentSearches");
                                                setRecentSearches([]);
                                            }}
                                            className="text-xs text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            Clear All
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {recentSearches.map((search, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSearch(search)}
                                                className="px-4 py-2 bg-white border rounded-full text-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex items-center gap-2"
                                            >
                                                <Search size={12} className="text-gray-400" />
                                                {search}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Popular Products */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-1 rounded-lg">
                                        <TrendingUp size={16} className="text-white" />
                                    </div>
                                    <h2 className="font-semibold text-gray-800">Popular Products</h2>
                                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                                        Trending Now
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                                    {popular.map((product) => (
                                        <div
                                            key={product._id}
                                            onClick={() => handleProductClick(product)}
                                            className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                                        >
                                            <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                                <img
                                                    src={product.images?.[0]?.url || "/api/placeholder/300/300"}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.target.src = "/api/placeholder/300/300";
                                                    }}
                                                />
                                                {product.soldCount > 100 && (
                                                    <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                                        🔥 Best Seller
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3">
                                                <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-base font-bold text-blue-600">
                                                        ₹{product.finalPrice?.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
            <RecentlyViewed/>
            <FooterNavbar />
        </>
    );
};

export default SearchBox;