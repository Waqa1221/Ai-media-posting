"use client";

import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectCoverflow,
} from "swiper/modules";
import { Star, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechStart Inc.",
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    content:
      "SocialAI has transformed our social media strategy. We've seen a 300% increase in engagement and save 15 hours per week on content creation.",
    rating: 5,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Mike Chen",
    role: "Content Creator",
    company: "FitLife Brand",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    content:
      "The AI-generated content is incredibly on-brand and engaging. My follower growth has increased by 250% since using SocialAI.",
    rating: 5,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Emily Rodriguez",
    role: "Social Media Manager",
    company: "Fashion Forward",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    content:
      "Managing multiple clients is now effortless. The scheduling and analytics features have streamlined our entire workflow.",
    rating: 5,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    name: "David Kim",
    role: "Startup Founder",
    company: "InnovateTech",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    content:
      "As a startup, we needed to maximize our social media impact with limited resources. SocialAI delivered exactly that.",
    rating: 5,
    gradient: "from-orange-500 to-red-500",
  },
  {
    name: "Lisa Wang",
    role: "Brand Manager",
    company: "Creative Studios",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    content:
      "The AI understands our brand voice perfectly. Our engagement rates have never been higher, and our team loves the time savings.",
    rating: 5,
    gradient: "from-teal-500 to-blue-500",
  },
  {
    name: "James Wilson",
    role: "Digital Marketing Lead",
    company: "GrowthCo",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    content:
      "SocialAI has revolutionized how we approach content creation. The quality and consistency are unmatched.",
    rating: 5,
    gradient: "from-indigo-500 to-purple-500",
  },
];

export function TestimonialsSection() {
  const [isAutoplayActive, setIsAutoplayActive] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const swiperRef = useRef(null);

  return (
    <section
      id="testimonials"
      className="py-24 bg-white relative overflow-hidden"
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium mb-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <Star className="w-4 h-4 mr-2" />
            Trusted by 10,000+ creators worldwide
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by creators and businesses worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our customers are saying about their experience with
            SocialAI.
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className="relative">
          {/* Slider Controls */}

          <Swiper
            ref={swiperRef}
            modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
            spaceBetween={32}
            slidesPerView={1}
            centeredSlides={false}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
              dynamicMainBullets: 3,
            }}
            navigation={{
              prevEl: ".testimonials-prev",
              nextEl: ".testimonials-next",
            }}
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 24,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 32,
                centeredSlides: false,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 32,
                centeredSlides: false,
              },
              1280: {
                slidesPerView: 3,
                spaceBetween: 40,
                centeredSlides: false,
              },
            }}
            onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
            className="testimonials-swiper pb-16"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden group h-full">
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  ></div>

                  {/* Quote Icon */}
                  <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                    </svg>
                  </div>

                  <div className="relative z-10">
                    {/* Rating Stars */}
                    <div className="flex items-center mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mr-1 transform hover:scale-110 transition-transform duration-200"
                          style={{ animationDelay: `${i * 100}ms` }}
                        >
                          <Star className="w-4 h-4 text-white fill-current animate-pulse" />
                        </div>
                      ))}
                    </div>

                    {/* Testimonial Content */}
                    <p className="text-gray-700 mb-8 leading-relaxed text-lg italic min-h-[120px] flex items-center">
                      "{testimonial.content}"
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center">
                      <div className="relative">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full mr-4 shadow-lg ring-4 ring-white group-hover:ring-gray-100 transition-all duration-300"
                        />
                        <div
                          className={`absolute inset-0 rounded-full bg-gradient-to-r ${testimonial.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
                        ></div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-lg group-hover:text-gray-800 transition-colors">
                          {testimonial.name}
                        </div>
                        <div className="text-gray-600 group-hover:text-gray-700 transition-colors">
                          {testimonial.role} at {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button className="testimonials-prev group flex items-center justify-center w-12 h-12 bg-white border-2 border-gray-200 rounded-full shadow-lg hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:scale-110">
              <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            </button>

            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                {currentSlide + 1} / {testimonials.length}
              </span>
            </div>

            <button className="testimonials-next group flex items-center justify-center w-12 h-12 bg-white border-2 border-gray-200 rounded-full shadow-lg hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:scale-110">
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
          </div>

          <div className="relative z-10">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-2">
                Join Thousands of Satisfied Customers
              </h3>
              <p className="text-blue-100">
                See why businesses choose SocialAI for their social media
                success
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 group-hover:scale-110 transition-transform duration-300">
                  10,000+
                </div>
                <div className="text-sm sm:text-base md:text-lg text-blue-100 group-hover:text-white transition-colors">
                  Active Users
                </div>
              </div>
              <div className="group">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 group-hover:scale-110 transition-transform duration-300">
                  1M+
                </div>
                <div className="text-sm sm:text-base md:text-lg text-blue-100 group-hover:text-white transition-colors">
                  Posts Generated
                </div>
              </div>
              <div className="group">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 group-hover:scale-110 transition-transform duration-300">
                  98%
                </div>
                <div className="text-sm sm:text-base md:text-lg text-blue-100 group-hover:text-white transition-colors">
                  Customer Satisfaction
                </div>
              </div>
              <div className="group">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 group-hover:scale-110 transition-transform duration-300">
                  24/7
                </div>
                <div className="text-sm sm:text-base md:text-lg text-blue-100 group-hover:text-white transition-colors">
                  Support Available
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
