import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import axiosInstance from '../../../axios';
import toast from 'react-hot-toast';

const AddBlog = () => {
  const [formData, setFormData] = useState({
    blogTitle: '',
    blogDescription: '',
    authorName: '',
    authorTitle: '',
  });
  const [blogImage, setBlogImage] = useState(null);
  const [authorImage, setAuthorImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (type === 'blogImage') {
        setBlogImage(file);
      } else if (type === 'authorImage') {
        setAuthorImage(file);
      }
    } else {
      toast.error('Please upload a valid image file.');
    }
  };

  const validateForm = () => {
    const { blogTitle, blogDescription, authorName, authorTitle } = formData;
    if (!blogImage) return 'Blog image is required.';
    if (!authorImage) return 'Author image is required.';
    if (!blogTitle || blogTitle.length < 5 || blogTitle.length > 255)
      return 'Blog title must be between 5 and 255 characters.';
    if (blogDescription && blogDescription.length < 5)
      return 'Blog description must be at least 5 characters if provided.';
    if (!authorName || authorName.length < 2 || authorName.length > 50)
      return 'Author name must be between 2 and 50 characters.';
    if (!authorTitle || authorTitle.length < 5 || authorTitle.length > 50)
      return 'Author title must be between 5 and 50 characters.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('images', blogImage);
    data.append('images', authorImage);
    data.append('blogTitle', formData.blogTitle);
    data.append('blogDescription', formData.blogDescription);
    data.append('authorName', formData.authorName);
    data.append('authorTitle', formData.authorTitle);

    // Log FormData contents
    console.log('FormData contents:');
    for (let [key, value] of data.entries()) {
      console.log(`  ${key}: ${value instanceof File ? `${value.name} (${value.type}, ${value.size} bytes)` : value}`);
    }

    try {
      console.log('Sending request to /api/blog/create');
      const response = await axiosInstance.post('/api/blog/create', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Response:', response.data);
      if (response.data.success) {
        toast.success('Blog created successfully!');
        setFormData({ blogTitle: '', blogDescription: '', authorName: '', authorTitle: '' });
        setBlogImage(null);
        setAuthorImage(null);
      } else {
        toast.error(response.data.message || 'Failed to create blog.');
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(error.response?.data?.message || 'Error creating blog.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
        <div>
          <p className="text-base font-medium">Blog Image</p>
          <div className="flex items-center gap-3 mt-2">
            <label htmlFor="blogImage">
              <input
                onChange={(e) => handleFileChange(e, 'blogImage')}
                accept="image/*"
                type="file"
                id="blogImage"
                hidden
              />
              <img
                className="max-w-24 cursor-pointer"
                src={blogImage ? URL.createObjectURL(blogImage) : assets.uploadArea}
                alt="Blog Image"
                width={100}
                height={100}
              />
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="blogTitle">
            Blog Title
          </label>
          <input
            id="blogTitle"
            type="text"
            value={formData.blogTitle}
            onChange={handleInputChange}
            placeholder="Enter blog title"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            required
          />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="blogDescription">
            Blog Description
          </label>
          <textarea
            id="blogDescription"
            rows={4}
            value={formData.blogDescription}
            onChange={handleInputChange}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Enter blog description"
          />
        </div>
        <div>
          <p className="text-base font-medium">Author Image</p>
          <div className="flex items-center gap-3 mt-2">
            <label htmlFor="authorImage">
              <input
                onChange={(e) => handleFileChange(e, 'authorImage')}
                accept="image/*"
                type="file"
                id="authorImage"
                hidden
              />
              <img
                className="max-w-24 cursor-pointer"
                src={authorImage ? URL.createObjectURL(authorImage) : assets.uploadArea}
                alt="Author Image"
                width={100}
                height={100}
              />
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="authorName">
            Author Name
          </label>
          <input
            id="authorName"
            type="text"
            value={formData.authorName}
            onChange={handleInputChange}
            placeholder="Enter author name"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            required
          />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="authorTitle">
            Author Title
          </label>
          <input
            id="authorTitle"
            type="text"
            value={formData.authorTitle}
            onChange={handleInputChange}
            placeholder="Enter author title"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            required
          />
        </div>
        <button
          type="submit"
          className="px-8 py-2.5 bg-red-500 text-white font-medium rounded disabled:bg-red-300"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'ADD BLOG'}
        </button>
      </form>
    </div>
  );
};

export default AddBlog;