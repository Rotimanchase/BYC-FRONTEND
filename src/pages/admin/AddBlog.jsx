import React, { useState } from 'react';
import axiosInstance from '../../../axios';
import toast from 'react-hot-toast';

const AddBlog = () => {
  const [formData, setFormData] = useState({
    blogTitle: '',
    blogDescription: '',
    authorName: '',
    authorTitle: '',
    blogImage: '',
    authorImage: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
    const { blogTitle, blogDescription, authorName, authorTitle, blogImage, authorImage } = formData;
    if (!blogImage || !blogImage.startsWith('https://res.cloudinary.com/'))
      return 'A valid Cloudinary blog image URL is required.';
    if (!authorImage || !authorImage.startsWith('https://res.cloudinary.com/'))
      return 'A valid Cloudinary author image URL is required.';
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
    const data = { ...formData };


    try {
      const response = await axiosInstance.post('/api/blog/create', data, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.data.success) {
        toast.success('Blog created successfully!');
        setFormData({
          blogTitle: '',
          blogDescription: '',
          authorName: '',
          authorTitle: '',
          blogImage: '',
          authorImage: '',
        });
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
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="blogImage">
            Blog Image URL
          </label>
          <input id="blogImage" type="text" value={formData.blogImage} onChange={handleInputChange} placeholder="Enter Cloudinary blog image URL"  
          className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required/>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="blogTitle">
            Blog Title
          </label>
          <input id="blogTitle" type="text" value={formData.blogTitle} onChange={handleInputChange} placeholder="Enter blog title"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required/>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="blogDescription">
            Blog Description
          </label>
          <textarea id="blogDescription" rows={4} value={formData.blogDescription} onChange={handleInputChange}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none" placeholder="Enter blog description" />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="authorImage">
            Author Image URL
          </label>
          <input id="authorImage" type="text" value={formData.authorImage} onChange={handleInputChange} placeholder="Enter Cloudinary author image URL"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="authorName">
            Author Name
          </label>
          <input id="authorName" type="text" value={formData.authorName} onChange={handleInputChange} placeholder="Enter author name"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required/>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="authorTitle">
            Author Title
          </label>
          <input id="authorTitle" type="text" value={formData.authorTitle} onChange={handleInputChange} placeholder="Enter author title"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required/>
        </div>
        <button type="submit" className="px-8 py-2.5 bg-red-500 text-white font-medium rounded disabled:bg-red-300" disabled={loading} >
          {loading ? 'Adding...' : 'ADD BLOG'}
        </button>
      </form>
    </div>
  );
};

export default AddBlog;