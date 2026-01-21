const ProductCard = ({ product, addToCart }) => {
  return (
    <div className="border p-4 relative">
      {!product.isActive && (
        <span className="absolute top-2 left-2 bg-black text-white text-xs px-2">
          Hidden
        </span>
      )}

      <h2>{product.name}</h2>

      <button
        disabled={!product.isActive}
        onClick={() => addToCart(product._id)}
        className={`mt-2 px-4 py-2 rounded ${
          product.isActive
            ? "bg-pink-500 text-white"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        {product.isActive ? "Add to Cart" : "Unavailable"}
      </button>
    </div>
  );
};

export default ProductCard;
