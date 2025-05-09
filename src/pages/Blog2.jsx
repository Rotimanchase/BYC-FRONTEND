import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import BlogPost from '../components/BlogPost';

const Blog2 = () => {
  const { id } = useParams(); // Get blog ID from URL
  const [blog, setBlog] = useState(null);
  const BASE_URL = 'http://localhost:4800'; // Backend base URL

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axiosInstance.get(`/api/blog/${id}`);
        setBlog(res.data.blog);

        // Increment views AFTER fetching blog
        await axiosInstance.patch(`/api/blog/${id}/views`);
      } catch (error) {
        console.error('Error loading blog:', error);
      }
    };

    fetchBlog();
  }, [id]);

  // Split description into two parts after ~200-300 characters
  const splitDescription = (description, maxLength = 250) => {
    if (!description || description.length <= maxLength) {
      return [description || '', ''];
    }
    // Find a sentence boundary (., !, ?) or space near maxLength
    let splitPoint = maxLength;
    const boundary = description.slice(0, maxLength + 50).lastIndexOf('.');
    const spaceBoundary = description.slice(0, maxLength + 50).lastIndexOf(' ');
    if (boundary > maxLength - 50 && boundary < maxLength + 50) {
      splitPoint = boundary + 1;
    } else if (spaceBoundary > maxLength - 50 && spaceBoundary < maxLength + 50) {
      splitPoint = spaceBoundary + 1;
    }
    return [description.slice(0, splitPoint).trim(), description.slice(splitPoint).trim()];
  };

  if (!blog) return <p className="p-10">Loading blog...</p>;

  const [descBeforeImage, descAfterImage] = splitDescription(blog.blogDescription);

  return (
    <>
      <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white py-8 pl-15">
        <a href="/" type="button">
          <p>Home</p>
        </a>
        <svg width="8" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m1 15 7.875-7L1 1" stroke="#6B7280" strokeOpacity=".8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p>Blogs</p>
      </div>

      <div className="w-full px-6 md:px-20">
        <div className="text-center my-10">
          <h1 className="text-[18px] md:text-5xl font-bold py-5">{blog.blogTitle}</h1>
        </div>

        <div className="max-w-[1800px]">
          <div className="w-full">
            {descBeforeImage && (
              <div className="my-5 text-sm md:text-[23.5px] leading-relaxed text-gray-700">
                <p className="text-justify">{descBeforeImage}</p>
              </div>
            )}
            <img src={`${BASE_URL}${blog.blogImage}`} alt="Blog" className="w-full h-auto rounded-lg my-5" />
            {descAfterImage && (
              <div className="my-5 text-sm md:text-[23.5px] leading-relaxed text-gray-700">
                <p className="text-justify">{descAfterImage}</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-16">
          <h1 className="text-xl md:text-5xl font-bold py-5">More Blog News</h1>
        </div>
      </div>

      <BlogPost hideHeaderAndButton />
    </>
  );
};

export default Blog2;