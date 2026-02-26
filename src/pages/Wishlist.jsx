import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loadWishlist, removeWishlistItem } from "@/redux/wishlistSlice";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import { Heart, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const Wishlist = () => {
    const dispatch = useDispatch();
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
                        Back to Products
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

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {items.map((item) => (
                        <ProductCard
                            key={item._id}
                            product={item}
                            showRemove={true}
                            onRemove={(id) => dispatch(removeWishlistItem(id))}
                            onAfterAddToCart={(id) => {
                                const confirmMove = window.confirm(
                                    "Move this item to cart and remove from wishlist?"
                                );

                                if (confirmMove) {
                                    dispatch(removeWishlistItem(id));
                                }
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;