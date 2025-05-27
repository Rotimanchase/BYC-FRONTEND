import React, { useState, useEffect } from "react";
import axiosInstance from "../../../axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppsContext";

const AdminProducts = () => {
  const { isAdmin } = useAppContext();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get("/api/product");
        if (response.data.success) {
          setProducts(response.data.products);
        } else {
          toast.error("Failed to fetch products");
        }
      } catch (error) {
        toast.error("Error fetching products");
      }
    };
    fetchProducts();
  }, []);

  const handleUpdateStock = async (productId, stock, productStock) => {
    try {
      const response = await axiosInstance.put(`/api/product/${productId}`, {
        stock,
        productStock,
      });
      if (response.data.success) {
        toast.success("Stock updated!");
        setProducts(products.map((p) => (p._id === productId ? response.data.product : p)));
      } else {
        toast.error(response.data.message || "Failed to update stock");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating stock");
    }
  };

  if (!isAdmin) {
    navigate('/admin/login');
    return null;
  }

  return (
    <div className="p-6 no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <h2 className="text-2xl font-bold mb-6">Manage Products</h2>
      {products.map((product) => (
        <div key={product._id} className="mb-6 border p-4 rounded">
          <h3 className="text-xl font-bold">{product.productName}</h3>
          <p>Price: ₦{product.productPrice.toLocaleString()}</p>
          <p>Total Stock: {product.productStock}</p>
          <h4 className="mt-4 font-medium">Stock by Size and Color</h4>
          <table className="w-full mt-2 border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Size</th>
                <th className="border p-2">Color</th>
                <th className="border p-2">Quantity</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {product.stock.length > 0 ? (
                product.stock.map((stockItem, idx) => (
                  <tr key={`${stockItem.size}-${stockItem.color}`}>
                    <td className="border p-2">{stockItem.size}</td>
                    <td className="border p-2">{stockItem.color}</td>
                    <td className="border p-2">
                      <input type="number" value={stockItem.quantity}
                        onChange={(e) => { const newStock = [...product.stock]; newStock[idx].quantity = Number(e.target.value);
                          const newProductStock = newStock.reduce((sum, item) => sum + item.quantity, 0); handleUpdateStock(product._id, newStock, newProductStock);
                        }} className="w-16 text-center border rounded" min="0"/>
                    </td>
                    <td className="border p-2">
                      <button onClick={() => { const newStock = product.stock.filter((_, i) => i !== idx); const newProductStock = newStock.reduce((sum, item) => sum + item.quantity, 0);
                          handleUpdateStock(product._id, newStock, newProductStock); }} className="text-red-500" >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="border p-2 text-center">
                    No stock variants defined
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <button onClick={() => { const newStock = [...product.stock, { size: product.sizes[0] || 'S', color: product.colors[0] || 'Red', quantity: 0 }];
              handleUpdateStock(product._id, newStock, product.productStock);
            }} className="bg-blue-500 text-white py-2 px-4 mt-4 rounded" disabled={product.sizes.length === 0 || product.colors.length === 0}>
            Add Stock Variant
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminProducts;