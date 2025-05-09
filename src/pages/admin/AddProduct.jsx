import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/appContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../../../axios';

const AddProduct = () => {
  const { isAdmin } = useAppContext();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [productName, setProductName] = useState('');
  const [productNumber, setProductNumber] = useState('');
  const [category, setCategory] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [stock, setStock] = useState([]); // New state for size/color stock
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { id: 'Men', name: 'Men' },
    { id: 'Women', name: 'Women' },
    { id: 'Children', name: 'Children' },
  ];

  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow'];

  if (!isAdmin) {
    navigate('/admin/login');
    return null;
  }

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const updatedFiles = [...files];
    updatedFiles[index] = file;
    setFiles(updatedFiles);
  };

  const handleSizeChange = (size) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleColorChange = (color) => {
    setColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleStockChange = (size, color, quantity) => {
    setStock((prev) => {
      const existing = prev.find((item) => item.size === size && item.color === color);
      if (existing) {
        return prev.map((item) =>
          item.size === size && item.color === color ? { ...item, quantity: Number(quantity) } : item
        );
      }
      return [...prev, { size, color, quantity: Number(quantity) }];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !productName ||
      !productNumber ||
      !category ||
      !productPrice ||
      !productStock ||
      !productDescription ||
      files.length === 0
    ) {
      toast.error('Please fill all required fields and upload at least one image');
      return;
    }

    if (productName.length < 3 || productName.length > 50) {
      toast.error('Product name must be 3-50 characters');
      return;
    }
    if (productNumber.length < 3 || productNumber.length > 50) {
      toast.error('Product code must be 3-50 characters');
      return;
    }
    if (productDescription.length < 10 || productDescription.length > 500) {
      toast.error('Description must be 10-500 characters');
      return;
    }
    if (Number(productPrice) < 0) {
      toast.error('Price must be non-negative');
      return;
    }
    if (Number(productStock) < 1) {
      toast.error('Stock must be at least 1');
      return;
    }

    const stockSum = stock.reduce((sum, item) => sum + item.quantity, 0);
    if (stockSum !== Number(productStock)) {
      toast.error(`Sum of size/color stock (${stockSum}) must equal total stock (${productStock})`);
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('productNumber', productNumber);
    formData.append('category', category);
    formData.append('productPrice', productPrice);
    formData.append('productStock', productStock);
    formData.append('productDescription', productDescription);
    sizes.forEach((size) => formData.append('sizes[]', size));
    colors.forEach((color) => formData.append('colors[]', color));
    formData.append('stock', JSON.stringify(stock));
    files.forEach((file, index) => {
      if (file) formData.append('images', file);
    });

    console.log('FormData entries:', [...formData.entries()]);

    try {
      const response = await axiosInstance.post('/api/product/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        toast.success('Product added successfully!');
        setFiles([]);
        setProductName('');
        setProductNumber('');
        setCategory('');
        setProductPrice('');
        setProductStock('');
        setProductDescription('');
        setSizes([]);
        setColors([]);
        setStock([]);
      } else {
        toast.error(response.data.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Error adding product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
        <div>
          <p className="text-base font-medium">Product Images</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {Array(4)
              .fill('')
              .map((_, index) => (
                <label key={index} htmlFor={`image${index}`}>
                  <input
                    onChange={(e) => handleFileChange(e, index)}
                    accept="image/*"
                    type="file"
                    id={`image${index}`}
                    hidden />
                  <img
                    className="max-w-24 cursor-pointer"
                    src={files[index] ? URL.createObjectURL(files[index]) : assets.uploadArea}
                    alt="uploadArea"
                    width={100}
                    height={100}
                  />
                </label>
              ))}
          </div>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">
            Product Name
          </label>
          <input
            onChange={(e) => setProductName(e.target.value)}
            value={productName}
            id="product-name"
            type="text"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            required
          />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-number">
            Product Code
          </label>
          <input
            onChange={(e) => setProductNumber(e.target.value)}
            value={productNumber}
            id="product-number"
            type="text"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            required
          />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-description">
            Product Description
          </label>
          <textarea
            onChange={(e) => setProductDescription(e.target.value)}
            value={productDescription}
            id="product-description"
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Type here"
            required
          />
        </div>
        <div className="w-full flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="category">
            Category
          </label>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            id="category"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">
              Product Price
            </label>
            <input
              onChange={(e) => setProductPrice(e.target.value)}
              value={productPrice}
              id="product-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-stock">
              Total Stock Quantity
            </label>
            <input
              onChange={(e) => setProductStock(e.target.value)}
              value={productStock}
              id="product-stock"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-base font-medium">Sizes</p>
          <div className="flex flex-wrap gap-3">
            {availableSizes.map((size) => (
              <label key={size} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={sizes.includes(size)}
                  onChange={() => handleSizeChange(size)}
                  className="h-4 w-4"
                />
                {size}
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-base font-medium">Colors</p>
          <div className="flex flex-wrap gap-3">
            {availableColors.map((color) => (
              <label key={color} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={colors.includes(color)}
                  onChange={() => handleColorChange(color)}
                  className="h-4 w-4"
                />
                {color}
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-base font-medium">Stock by Size and Color</p>
          {sizes.length > 0 && colors.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2">Size</th>
                  <th className="border p-2">Color</th>
                  <th className="border p-2">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map((size) =>
                  colors.map((color) => (
                    <tr key={`${size}-${color}`}>
                      <td className="border p-2">{size}</td>
                      <td className="border p-2">{color}</td>
                      <td className="border p-2">
                        <input
                          type="number"
                          min="0"
                          value={
                            stock.find((item) => item.size === size && item.color === color)?.quantity || 0
                          }
                          onChange={(e) => handleStockChange(size, color, e.target.value)}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <p>Select sizes and colors to add stock quantities</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-2.5 bg-red-500 text-white font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ADD
        </button>
      </form>
    </div>
  );
};

export default AddProduct;