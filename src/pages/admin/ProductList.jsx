import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../../axios';
import { currency } from '../../assets/assets';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/api/product');
        if (response.data.success) {
          setProducts(response.data.products || []);
        } else {
          toast.error(response.data.message || 'Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error.response?.data || error.message);
        toast.error(error.response?.data?.message || 'Error fetching products');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleStockToggle = async (productId, currentStockStatus) => {
    try {
      const response = await axiosInstance.post('/api/product/stock', {
        productId,
        inStock: !currentStockStatus,
      });
      if (response.data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId ? { ...p, inStock: !currentStockStatus } : p
          )
        );
        toast.success('Stock status updated!');
      } else {
        toast.error(response.data.message || 'Failed to update stock status');
      }
    } catch (error) {
      console.error('Error updating stock:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Access denied. Please log in as admin.');
    }
  };

  return (
    <div className="flex-1 py-10 flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        <h2 className="pb-4 text-lg font-medium">All Products</h2>
        {isLoading ? (
          <div>Loading products...</div>
        ) : (
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <table className="md:table-auto table-fixed w-full overflow-hidden">
              <thead className="text-gray-900 text-sm text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold truncate">Product</th>
                  <th className="px-4 py-3 font-semibold truncate">Details</th>
                  <th className="px-4 py-3 font-semibold truncate hidden md:block">Selling Price</th>
                  <th className="px-4 py-3 font-semibold truncate">In Stock</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-3 text-center">No products found.</td>
                  </tr>
                ) : (
                  products.map((product) => {
                    return (
                      <tr key={product._id} className="border-t border-gray-500/20">
                        <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                          <div className="border border-gray-300 rounded p-2">
                            <img
                              src={
                                product.productImage && product.productImage.length > 0
                                  ? product.productImage[0]
                                  : 'null'
                              }
                              alt={product.productName}
                              className="w-16"
                              onError={(e) => {
                                console.error('Image load error:', product.productImage[0]);
                                e.target.src = 'https://via.placeholder.com/64';
                              }}
                            />
                          </div>
                          <span className="truncate max-sm:hidden w-full">{product.productName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <p><strong>Category:</strong> {product.category.name}</p>
                            <p><strong>Code:</strong> {product.productNumber}</p>
                            <p><strong>Description:</strong> {product.productDescription}</p>
                            <p><strong>Sizes:</strong> {product.sizes.length > 0 ? product.sizes.join(', ') : 'None'}</p>
                            <p><strong>Colors:</strong> {product.colors.length > 0 ? product.colors.join(', ') : 'None'}</p>
                            <p><strong>Stock:</strong> {product.productStock}</p>
                            <p><strong>Ratings:</strong> {product.ratings}</p>
                            <p><strong>Reviews:</strong> {product.reviews.length}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 max-sm:hidden">{currency}{product.productPrice}</td>
                        <td className="px-4 py-3">
                          <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={product.inStock}
                              onChange={() => handleStockToggle(product._id, product.inStock)}
                            />
                            <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                            <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                          </label>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;