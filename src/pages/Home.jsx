import Features from '@/components/Features'
import HeroSlider from '@/components/HeroSlider'
import React from 'react'

const Home = () => {
  return (
    <div className="space-y-10">

      {/* TOP CAROUSEL */}
      <HeroSlider position="TOP" height="650px" />

      {/* Some content */}
      <section className="px-6">
        <h2 className="text-2xl font-bold">Trending Products</h2>
      </section>

      {/* MIDDLE CAROUSEL */}
      <HeroSlider position="MIDDLE" height="350px" />

      {/* More content */}
      <section className="px-6">
        <h2 className="text-2xl font-bold">Best Offers</h2>
      </section>

      {/* BOTTOM CAROUSEL */}
      <HeroSlider position="BOTTOM" height="300px" />

    </div>
  );
};

export default Home;
