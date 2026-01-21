import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
      stock: product.stock
    }));
  };

  return (
    <div className="border p-4 rounded">
      <img src={product.images[0]} alt={product.name} className="w-full h-40 object-cover"/>
      <h3 className="font-semibold mt-2">{product.name}</h3>
      <p className="text-pink-500 font-bold">${product.price}</p>
      <button
        onClick={handleAddToCart}
        className="bg-pink-500 text-white px-3 py-1 rounded mt-2"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
