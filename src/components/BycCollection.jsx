import React from 'react'
import { assets } from '../assets/assets'

const BycCollection = () => {
  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mt-20 gap-3 md:mx-15 mr-10 ml-5'>
      <div className="box-border border-0 h-full md:h-full bg-[#F1F1F1] flex items-center justify-center py-15 md:py-10 lg:py-18">
        <div className="text-left space-y-3 px-4 md:max-w-xl">
            <h2 className="md:text-xl lg:text-4xl text-1xl font-bold text-gray-600">BYC Collection 2021</h2>
            <h1 className="md:text-3xl lg:text-6xl text-3xl font-bold">BYC Collection</h1>
            <p className="md:text-[10px] lg:text-[15px] text-[8px] text-gray-700 leading-relaxed">
            The best everyday option in a Super Saver range within a<br />
            reasonable price. It is our responsibility to keep you<br />
            100 percent stylish. Be smart & trendy with us.
            </p>
            <button className="md:mt-5 lg:mt-10 mt-5 border border-black py-2 px-10 md:py-2 md:px-20 md:text-lg text-base font-bold">
            Explore
            </button>
        </div>
        </div>


        <div className='md:h-auto'> 
            <img className='w-full object-cover' src={assets.ttr} alt="" />
        </div>
        <div className=''>
            <img className='w-full' src={assets.tbr} alt="" />
        </div>
        <div>
            <img className='w-full' src={assets.tbl} alt="" />
        </div>

      </div>
        <div className='flex justify-center mt-12 md:mt-20'>
            <button className="border-1 border-black py-[9px] px-[40px] md:py-[8px] md:px-[80px] md:text-lg text-l font-bold">View All</button>
        </div>
    </>
  )
}

export default BycCollection
