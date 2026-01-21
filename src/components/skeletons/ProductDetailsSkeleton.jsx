const ProductSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
      <div>
        <div className="w-full h-[420px] bg-gray-200 rounded-xl"></div>
        <div className="flex gap-3 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-20 h-20 bg-gray-200 rounded-lg"
            />
          ))}
        </div>
      </div>

      <div>
        <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
        <div className="h-4 w-1/3 bg-gray-200 rounded mt-4"></div>

        <div className="h-10 w-1/2 bg-gray-200 rounded mt-6"></div>
        <div className="h-4 w-1/4 bg-gray-200 rounded mt-3"></div>

        <div className="h-14 w-full bg-gray-200 rounded-xl mt-8"></div>

        <div className="mt-8 space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
