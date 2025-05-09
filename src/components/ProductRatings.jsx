import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

const Star = ({ filled }) => (
  filled ? <FaStar className="text-yellow-500" /> : <FaRegStar className="text-gray-300" />
);

const ProductRatings = ({ product }) => {
  const ratings = {
    average: product?.ratings || 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    totalRatings: product?.totalReviews || 0
  };

  // Calculate distribution from reviews
  if (Array.isArray(product?.reviews)) {
    product.reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratings.distribution[review.rating] = (ratings.distribution[review.rating] || 0) + 1;
      }
    });
    // Update totalRatings based on reviews if not provided
    if (!product?.totalReviews) {
      ratings.totalRatings = product.reviews.length;
    }
  }

  const total = Object.values(ratings.distribution).reduce((a, b) => a + b, 0) || 1; // Avoid division by zero

  const renderStars = (value) => {
    const fullStars = Math.floor(value);
    const halfStar = value % 1 >= 0.5;
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            filled={i < fullStars || (i === fullStars && halfStar)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between space-y-6 md:space-y-0">
        {/* Left: Box with average rating and stars */}
        <div className="bg-gray-100 h-50 p-6 rounded-lg md:pt-10 shadow-md w-full md:w-1/3 text-center">
          <div className="text-4xl font-bold text-black">{ratings.average.toFixed(1)} / 5.0</div>
          <div className="mt-2 flex justify-center">{renderStars(ratings.average)}</div>
          <div className="mt-2 text-sm text-gray-600">{ratings.totalRatings} Ratings</div>
        </div>

        {/* Right: Star distribution */}
        <div className="w-full md:w-2/3 space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratings.distribution[star] || 0;
            const percentage = (count / total) * 100;
            return (
              <div key={star} className="flex items-center space-x-3 h-8 md:ml-10">
                <div className="flex items-center space-x-1 w-12">
                  <Star filled />
                  <span className="text-black font-medium ml-3">{star}</span>
                </div>
                <div className="flex-1 bg-gray-200 h-3 rounded-full">
                  <div
                    className="h-3 bg-orange-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductRatings;