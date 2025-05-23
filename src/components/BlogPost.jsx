import React, { useEffect, useState } from 'react';
import { FiArrowRight, FiEye, FiHeart } from 'react-icons/fi';
import axiosInstance from '../../axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Pargination from '../components/Pargination';

const BlogPost = ({ showAll = false }) => {
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 3;

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

  // Pagination logic (only applies when showAll = false)
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const paginatedBlogs = showAll ? blogs.slice(0, 3) : blogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

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

      {/* Blog grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-5 ml-8 md:ml-10 mr-5 md:mx-20">
        {paginatedBlogs.map((blog) => (
          <div key={blog._id} className="shadow-xl w-75 lg:w-full md:w-full">
            <Link to={`/blogs/${blog._id}`} className="block">
              <img className="w-full h-65 md:h-100" src={blog.blogImage} alt={blog.blogTitle} />
            </Link>
            <div className="flex items-center gap-8 lg:gap-15 md:gap-6 bg-[#E0E0E0] w-65 lg:w-100 md:w-60 ml-5 md:ml-10 mt-4 md:mt-10 mb-4 p-2">
              <img src={blog.authorImage} alt="author" className="w-10 h-10 rounded-full object-cover" />
              <p className="flex items-center gap-3 lg:gap-4 md:gap-2">
                <FiEye /> {blog.blogViews}
              </p>
              <button
                onClick={() => handleLike(blog._id)}
                className="flex items-center gap-3 md:gap-4 hover:text-red-500 transition"
              >
                <FiHeart /> {blog.blogLikes}
              </button>
            </div>
            <div className="flex ml-5 md:ml-10 gap-15 md:gap-50 mb-6 md:mb-10">
              <p className="text-sm lg:text-[17px] md:text-[10px]">{blog.authorName}</p>
              <p className="text-sm lg:text-[17px] md:text-[10px]">{blog.authorTitle || 'Author'}</p>
            </div>
            <div className="md:ml-10 ml-5 mb-5 md:mb-10">
              <p className="lg:text-[20px] md:text-[17px] text-[15px] font-bold md:pb-2">
                {blog.blogTitle.trim().endsWith('.') ? blog.blogTitle.trim() : blog.blogTitle.trim() + '.'}
              </p>
              <p className="lg:text-[16px] md:text-[10px] mr-5 text-[10px] text-gray-600 line-clamp-3">
                {truncateDescription(blog.blogDescription)}
              </p>
              <button className="mt-5 md:mt-10 mb-15">
                <Link
                  to={`/blogs/${blog._id}`}
                  className="flex items-center border border-black py-[9px] px-[15px] md:py-[8px] md:px-[28px] text-xs md:text-sm font-bold gap-2">
                  Read more <FiArrowRight />
                </Link>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View All button — Only show on Home */}
      {!showAll && (
        <div className="flex justify-center mt-15 md:mt-20">
          <Link to="/blogs" className="border border-black py-[9px] px-[40px] md:py-[8px] md:px-[80px] md:text-lg text-l font-bold">
            View All
          </Link>
        </div>
      )}

      {/* Pagination — Only on Home */}
      {!showAll && (
        <div className="mt-10">
          <Pargination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
        </div>
      )}
    </div>
  );
};

export default BlogPost;
