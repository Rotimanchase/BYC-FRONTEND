import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { useAppContext } from '../context/appContext';

const Account = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { fetchCart } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const api = isSignUp ? '/api/user/register' : '/api/user/login';
      const payload = isSignUp ? { name, email, password } : { email, password };

      const { data } = await axiosInstance.post(api, payload);

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user)); // Store user data
        toast.success(isSignUp ? 'Account created!' : 'Logged in successfully');
        await fetchCart(); // Fetch cart after login/signup
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="md:mt-40 mt-20 md:mx-15 mx-5">
      <div className="border-1 border-gray-300 rounded-sm md:pb-35 mb-20 py-10 px-4 md:px-10">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Login Section */}
          <div className="border-r-0 md:border-r-1 border-gray-300 pr-0 md:pr-10 md:mt-15">
            <div className="text-center">
              <h4 className="md:text-3xl text-xl font-bold mb-6">Login</h4>
            </div>
            <div className="space-y-5">
              <form className="w-full" onSubmit={handleSubmit}>
                <div className='mb-5'>
                  <label htmlFor="email" className="block text-lg font-light mb-2">Email address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-red-500 rounded-md outline-0"
                  />
                </div>

                <div className='mb-5'>
                  <label htmlFor="password" className="block text-lg font-light mb-2">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-red-500 rounded-md outline-0"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="checkbox" />
                    <label htmlFor="checkbox" className="text-sm">Remember Me</label>
                  </div>
                  <p className="text-sm cursor-pointer">Forgot your password?</p>
                </div>

                <button type="submit" className="w-full bg-red-600 text-white font-semibold p-3 rounded-md hover:bg-red-700 transition mt-5">
                  Login
                </button>
              </form>
            </div>
          </div>

          {/* Create Account Section */}
          <div className="pl-0 md:pl-10 md:mt-15">
            <div className="text-center mb-10">
              <h4 className="md:text-3xl text-xl font-bold mb-6">{isSignUp ? 'Create your account' : 'Create your account'}</h4>
              {!isSignUp && (
                <p className="text-gray-600 mt-12 md:text-xl text-[12px]">
                  Create your customer account in just a few clicks! <br /> You can register using your email address.
                </p>
              )}
            </div>

            {isSignUp && (
              <form className="w-full" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block text-lg font-light mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border border-red-500 rounded-md outline-0"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-lg font-light mb-1">Email address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-red-500 rounded-md outline-0"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-lg font-light mb-1">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-red-500 rounded-md outline-0"
                    required
                  />
                </div>

                <button type="submit" className="w-full bg-red-600 text-white font-semibold p-3 rounded-md hover:bg-red-700 transition mt-5">
                  Create Account
                </button>
              </form>
            )}

            {!isSignUp && (
              <div className="md:mt-43 mt-15">
                <button
                  className="w-full bg-red-600 text-white font-semibold p-3 rounded-md hover:bg-red-700 transition md:text-[15px] text-xs"
                  onClick={() => setIsSignUp(true)}
                >
                  CREATE AN ACCOUNT VIA E-MAIL
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;