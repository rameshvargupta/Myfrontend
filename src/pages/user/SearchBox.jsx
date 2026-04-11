import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, TrendingUp, Clock, X, Star, Sparkles, ArrowRight, Mic, MicOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const SearchBox = () => {
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState([]);
    const [popular, setPopular] = useState([]);
    const [recent, setRecent] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const navigate = useNavigate();

    // Load recent searches from localStorage
    useEffect(() => {
        const storedSearches = localStorage.getItem("recentSearches");
        if (storedSearches) {
            setRecentSearches(JSON.parse(storedSearches));
        }
    }, []);

    // Save recent search
    const saveRecentSearch = (searchTerm) => {
        if (!searchTerm.trim()) return;
        const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
    };

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
                console.log(err);
            }
        };
        fetchPopular();
    }, []);

    // Load recently viewed from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("recentlyViewed");
        if (stored) {
            setRecent(JSON.parse(stored));
        }
    }, []);

    // Live search
    useEffect(() => {
        const delay = setTimeout(() => {
            const fetchProducts = async () => {
                if (keyword.trim().length < 2) {
                    setResults([]);
                    return;
                }

                setLoading(true);

                try {
                    const res = await fetch(`${API_URL}/api/v1/products?keyword=${keyword}`);
                    const data = await res.json();

                    if (data.success) {
                        setResults(data.products || []);
                    } else {
                        setResults([]);
                    }
                } catch (err) {
                    console.log(err);
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            };

            fetchProducts();
        }, 350);

        return () => clearTimeout(delay);
    }, [keyword]);

    // Voice Search Functionality
    const startVoiceSearch = () => {
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
    };

    const handleSearch = (searchTerm) => {
        if (searchTerm.trim()) {
            saveRecentSearch(searchTerm);
            setKeyword(searchTerm);
        }
    };

    const clearSearch = () => {
        setKeyword("");
        setResults([]);
    };

    const handleProductClick = (product) => {
        const updatedRecent = [product, ...recent.filter(p => p._id !== product._id)].slice(0, 10);
        setRecent(updatedRecent);
        localStorage.setItem("recentlyViewed", JSON.stringify(updatedRecent));
        navigate(`/product/${product.slug || product._id}`);
    };

    const showSuggestions = keyword.trim().length < 2;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

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
                                
                                {/* Microphone Button */}
                                <button
                                    onClick={startVoiceSearch}
                                    disabled={isListening}
                                    className={`ml-2 p-2 rounded-full transition-all duration-200 ${
                                        isListening 
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
                            
                            {/* Voice Search Listening Indicator */}
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
            <div className="max-w-7xl mx-auto px-4 py-6">

                {/* Search Results - One line with image and name */}
                {!showSuggestions && !loading && results.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-medium text-gray-500">Search Results</h2>
                            <span className="text-xs text-gray-400">{results.length} products found</span>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                            {results.map((product, idx) => (
                                <div
                                    key={product._id}
                                    onClick={() => handleProductClick(product)}
                                    className={`flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${idx !== results.length - 1 ? "border-b" : ""
                                        }`}
                                >
                                    <img
                                        src={product.images?.[0]?.url || "/api/placeholder/60/60"}
                                        alt={product.name}
                                        className="w-12 h-12 rounded-lg object-cover shadow-sm"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800 line-clamp-1">
                                            {product.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            ₹{product.finalPrice?.toLocaleString()}
                                        </p>
                                    </div>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {!showSuggestions && loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                        <p className="text-gray-500 mt-3">Searching products...</p>
                    </div>
                )}

                {/* No Results */}
                {!showSuggestions && !loading && results.length === 0 && keyword.length >= 2 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                        <p className="text-gray-500">Try searching with different keywords</p>
                    </div>
                )}

                {/* Suggestions UI - Premium Design */}
                {showSuggestions && (
                    <div className="space-y-8">
                        {/* Recently Viewed Section - Text Only */}
                        {recent.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Clock size={18} className="text-purple-500" />
                                        <h2 className="font-semibold text-gray-800">Recently Viewed</h2>
                                    </div>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem("recentlyViewed");
                                            setRecent([]);
                                        }}
                                        className="text-xs text-red-500 hover:text-red-600 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </div>

                                {/* Text Only Flex Wrap Layout */}
                                <div className="flex flex-wrap gap-3">
                                    {recent.slice(0, 10).map((product, idx) => (
                                        <div
                                            key={product._id}
                                            onClick={() => handleProductClick(product)}
                                            className="group cursor-pointer"
                                        >
                                            <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2">
                                                <span className="text-gray-400 text-xs">{idx + 1}.</span>
                                                <span className="line-clamp-1 max-w-[200px]">{product.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Searches Section */}
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

                        {/* Popular Products - Premium Grid */}
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
                                            />
                                            {product.soldCount > 100 && (
                                                <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                                    🔥 Best Seller
                                                </div>
                                            )}
                                            {product.discountPercent > 0 && (
                                                <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                    {product.discountPercent}% OFF
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
                                            {product.rating > 0 && (
                                                <div className="flex items-center gap-1 mt-2">
                                                    <div className="flex items-center bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
                                                        <span>{product.rating.toFixed(1)}</span>
                                                        <Star size={10} className="ml-0.5 fill-current" />
                                                    </div>
                                                    <span className="text-xs text-gray-500">({product.numReviews})</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchBox;