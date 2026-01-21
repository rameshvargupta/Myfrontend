import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ProductCardAdmin = ({ product, onDelete }) => {
  return (
    <div className="border p-3 rounded">
      <img src={product.images[0]?.url} className="h-40 w-full object-cover" />
      <h3 className="font-semibold mt-2">{product.name}</h3>
      <p>₹{product.finalPrice}</p>

      <div className="flex gap-2 mt-2">
        <Link to={`/admin/product/edit/${product._id}`}>
          <Button size="sm">Edit</Button>
        </Link>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(product._id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default ProductCardAdmin;
