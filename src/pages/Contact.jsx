import React from 'react'
import { assets } from '../assets/assets'
import RecentlyView from '../components/RecentlyView'
import { Link } from 'react-router-dom'

const Contact = () => {
  return (
    <>  
       <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white py-8 pl-5 md:pl-15">
            <Link to='/' type="button">
                <p>Home</p>
            </Link>
            <svg width="8" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m1 15 7.875-7L1 1" stroke="#6B7280" strokeOpacity=".8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>Contact Us</p>
        </div>
      <div>
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold py-10">CONTACT US</h1>
        </div>

        <div className="mb-10 mx-5 md:mx-15">
          <img className='w-full object-cover' src={assets.conta} alt="Contact" />
        </div>

        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-3 gap-8 bg-gray-100 p-10 rounded-xl mb-16 mx-5 md:mx-15">
          <div className="flex items-start gap-3">
            <img src={assets.address} alt="Address" />
            <p className='text-sm md:text-base'><span className='md:text-lg text-[15px] font-bold block mb-1'>ADDRESS</span> (Head Office)<br/>175 Cameroun Road Aba, Abia State.</p>
          </div>

          <div className="flex items-start gap-4">
            <img src={assets.phn} alt="Phone" />
            <p className='text-sm md:text-base'><span className='md:text-lg text-[15px] font-bold block mb-1'>PHONE</span>08101375376<br/>09053403403</p>
          </div>

          <div className="flex items-start gap-4">
            <img src={assets.maile} alt="Email" />
            <p className='text-sm md:text-base'>
            <span className='md:text-lg text-[15px] font-bold block mb-1'>EMAIL ADDRESS</span>
            BYCAFRICA@gmail.com</p>
          </div>
        </div>

        {/* Drop a Message */}
        <div className="mb-10 mx-5 md:mx-15">
          <h2 className="text-3xl md:text-4xl font-bold mb-10">Drop a Message</h2>

          <form className="space-y-8 max-w-2xl">
            <div>
              <label className="block text-lg font-medium mb-2">Phone</label>
              <input type="text" className="w-full p-3 border border-red-500 rounded-md" />
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">Email address</label>
              <input type="email" className="w-full p-3 border border-red-500 rounded-md" />
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">Notes</label>
              <textarea rows="5" className="w-full p-3 border border-red-500 rounded-md"></textarea>
            </div>

            <button className="bg-red-600 text-white w-full py-3 rounded-md font-semibold hover:bg-red-700 transition">Submit</button>
          </form>
        </div>

        <RecentlyView/>
      </div>
    </>
  )
}

export default Contact
