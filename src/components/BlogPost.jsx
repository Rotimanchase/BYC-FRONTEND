import React, { useEffect, useState } from 'react';
import { FiArrowRight, FiEye, FiHeart } from 'react-icons/fi';
import axiosInstance from '../../axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Pargination from '../components/Pargination';

const BlogPost = ({ showAll = false, enableMobilePagination = false }) => {
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = window.innerWidth < 768; // Detect mobile screens
  const blogsPerPage = isMobile ? 1 : 3; // 1 blog on mobile, 3 on larger screens
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

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

  // Pagination logic
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const paginatedBlogs = showAll && !enableMobilePagination && !isMobile
    ? blogs.slice(0, 3)
    : blogs.slice(indexOfFirstBlog, indexOfLastBlog);

  // Track views once per session
  useEffect(() => {
    const incrementViews = async () => {
      const viewedBlogs = JSON.parse(localStorage.getItem('viewedBlogs')) || [];
      const blogsToTrack = paginatedBlogs;

      try {
        for (const blog of blogsToTrack) {
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
            }
          }
        }
      } catch (error) {
        console.error('Failed to increment views:', error.message);
      }
    };

    if (blogs.length > 0) incrementViews();
  }, [blogs, currentPage]);

  // Handle likes
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

  const truncateDescription = (description, maxLength = 150) => {
    if (!description) return 'No description available';
    if (description.length <= maxLength) return description;
    return description.slice(0, maxLength).trim() + '...';
  };

  return (
    <div className="my-20 md:my-30">
      {/* Show heading only on Home */}
      {!showAll && (
        <h2 className="md:text-[40px] text-2xl font-bold flex justify-center mb-15 md:mb-40">
          BYC AFRICA Blog News
        </h2>
      )}

      {/* Blog display */}
      {paginatedBlogs.length > 0 ? (
        <>
          {/* Mobile: Show one blog card */}
          <div className="md:hidden flex justify-center">
            {paginatedBlogs.map((blog) => (
              <div key={blog._id} className="shadow-xl w-80 mx-5 mb-5">
                <Link to={`/blogs/${blog._id}`} className="block">
                  <img className="w-full h-70" src={blog.blogImage} alt={blog.blogTitle} />
                </Link>
                <div className="flex items-center gap-8 bg-[#E0E0E0] w-70 ml-5 mt-4 mb-4 p-2">
                  <img
                    src={blog.authorImage}
                    alt="author"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <p className="flex items-center gap-3">
                    <FiEye /> {blog.blogViews}
                  </p>
                  <button
                    onClick={() => handleLike(blog._id)}
                    className="flex items-center gap-3 hover:text-red-500 transition"
                  >
                    <FiHeart /> {blog.blogLikes}
                  </button>
                </div>
                <div className="flex ml-5 gap-15 mb-6">
                  <p className="text-sm">{blog.authorName}</p>
                  <p className="text-sm">{blog.authorTitle || 'Author'}</p>
                </div>
                <div className="ml-5 mb-5">
                  <p className="text-[15px] font-bold">
                    {blog.blogTitle.trim().endsWith('.')
                      ? blog.blogTitle.trim()
                      : blog.blogTitle.trim() + '.'}
                  </p>
                  <p className="text-[10px] text-gray-600 line-clamp-3 mr-5">
                    {truncateDescription(blog.blogDescription)}
                  </p>
                  <button className="mt-5 mb-15">
                    <Link
                      to={`/blogs/${blog._id}`}
                      className="flex items-center border border-black py-[9px] px-[15px] text-xs font-bold gap-2"
                    >
                      Read more <FiArrowRight />
                    </Link>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop/Medium: Show grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 ml-8 md:ml-10 mr-5 md:mx-20">
            {paginatedBlogs.map((blog) => (
              <div key={blog._id} className="shadow-xl w-full">
                <Link to={`/blogs/${blog._id}`} className="block">
                  <img className="w-full h-100" src={blog.blogImage} alt={blog.blogTitle} />
                </Link>
                <div className="flex items-center gap-6 bg-[#E0E0E0] w-60 md:ml-10 mt-10 mb-4 p-2">
                  <img
                    src={blog.authorImage}
                    alt="author"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <p className="flex items-center gap-2">
                    <FiEye /> {blog.blogViews}
                  </p>
                  <button
                    onClick={() => handleLike(blog._id)}
                    className="flex items-center gap-4 hover:text-red-500 transition"
                  >
                    <FiHeart /> {blog.blogLikes}
                  </button>
                </div>
                <div className="flex ml-10 gap-50 mb-10">
                  <p className="text-[10px] md:text-[17px]">{blog.authorName}</p>
                  <p className="text-[10px] md:text-[17px]">{blog.authorTitle || 'Author'}</p>
                </div>
                <div className="ml-10 mb-10">
                  <p className="text-[17px] md:text-[20px] font-bold pb-2">
                    {blog.blogTitle.trim().endsWith('.')
                      ? blog.blogTitle.trim()
                      : blog.blogTitle.trim() + '.'}
                  </p>
                  <p className="text-[10px] md:text-[16px] text-gray-600 line-clamp-3 mr-5">
                    {truncateDescription(blog.blogDescription)}
                  </p>
                  <button className="mt-10 mb-15">
                    <Link
                      to={`/blogs/${blog._id}`}
                      className="flex items-center border border-black py-[8px] px-[28px] text-sm font-bold gap-2"
                    >
                      Read more <FiArrowRight />
                    </Link>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-center col-span-full">No blogs available</p>
      )}

      {/* Pagination — Show on Home or when enableMobilePagination is true on mobile */}
      {(!showAll || (enableMobilePagination && isMobile)) && (
        <div className="mt-10">
          <Pargination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
        </div>
      )}

      {/* View All button — Only show on Home */}
      {!showAll && (
        <div className="flex justify-center mt-15 md:mt-20">
          <Link
            to="/blogs"
            className="border border-black py-[9px] px-[40px] md:py-[8px] md:px-[80px] md:text-lg text-l font-bold"
          >
            View All
          </Link>
        </div>
      )}
    </div>
  );
};

export default BlogPost;