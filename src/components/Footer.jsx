import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <footer className="bg-black text-white mt-30 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h5 className="text-lg font-semibold mb-4">Company Info</h5>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:underline">About Us</a></li>
              <li><a href="#" className="text-sm hover:underline">Affiliate</a></li>
              <li><a href="#" className="text-sm hover:underline">Fashion Blogger</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-lg font-semibold mb-4">Help & Support</h5>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:underline">Shipping Info</a></li>
              <li><a href="#" className="text-sm hover:underline">Refunds</a></li>
              <li><a href="#" className="text-sm hover:underline">How to Order</a></li>
              <li><a href="#" className="text-sm hover:underline">How to Track</a></li>
              <li><a href="#" className="text-sm hover:underline">Size Guides</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-lg font-semibold mb-4">Customer Care</h5>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:underline">Contact Us</a></li>
              <li><a href="#" className="text-sm hover:underline">Payment Methods</a></li>
              <li><a href="#" className="text-sm hover:underline">Pricing</a></li>
              <li><img src={assets.pay} alt="payment methods" className="w-32 mt-2" /></li>
            </ul>
          </div>

          <div>
            <h5 className="text-lg font-semibold mb-4">Signup For The Latest News</h5>
            <form className="relative mb-6">
              <input 
                type="email"
                className="w-full p-3 bg-black border border-white outline-0 rounded text-sm text-white"
                placeholder="Enter Email"
                required/>
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                  viewBox="0 0 16 16">
                  <path fillRule="evenodd"
                    d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 
                      .708l-4 4a.5.5 0 0 1-.708-.708L13.293 
                      8.5H1.5A.5.5 0 0 1 1 8z" />
                </svg>
              </button>
            </form>
            <p className="text-sm mb-1 flex items-center gap-2">
              <img src={assets.mail} alt="email" className="w-4 h-4" /> bycafrica@gmail.com
            </p>
            <p className="text-sm flex items-center gap-2">
              <img src={assets.phone} alt="phone" className="w-4 h-4" /> +2348101375376 ; +2349053403403
            </p>
          </div>
        </div>

        <div className="flex justify-center space-x-6 border-t border-white mt-10 pt-6">
          <a href="#"><img src={assets.fb} alt="facebook" className="w-15 h-15" /></a>
          <a href="#"><img src={assets.insta} alt="instagram" className="w-15 h-15" /></a>
          <a href="#"><img src={assets.twi} alt="twitter" className="w-15 h-15" /></a>
          <a href="#"><img src={assets.yt} alt="youtube" className="w-15 h-15" /></a>
        </div>

        <div className="text-center mt-6 text-sm text-gray-400">
          <small>All rights reserved. &copy; bycafrica 2021</small>
        </div>
      </div>
    </footer>
  )
}

export default Footer
