import { Link } from "react-router-dom";
import { Loader2, Trash2 } from "lucide-react";

const ProductCard = ({ product, showRemove = false, onRemove, removing }) => {

  return (
    <div className="relative bg-white shadow-md rounded-xl p-3">

      {/* REMOVE BUTTON */}
      {showRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();   // IMPORTANT
            e.preventDefault();    // IMPORTANT
            onRemove();
          }}
          disabled={removing}
          className="absolute top-2 right-2 z-20 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
        >
          {removing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      )}

      <Link to={`/product/${product._id}`}>
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-40 object-cover rounded-lg"
        />

        <h2 className="mt-3 font-semibold text-sm line-clamp-2">
          {product.name}
        </h2>

        <p className="text-pink-600 font-bold mt-1">
          ₹{product.finalPrice}
        </p>
      </Link>
    </div>
  );
};

export default ProductCard;