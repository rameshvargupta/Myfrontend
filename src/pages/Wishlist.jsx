import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
    loadWishlist,
    removeWishlistItem,
} from "@/redux/wishlistSlice";
import {
    Loader2,
    Trash2,
    Heart,
    Star,
    ShoppingCart,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { addToCart } from "@/redux/cartSlice";
import { toast } from "sonner";


const Wishlist = () => {
    const dispatch = useDispatch();
    const { cartItems } = useSelector((state) => state.cart);
    const { items, loading, error } = useSelector(
        (state) => state.wishlist
    );

    useEffect(() => {
        dispatch(loadWishlist());
    }, [dispatch]);

    if (!loading && items.length === 0) {
        return (
            <>
                <Navbar />
                <div className="text-center py-24">
                    <Heart className="mx-auto mb-4 text-pink-500" size={50} />
                    <h2 className="text-2xl font-semibold">
                        Your Wishlist is Empty
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Save items you love to your wishlist.
                    </p>
                    <Link
                        to="/products"
                        className="inline-block mt-6 px-6 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-500 transition"
                    >
                        Back Products
                    </Link>
                </div>
            </>

        );
    }

    return (
        <div>
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">
                    My Wishlist ❤️
                </h1>

                {loading && (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
                    </div>
                )}

                {error && (
                    <div className="text-center text-red-500 mb-6">
                        {error}
                    </div>
                )}

                {/* 🔥 ADVANCED GRID */}
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {items.map((item) => {
                        const imageUrl =
                            item.images?.[0]?.url || "/placeholder.png";

                        const discount =
                            item.price && item.finalPrice
                                ? Math.round(
                                    ((item.price - item.finalPrice) /
                                        item.price) *
                                    100
                                )
                                : 0;

                        return (
                            <div
                                key={item._id}
                                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border"
                            >
                                {/* IMAGE SECTION */}
                                <Link
                                    to={`/product/${item.slug}`}
                                    className="relative overflow-hidden"
                                >
                                    <img
                                        src={imageUrl}
                                        alt={item.name}
                                        className="h-44 w-full object-cover group-hover:scale-105 transition duration-300"
                                    />

                                    {/* Discount Badge */}
                                    {discount > 0 && (
                                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md">
                                            {discount}% OFF
                                        </span>
                                    )}

                                    {/* Remove Button */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            dispatch(removeWishlistItem(item._id));
                                        }}
                                        className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-red-50"
                                    >
                                        <Trash2 size={16} className="text-red-500" />
                                    </button>
                                </Link>

                                {/* INFO SECTION */}
                                <div className="p-3 flex flex-col flex-1">
                                    <h3 className="text-sm font-medium line-clamp-2 min-h-[40px]">
                                        {item.name}
                                    </h3>

                                    {/* Rating */}
                                    <div className="flex items-center gap-1 mt-1">
                                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-xs text-gray-600">
                                            {item.rating || 0} ({item.numReviews || 0})
                                        </span>
                                    </div>

                                    {/* Price Section */}
                                    <div className="mt-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-semibold text-gray-900">
                                                ₹ {item.finalPrice || item.price}
                                            </span>

                                            {item.finalPrice && (
                                                <span className="text-xs line-through text-gray-400">
                                                    ₹ {item.price}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stock Badge */}
                                    <div className="mt-2">
                                        {item.stock > 0 ? (
                                            <span className="text-xs text-green-600 font-medium">
                                                In Stock
                                            </span>
                                        ) : (
                                            <span className="text-xs text-red-500 font-medium">
                                                Out of Stock
                                            </span>
                                        )}
                                    </div>

                                    {/* Add to Cart Button */}
                                    <button
                                        disabled={item.stock === 0}
                                        onClick={() => {
                                            if (item.stock === 0) return;

                                            const alreadyInCart = cartItems.find(
                                                (cartItem) => cartItem.productId === item._id
                                            );

                                            if (alreadyInCart) {
                                                toast.info("Product already in cart");
                                                return;
                                            }

                                            dispatch(
                                                addToCart({
                                                    productId: item._id,
                                                    name: item.name,
                                                    price: item.finalPrice || item.price,
                                                    image: item.images?.[0]?.url,
                                                    quantity: 1,
                                                })
                                            );

                                            toast.success("Product added to cart 🛒");
                                        }}

                                        className={`mt-3
                    w-full
                    py-2
                    text-sm
                    font-semibold
                    rounded-full
                    transition
                    ${item.stock > 0
                                                ? "bg-gradient-to-r from-indigo-600 to-pink-500 text-white hover:opacity-90"
                                                : "bg-gray-300 text-gray-600 cursor-not-allowed"
                                            }`}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;