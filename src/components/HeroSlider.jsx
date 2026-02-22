import { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

/* ================= HEIGHT CONFIG ================= */
const HEIGHTS = {
  TOP: "h-[220px] sm:h-[360px] md:h-[520px] lg:h-[650px]",
  MIDDLE: "h-[120px] sm:h-[180px] md:h-[260px]",
  BOTTOM: "h-[100px] sm:h-[140px] md:h-[200px]",
};

const HeroSlider = ({ position = "TOP", className = "" }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH BANNERS ================= */
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `/api/v1/banners/active?position=${position}`
        );

        // IMPORTANT: backend returns object OR array
        const bannerImages = res.data?.images || res.data || [];
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

  if (loading || !images.length) return null;

  /* ================= RENDER ================= */
  return (
    <section className="px-2 sm:px-4 mb-6">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        loop
        pagination={{
          clickable: true,
          bulletClass:
            "swiper-pagination-bullet !bg-white/50 !opacity-100",
          bulletActiveClass: "!bg-white",
        }}
        className={`group relative rounded-2xl overflow-hidden shadow-xl 
  ${className || HEIGHTS[position]}`}
      >
        {images.map((img) => (
          <SwiperSlide key={img._id}>
            {/* IMAGE */}
            <div className="relative w-full h-full">
              <img
                src={img.imageUrl}
                alt="banner"
                loading="lazy"
                className="w-full h-full object-cover 
                           scale-105 transition-transform 
                           duration-[6000ms] ease-out
                           group-hover:scale-110"
              />

              {/* GRADIENT OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t 
                              from-black/50 via-black/20 to-transparent" />

              {/* OPTIONAL CONTENT (SAFE EVEN IF EMPTY) */}
              {(img.title || img.subtitle || img.ctaText) && (
                <div className="absolute bottom-6 sm:bottom-10 left-4 sm:left-8 
                                z-10 text-white max-w-md">
                  {img.title && (
                    <h2 className="text-xl sm:text-3xl md:text-4xl 
                                   font-bold mb-2 leading-tight">
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
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroSlider;
