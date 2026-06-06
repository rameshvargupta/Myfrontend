import { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const API_URL = import.meta.env.VITE_API_URL;

const HeroSlider = ({ position = "TOP", className = "" }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/v1/banners/active?position=${position}`
        );

        setImages(
          Array.isArray(res.data?.images)
            ? res.data.images
            : []
        );
      } catch (error) {
        console.error("Banner Fetch Error:", error);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [position]);

  // Loading Skeleton
  if (loading) {
    return (
      <div
        className={`w-full rounded-2xl bg-gray-200 animate-pulse ${className}`}
      />
    );
  }

  // No Banner
  if (!images.length) return null;

  // Single Banner
  if (images.length === 1) {
    return (
      <div className={`mx-2 mb-2 overflow-hidden rounded-2xl ${className}`}>
        <img
          src={images[0].imageUrl}
          alt="Banner"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // Multiple Banners
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{
        delay: 4000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      loop={images.length > 1}
      className={`mx-2 mb-2 rounded-2xl overflow-hidden ${className}`}
    >
      {images.map((img) => (
        <SwiperSlide key={img._id}>
          <img
            src={img.imageUrl}
            alt="Banner"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroSlider;