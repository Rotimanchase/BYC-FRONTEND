import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { FaMinus, FaPlus, FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import ProductRatings from "../components/ProductRatings";
import toast from "react-hot-toast";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../axios";
import { useAppContext } from "../context/AppsContext";

const Modifycart = ({ product: propProduct }) => {
  const { addToCart, fetchCart, cart, user, removeFromCart } = useAppContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [count, setCount] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (propProduct) {
      setProduct(propProduct);
      setTotalPrice(propProduct.productPrice || 2800);
      setSelectedSize(propProduct.sizes?.[0] || null);
      setSelectedColor(propProduct.colors?.[0] || null);
      setCount(1);
    } else {
      const fetchProduct = async () => {
        try {
          const response = await axiosInstance.get(`/api/product/${id}`);
          if (response.data.success) {
            const fetchedProduct = response.data.product;
            setProduct(fetchedProduct);
            setTotalPrice(fetchedProduct.productPrice || 2800);
            setSelectedSize(fetchedProduct.sizes?.[0] || null);
            setSelectedColor(fetchedProduct.colors?.[0] || null);
            setCount(1);
          } else {
            setError("Product not found");
            toast.error("Product not found");
            navigate("/cart");
          }
        } catch (error) {
          console.error("Error fetching product:", error.response?.data || error.message);
          setError("Failed to load product");
          toast.error(error.response?.data?.message || "Failed to load product");
          navigate("/cart");
        }
      };
      if (id) fetchProduct();
    }
  }, [id, navigate, propProduct]);

  useEffect(() => {
    if (product && cart.length > 0) {
      const existingItem = cart.find(
        (item) =>
          item.productId._id === product._id &&
          (item.size || null) === (selectedSize || null) &&
          (item.color || null) === (selectedColor || null)
      );
      if (existingItem && existingItem.quantity !== count) {
        setCount(existingItem.quantity);
      }
      setTotalPrice(count * (product?.productPrice || 2800));
    }
  }, [cart, product, selectedSize, selectedColor]);

  const getStockForSizeColor = (size, color) => {
    if (!product?.stock || !size || !color) {
      console.warn("Missing stock, size, or color:", { stock: product?.stock, size, color });
      return 0;
    }
    const stockEntry = product.stock.find(
      (entry) => entry.size === size && entry.color === color
    );
    const quantity = stockEntry ? stockEntry.quantity : 0;
    return quantity;
  };

  const images = product?.productImage?.length > 0
    ? product.productImage
    : ['/placeholder.jpg'];

  const handlePrev = () => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  const handleIncrease = () => {
    const currentStock = getStockForSizeColor(selectedSize, selectedColor);
    if (currentStock === 0) {
      toast.error(`No stock available for ${selectedSize || 'N/A'}/${selectedColor || 'N/A'}`);
      return;
    }
    if (count >= currentStock) {
      toast.error(`Only ${currentStock} items in stock for ${selectedSize || 'N/A'}/${selectedColor || 'N/A'}`);
      return;
    }
    const newCount = count + 1;
    setCount(newCount);
    setTotalPrice(newCount * (product?.productPrice || 2800));
  };

  const handleDecrease = () => {
    if (count > 1) {
      const newCount = count - 1;
      setCount(newCount);
      setTotalPrice(newCount * (product?.productPrice || 2800));
    }
  };

  const handleAddToCart = async () => {
    if (!product?._id) {
      console.error("No product ID found");
      toast.error("Product not found");
      return;
    }
    if (!user) {
      console.warn("User not logged in");
      toast.error("Please log in to add to cart");
      navigate("/account");
      return;
    }
    if (!product.inStock) {
      toast.error("Product is out of stock");
      return;
    }
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error(`Please select a size: ${product.sizes.join(', ')}`);
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      toast.error(`Please select a color: ${product.colors.join(', ')}`);
      return;
    }
    const currentStock = getStockForSizeColor(selectedSize, selectedColor);
    if (count > currentStock) {
      toast.error(`Only ${currentStock} items in stock for ${selectedSize || 'N/A'}/${selectedColor || 'N/A'}`);
      return;
    }
    try {
      const existingItems = cart.filter(
        (item) =>
          item.productId._id === product._id &&
          (item.size || null) === (selectedSize || null) &&
          (item.color || null) === (selectedColor || null)
      );

      if (existingItems.length > 0) {
        for (const item of existingItems) {
          await removeFromCart(product._id, selectedSize, selectedColor);
        }
      }

      await addToCart(product._id, count, selectedSize, selectedColor);
      await fetchCart();
      navigate("/cart");
    } 
    catch (error) {
      console.error("Error updating cart:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to update cart.");
    }
  };

  if (error) return <p>{error}</p>;
  if (!product) return <p>Loading...</p>;

  return (
    <div className="md:mx-15 mt-10">
      <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white py-8 pl-5 md:pl-0">
        <Link to="/" type="button">
          <p>Home</p>
        </Link>
        <svg width="8" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m1 15 7.875-7L1 1" stroke="#6B7280" strokeOpacity=".8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p>{product.category?.name || "Men"}</p>
        <svg width="8" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m1 15 7.875-7L1 1" stroke="#6B7280" strokeOpacity=".8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="text-red-500">Cart</p>
      </div>

      <div className="md:border-2 rounded border-[#F3F0F0] p-4 mb-10">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-152 w-full flex flex-col items-center md:p-4">
            <img src={images[currentIndex]} className="md:w-3/4 w-full object-contain" alt={`slide ${currentIndex + 1}`}
              onError={(e) => { console.error('Image load error:', images[currentIndex]); e.target.src = '/placeholder.jpg'; }} loading="lazy"/>
            {images.length > 1 && (
              <div className="flex items-center justify-center mt-6 space-x-4">
                <button onClick={handlePrev} className="bg-white shadow p-3 text-gray-500" disabled={images.length <= 1}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-left" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                  </svg>
                </button>
                <div className="md:flex space-x-2 hidden">
                  {images.map((img, index) => (
                    <img key={index} src={img} className={`w-20 h-14 rounded cursor-pointer object-cover ${ currentIndex === index ? "border-2 border-red-500" : ""}`}
                      onClick={() => handleThumbnailClick(index)} alt={`thumb ${index}`}
                      onError={(e) => { console.error('Thumbnail load error:', img); e.target.src = '/placeholder.jpg';}} loading="lazy"/>
                  ))}
                </div>
                <button onClick={handleNext} className="bg-white shadow p-3 text-gray-500" disabled={images.length <= 1}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="lg:w-7/12 p-4">
            <h2 className="text-3xl font-bold mb-4">{product?.productName || "MEN BOXERS BYC 1166"}</h2>
            <p className="text-lg mb-4">{product?.productDescription?.split(".")[0] || "100% Cotton 12 Pieces Of Mens Boxer"}</p>
            <div className="flex mb-6 items-center">
              {[...Array(5)].map((_, i) => (
                <span key={i}>
                  {i < Math.floor(product?.ratings || 0) ? (
                    <FaStar className="text-yellow-500" />
                  ) : i < Math.ceil(product?.ratings || 0) && (product?.ratings % 1) >= 0.5 ? (
                    <FaStarHalfAlt className="text-yellow-500" />
                  ) : (
                    <FaRegStar className="text-gray-300" />
                  )}
                </span>
              ))}
              <span className="ml-3">{product?.ratings?.toFixed(1) || "0.0"}</span>
            </div>
            <div className="border-t border-[#F3F0F0] pt-6">
              <h3 className="text-2xl font-bold mb-6 mt-4">
                ₦{totalPrice.toLocaleString()}.00
              </h3>
              <div className="md:flex items-center gap-3 mb-6">
                <div>
                  <h4 className="text-xl font-semibold mb-3">Available Sizes</h4>
                  <div className="flex gap-2 mb-5 md:mb-0">
                    {product?.sizes?.length > 0 ? (
                      <select id="size" className="mt-1 p-2 border rounded-md w-full" value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                        {product.sizes?.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p>No sizes available</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-xl mb-3">Available Colors</h4>
                  <div className="flex gap-1">
                    {product?.colors?.length > 0 ? (
                      product.colors?.map((color) => (
                        <button key={color} onClick={() => setSelectedColor(color)} className={`w-10 h-10 rounded-full border-2 
                          ${color === selectedColor ? "border-red-700" : "border-gray-100"}`} style={{ backgroundColor: color }}/>
                      ))
                    ) : (
                      <p>No colors available</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="md:flex items-center mb-5">
                <button onClick={handleDecrease} className="bg-red-500 py-3 md:px-4 px-5 cursor-pointer text-white">
                  <FaMinus />
                </button>
                <input disabled value={count} className="text-center w-12 mx-2" />
                <button onClick={handleIncrease} className="bg-red-500 py-3 md:px-4 px-5 cursor-pointer text-white">
                  <FaPlus />
                </button>
              </div>
              <button onClick={handleAddToCart} className="md:w-102 w-46 bg-red-500 text-white py-3 rounded flex items-center justify-center md:mt-10">
                <img src={assets.mcart} alt="cart" className="mr-2" />
                Update Cart
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="md:border-2 border-[#F3F0F0] rounded-lg p-6 mb-10">
        <h3 className="text-xl font-bold m-5">Product Description</h3>
        <div className="border-t-2 border-[#F3F0F0]">
          <p className="text-gray-600 md:text-[19px] p-5">
            {product?.productDescription}
          </p>
        </div>
      </div>
      <div className="md:border-2 border-[#F3F0F0] rounded-lg p-6">
        <h4 className="text-2xl font-bold my-6">Customer Reviews</h4>
        <div className="border-t-2 border-[#F3F0F0] pt-8">
          <p className="text-lg mb-4">PRODUCT RATINGS ({product?.reviews?.length || 0})</p>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <ProductRatings product={product} />
          </div>
        </div>
        <div className="flex justify-between items-center md:border-b border-[#F3F0F0] pb-2 mb-4 md:mt-18">
          <h5 className="text-base font-medium pb-3">PRODUCT REVIEWS ({product?.reviews?.length || 0})</h5>
          <a className="text-red-500 flex items-center cursor-pointer">
            See all
            <img src={assets.redvec} className="ml-2" alt="arrow" />
          </a>
        </div>
        {product?.reviews?.length > 0 ? (
          product.reviews.map((review, idx) => (
            <div key={idx} className="border-b border-[#F3F0F0] pb-8 mb-4 pt-4">
              <h5 className="font-semibold">{review.title}</h5>
              <p className="text-sm text-gray-600">{review.description}</p>
              <div className="flex items-center gap-1 mt-2 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className={i < review.rating ? "bi bi-star-fill" : "bi bi-star"}></i>
                ))}
                <span className="text-sm text-gray-500"> {new Date(review.date).toLocaleDateString()} by{" "}
                  {typeof review.author === 'object' && review.author?.username ? review.author.username : typeof review.author === 'string' ? review.author : 'Anonymous'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600">No reviews yet.</p>
        )}
      </div>
    </div>
  );
};

export default Modifycart;