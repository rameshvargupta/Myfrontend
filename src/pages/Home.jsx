import { useEffect, useState } from "react";
import axios from "axios";
import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/v1/products")
      .then((res) => {
        if (res.data.success) {
          setProducts(res.data.products);
        }
      })
      .catch(console.error);
  }, []);

  /* ================= LOGIC ================= */

  const trendingProducts = [...products]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 8);

  const bestOffers = [...products]
    .sort(
      (a, b) =>
        (b.price - b.discountPrice) -
        (a.price - a.discountPrice)
    )
    .slice(0, 8);

  const latestProducts = [...products]
    .sort(
      (a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    )
    .slice(0, 8);

  /* ================= UI ================= */

  return (
    <div className="space-y-14">

      {/* TOP SLIDER */}
      <HeroSlider position="TOP" height="450px" />

      {/* TRENDING */}
      <Section title="Trending Products">
        {trendingProducts.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </Section>

      {/* BEST OFFER */}
      <HeroSlider position="MIDDLE" height="300px" />

      <Section title="Best Offers">
        {bestOffers.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </Section>

      {/* LATEST */}
      <HeroSlider position="BOTTOM" height="250px" />

      <Section title="Latest Products">
        {latestProducts.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </Section>

    </div>
  );
};

/* ===== Reusable Section ===== */
const Section = ({ title, children }) => (
  <section className="px-6">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {children}
    </div>
  </section>
);

export default Home;
