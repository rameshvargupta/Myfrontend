import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, TrendingUp, Clock, X, Mic, MicOff } from "lucide-react";
import RecentlyViewed from "./RecentlyViewed";
import FooterNavbar from "@/components/user/FooterNavbar";
import { Camera } from "lucide-react";
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

    useEffect(() => {
        const fetchRecentSearches = async () => {
            try {
                const res = await fetch(`${API_URL}/api/v1/user/recent-search`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                const data = await res.json();
                if (data.success) {
                    setRecentSearches(data.searches.map(s => s.keyword));
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchRecentSearches();
    }, []);

    const saveRecentSearch = useCallback(async (searchTerm) => {
        if (!searchTerm?.trim()) return;

        try {
            await fetch(`${API_URL}/api/v1/user/recent-search`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ keyword: searchTerm })
            });

            // ✅ INSTANT UI UPDATE
            setRecentSearches(prev => {
                const updated = [searchTerm, ...prev.filter(s => s !== searchTerm)];
                return updated.slice(0, 5);
            });

        } catch (err) {
            console.error(err);
        }
    }, []);

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

    // Live search with debounce
    useEffect(() => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (keyword.trim().length < 2) {
            setResults([]);
            setSearchPerformed(false);
            setSuggestions([]);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            setLoading(true);
            setSearchPerformed(true);

            try {
                let response = await fetch(`${API_URL}/api/v1/products/search?keyword=${encodeURIComponent(keyword)}`);
                let data = await response.json();

                if (!data.success || data.products?.length === 0) {
                    response = await fetch(`${API_URL}/api/v1/products?keyword=${encodeURIComponent(keyword)}&limit=30`);
                    data = await response.json();
                }

                if (data.success && data.products) {
                    setResults(data.products);
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

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && keyword.trim()) {
            saveRecentSearch(keyword);
        }
    };

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

    const clearAllSearches = async () => {
        try {
            const res = await fetch(`${API_URL}/api/v1/user/recent-search`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            const data = await res.json();

            if (data.success) {
                setRecentSearches([]);
            }

        } catch (err) {
            console.error(err);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            setLoading(true);
            setSearchPerformed(true);

            const res = await fetch(`${API_URL}/api/v1/user/visual-search`, {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                setResults(data.products);
                setSuggestions([]);
            } else {
                setResults([]);
            }

        } catch (err) {
            console.error("Image search error:", err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = useCallback((product) => {

        if (keyword?.trim()) {
            saveRecentSearch(keyword); // ✅ ADD THIS
        }

        const updatedRecent = [product, ...recent.filter(p => p._id !== product._id)].slice(0, 10);
        setRecent(updatedRecent);
        localStorage.setItem("recentlyViewed", JSON.stringify(updatedRecent));

        localStorage.setItem("lastSearchKeyword", keyword);

        navigate("/products", {
            state: {
                selectedProductId: product._id,
                selectedProduct: product,
                searchKeyword: keyword,
                categoryId: product.category?._id || product.category,
                productName: product.name
            }
        });
    }, [recent, keyword, navigate]);

    const showSuggestions = keyword.trim().length === 0;
    const token = localStorage.getItem("token");
    console.log("TOKEN 👉", token);
    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 mb-15">
                {/* Premium Search Header */}
                <div className="bg-white shadow-lg sticky top-0 z-50 border-b">
                    <div className="max-w-4xl mx-auto px-4 py-4">
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
                                        onKeyDown={handleKeyDown}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        placeholder="Search for products, brands and more..."
                                        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                                        autoFocus
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleImageUpload}
                                        hidden
                                        id="cameraInput"
                                    />

                                    <label htmlFor="cameraInput" className="cursor-pointer ml-2">
                                        <Camera size={18} className="text-gray-400 hover:text-green-500" />
                                    </label>
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
                <div className="max-w-4xl mx-auto px-4 py-6">
                    {/* Search Results - LIST VIEW (one product per line) */}
                    {searchPerformed && !loading && results.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4 pb-2 border-b">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Search Results for "{keyword}"
                                </h2>
                                <span className="text-sm text-gray-500">{results.length} products found</span>
                            </div>

                            {/* Suggestions chips */}
                            {suggestions.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
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

                            {/* Products LIST VIEW - one per line */}
                            <div className="space-y-1">
                                {results.map((product) => (
                                    <div
                                        key={product._id}
                                        onClick={() => handleProductClick(product)}
                                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-blue-200"
                                    >
                                        <div className="flex gap-2">
                                            {/* Product Image */}
                                            <div className="w-15 h-15 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
                                                <img
                                                    src={product.images?.[0]?.url || "/api/placeholder/300/300"}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain p-2"
                                                    onError={(e) => {
                                                        e.target.src = "/api/placeholder/300/300";
                                                    }}
                                                />
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className=" text-gray-800 text-base line-clamp-1">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    Category: {product.category?.name || "Uncategorized"}
                                                </p>

                                            </div>

                                            {/* Arrow indicator */}
                                            <div className="flex items-center text-gray-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
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

                    {/* Suggestions UI - Recent Searches & Popular Products */}
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
                                            onClick={clearAllSearches}
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

                            {/* Popular Products - List View */}
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

                                <div className="space-y-3">
                                    {popular.map((product) => (
                                        <div
                                            key={product._id}
                                            onClick={() => handleProductClick(product)}
                                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100"
                                        >
                                            <div className="flex gap-4 p-4">
                                                <div className="w-20 h-20 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
                                                    <img
                                                        src={product.images?.[0]?.url || "/api/placeholder/300/300"}
                                                        alt={product.name}
                                                        className="w-full h-full object-contain p-2"
                                                        onError={(e) => {
                                                            e.target.src = "/api/placeholder/300/300";
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-gray-800 text-base line-clamp-1">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-0.5">
                                                        Category: {product.category?.name || "Uncategorized"}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-lg font-bold text-blue-600">
                                                            ₹{(product.finalPrice || product.price)?.toLocaleString()}
                                                        </span>
                                                        {product.soldCount > 100 && (
                                                            <span className="text-xs text-orange-600 font-medium">
                                                                🔥 Best Seller
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center text-gray-400">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="my-5">
                        <RecentlyViewed />
                    </div>
                </div>
            </div>
            <FooterNavbar />
        </>
    );
};

export default SearchBox;