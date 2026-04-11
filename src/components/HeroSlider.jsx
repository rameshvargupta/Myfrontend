import { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const API_URL = import.meta.env.VITE_API_URL;

/* HEIGHT CONFIG */
const HEIGHTS = {
  TOP: "h-[220px] sm:h-[360px] md:h-[520px] lg:h-[650px]",
  MIDDLE: "h-[120px] sm:h-[180px] md:h-[260px]",
  BOTTOM: "h-[100px] sm:h-[140px] md:h-[200px]",
};

const HeroSlider = ({ position = "TOP", className = "" }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  /* FETCH BANNERS */
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_URL}/api/v1/banners/active?position=${position}`
        );

        const bannerImages = Array.isArray(res.data?.images)
          ? res.data.images
          : [];

        setImages(bannerImages);
      } catch (err) {
        console.error("Hero banner error", err);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [position]);

  /* SKELETON LOADER */
  if (loading) {
    return (
      <div
        className={`w-full animate-pulse bg-gray-200 rounded-2xl ${HEIGHTS[position]}`}
      />
    );
  }

  /* NO DATA */
  if (!images.length) return null;

  /* SINGLE IMAGE → NO SWIPER */
  if (images.length === 1) {
    const img = images[0];
    return (
      <section className="px-2 sm:px-4 mb-6">
        <div
          className={`relative rounded-2xl overflow-hidden shadow-xl ${HEIGHTS[position]}`}
        >
          <img
            src={img.imageUrl}
            alt="banner"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {img.title && (
            <div className="absolute bottom-6 left-6 text-white">
              <h2 className="text-xl sm:text-3xl font-bold">
                {img.title}
              </h2>
            </div>
          )}
        </div>
      </section>
    );
  }

  /* MULTIPLE IMAGES → SWIPER */
  return (
    <section className="px-2 sm:px-4 mb-2">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        loop={images.length > 2} // ✅ FIXED
        pagination={{
          clickable: true,
        }}
        navigation
        className={`group rounded-2xl overflow-hidden shadow-xl ${className || HEIGHTS[position]}`}
      >
        {images.map((img) => (
          <SwiperSlide key={img._id}>
            <div className="relative w-full h-full">
              
              {/* IMAGE */}
              <img
                src={img.imageUrl}
                alt="banner"
                className="w-full h-full object-cover 
                           scale-105 transition-transform duration-[6000ms] 
                           ease-out group-hover:scale-110"
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t 
                              from-black/60 via-black/20 to-transparent" />

              {/* TEXT CONTENT */}
              <div className="absolute bottom-6 sm:bottom-10 left-4 sm:left-10 text-white z-10 max-w-md">
                
                {img.title && (
                  <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-2 animate-fadeInUp">
                    {img.title}
                  </h2>
                )}

                {img.subtitle && (
                  <p className="text-sm sm:text-base opacity-90 mb-4">
                    {img.subtitle}
                  </p>
                )}

                {img.ctaText && img.ctaLink && (
                  <a
                    href={img.ctaLink}
                    className="inline-block bg-white text-black 
                               px-5 py-2 rounded-full 
                               text-sm font-semibold 
                               hover:scale-105 transition"
                  >
                    {img.ctaText}
                  </a>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroSlider;