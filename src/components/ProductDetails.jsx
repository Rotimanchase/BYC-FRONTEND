import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../axios";
import Modifycart from "../pages/ModifyCart";
import { useAppContext } from "../context/AppsContext";
// import { useAppContext } from '../context/appContext';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [rating, setRating] = useState(0);
    const [error, setError] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const { refreshProducts, fetchRecentlyViewed } = useAppContext();

    useEffect(() => {
        // Track recently viewed product
        const trackRecentlyViewed = () => {
          const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
          const updatedIds = viewedIds.filter(viewedId => viewedId !== id);
          updatedIds.unshift(id);
          localStorage.setItem('recentlyViewed', JSON.stringify(updatedIds.slice(0, 5)));
        };

        const fetchProduct = async () => {
            try {
                const response = await axiosInstance.get(`/api/product/${id}`);
                if (response.data.success) {
                    setProduct(response.data.product);
                    trackRecentlyViewed();
                    await fetchRecentlyViewed(); // Ensure RecentlyView updates
                } else {
                    setError("Failed to load product");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                setError("Failed to load product");
            }
        };
        fetchProduct();
    }, [id, fetchRecentlyViewed]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setError("");

        if (!isAuthenticated) {
            setError("Please log in to submit a review");
            return;
        }
        if (!title || title.length < 3 || title.length > 100) {
            setError("Title must be between 3 and 100 characters");
            return;
        }
        if (!description || description.length < 10 || description.length > 500) {
            setError("Description must be between 10 and 500 characters");
            return;
        }
        if (!rating || rating < 1 || rating > 5 || !Number.isInteger(Number(rating))) {
            setError("Rating must be an integer between 1 and 5");
            return;
        }

        try {
            const response = await axiosInstance.post(
                `/api/product/${id}/review`,
                { title, description, rating: Number(rating) },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (response.data.success) {
                setProduct(response.data.product);
                setTitle("");
                setDescription("");
                setRating(0);
                setError("");
                await refreshProducts();
            }
        } catch (error) {
            const message = error.response?.data?.message || "Failed to submit review";
            setError(message);
            console.error("Error submitting review:", error);
        }
    };

    if (!product) {
        return (
            <div className="mx-auto p-4">
                <p>{error || "Loading..."}</p>
            </div>
        );
    }

    return (
        <div className="mx-auto p-4">
            {/* Product Details via Modifycart */}
            <Modifycart product={product} />

            {/* Rating and Reviews Section */}
            <div className="mt-8 mx-15">
                <h3 className="text-xl font-bold">Ratings & Reviews</h3>
                <p className="text-lg">
                    Average Rating: {product.ratings?.toFixed(1) || 0} / 5 ({product.totalReviews || 0} reviews)
                </p>

                {/* Reviews List */}
                <div className="mt-4">
                    <h4 className="text-lg font-semibold">Customer Reviews</h4>
                    {product.reviews?.length === 0 ? (
                        <p>No reviews yet.</p>
                    ) : (
                        <ul className="space-y-4">
                            {product.reviews.map((review) => (
                                <li key={review._id} className="border-b pb-4">
                                    <p className="font-semibold">{review.title}</p>
                                    <p>Rating: {review.rating}/5</p>
                                    <p>{review.description}</p>
                                    <p className="text-sm text-gray-600">
                                        By {typeof review.author === 'object' && review.author?.username 
                                            ? review.author.username 
                                            : typeof review.author === 'string' 
                                            ? review.author 
                                            : 'Anonymous'} on{" "}
                                        {new Date(review.date).toLocaleDateString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Review Form */}
                <div className="mt-6">
                    <h4 className="text-lg font-semibold">Write a Review</h4>
                    {error && <p className="text-red-500">{error}</p>}
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                            <label className="block">Title:</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="border p-2 w-full"
                                required
                                minLength={3}
                                maxLength={100}
                            />
                        </div>
                        <div>
                            <label className="block">Review:</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="border p-2 w-full"
                                required
                                minLength={10}
                                maxLength={500}
                            />
                        </div>
                        <div>
                            <label className="block">Rating (1-5):</label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                className="border p-2 w-20"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            disabled={!isAuthenticated}
                        >
                            Submit Review
                        </button>
                    </form>
                    {!isAuthenticated && (
                        <p className="mt-2 text-sm text-gray-600">
                            Please <Link to="/login" className="text-blue-500">log in</Link> to submit a review.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;