import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loadWishlist, removeWishlistItem } from "@/redux/wishlistSlice";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import { Heart, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import FooterNavbar from "@/components/user/FooterNavbar";

const Wishlist = () => {
    const dispatch = useDispatch();

    const { items = [], loading, error } = useSelector(
        (state) => state.wishlist
    );

    const [removingId, setRemovingId] = useState(null);

    useEffect(() => {
        dispatch(loadWishlist());
    }, [dispatch]);

    const handleRemove = async (id) => {

        try {
            setRemovingId(id);
            await dispatch(removeWishlistItem(id)).unwrap();
            toast.success("Removed from wishlist ❤️");
        } catch (err) {
            toast.error(err || "Failed to remove item");
        } finally {
            setRemovingId(null);
        }
    };

    // LOADING
    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex flex-col items-center justify-center py-28">
                    <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
                    <p className="text-gray-500 mt-3">
                        Loading wishlist...
                    </p>
                </div>
            </>
        );
    }

    // EMPTY
    if (!loading && items.length === 0) {
        return (
            <>
                <Navbar />
                <div className="text-center py-28">
                    <Heart className="mx-auto mb-4 text-pink-500" size={52} />
                    <h2 className="text-2xl font-semibold">
                        Your Wishlist is Empty
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Save your favorite products ❤️
                    </p>
                    <Link
                        to="/products"
                        className="inline-block mt-6 px-6 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-500 transition"
                    >
                        Browse Products
                    </Link>
                </div>
            </>
        );
    }

    return (
        <div>
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-5">

                <div className="flex justify-between items-center mb-5">
                    <h1 className="text-3xl font-bold">
                        My Wishlist ❤️
                    </h1>

                </div>

                {error && (
                    <div className="text-red-500 mb-6 text-center">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {items.map((item) => (
                        <ProductCard
                            key={item._id}
                            product={item}
                            showRemove={true}
                            removing={removingId === item._id}
                            onRemove={() => handleRemove(item._id)}
                        />
                    ))}
                </div>
            </div>

            <FooterNavbar />
        </div>
    );
};

export default Wishlist;