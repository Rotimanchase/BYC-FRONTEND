import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { FiEye, FiHeart } from 'react-icons/fi';
import Pargination from '../components/Pargination';
import axiosInstance from '../../axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 3; // Adjusted for single-column layout
  const BASE_URL = 'http://localhost:4800'; // Backend base URL

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axiosInstance.get('/api/blog');
        if (res.data.success) {
          setBlogs(res.data.blogs);
        }
      } catch (error) {
        toast.error(error.message || 'Failed to fetch blogs');
      }
    };

    fetchBlogs();
  }, []);

  // Increment views for the current page's blogs, only if not viewed this session
  useEffect(() => {
    const incrementViews = async () => {
      const viewedBlogs = JSON.parse(localStorage.getItem('viewedBlogs')) || [];
      const currentBlogs = blogs.slice((currentPage - 1) * blogsPerPage, currentPage * blogsPerPage);
      try {
        for (const blog of currentBlogs) {
          if (!viewedBlogs.includes(blog._id)) {
            const res = await axiosInstance.patch(`/api/blog/${blog._id}/views`);
            if (res.data.success) {
              setBlogs((prev) =>
                prev.map((b) =>
                  b._id === blog._id ? { ...b, blogViews: res.data.blog.blogViews } : b
                )
              );
              viewedBlogs.push(blog._id);
              localStorage.setItem('viewedBlogs', JSON.stringify(viewedBlogs));
            } else {
              console.warn(`Failed to increment views for blog ${blog._id}: ${res.data.message}`);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to update views: ${error.message}`, error.response?.data);
      }
    };

    if (blogs.length > 0 && currentPage === 1) incrementViews(); // Run only on first page load
  }, [blogs, currentPage]);

  const handleLike = async (id) => {
    const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs')) || [];
    if (likedBlogs.includes(id)) {
      toast('You already liked this blog!');
      return;
    }

    try {
      const res = await axiosInstance.patch(`/api/blog/${id}/likes`);
      if (res.data.success) {
        setBlogs((prev) =>
          prev.map((blog) =>
            blog._id === id ? { ...blog, blogLikes: res.data.blog.blogLikes } : blog
          )
        );
        likedBlogs.push(id);
        localStorage.setItem('likedBlogs', JSON.stringify(likedBlogs));
      }
    } catch (error) {
      toast.error('Failed to like blog');
    }
  };

  // Truncate description to ~150 characters
  const truncateDescription = (description, maxLength = 150) => {
    if (description.length <= maxLength) return description;
    return description.slice(0, maxLength).trim() + '...';
  };

  // Pagination logic
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  return (
    <div className="w-full mx-auto px-10">
      <div className="text-center py-15">
        <h1 className="text-2xl md:text-4xl font-bold py-5">BYC AFRICA Blog News</h1>
      </div>

      {currentBlogs.map((item, index) => (
        <div
          key={item._id}
          className={`flex flex-col lg:flex-row ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} mb-16 gap-6`}
        >
          <Link to={`/blogs/${item._id}`} className="w-full lg:w-1/2">
            <img src={`${BASE_URL}${item.blogImage}`} alt="blog" className="w-full h-full object-cover" />
          </Link>
          <div className="w-full lg:w-1/2 px-4">
            <h3 className="md:text-4xl text-1xl font-bold mb-5 md:mb-18 mt-5">{item.blogTitle}</h3>
            <p className="text-justify text-sm md:text-2xl">{truncateDescription(item.blogDescription)}</p>
            <div>
              <Link
                to={`/blogs/${item._id}`}
                className="inline-flex items-center gap-2 border border-black md:px-6 px-4 py-2 md:py-3 mt-6 font-bold text-sm transition"
              >
                Read More <img src={assets.larrow} alt="arrow" className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex items-center gap-8 lg:gap-15 md:gap-6 bg-[#E0E0E0] w-63 lg:w-100 md:w-60 mt-4 md:mt-10 mb-1 p-2">
              <img
                src={`${BASE_URL}${item.authorImage}`}
                alt="author"
                className="w-10 h-10 rounded-full object-cover"
              />
              <p className="flex items-center gap-3 lg:gap-4 md:gap-2">
                <FiEye /> {item.blogViews}
              </p>
              <button
                onClick={() => handleLike(item._id)}
                className="flex items-center gap-3 md:gap-4 hover:text-red-500 transition"
              >
                <FiHeart /> {item.blogLikes}
              </button>
            </div>
            <div className="flex gap-15 md:gap-50 mb-6 md:mb-10">
              <p className="text-sm lg:text-[17px] md:text-[10px]">{item.authorName}</p>
              <p className="text-sm lg:text-[17px] md:text-[10px]">{item.authorTitle || 'Author'}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-10">
        <Pargination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Blog;