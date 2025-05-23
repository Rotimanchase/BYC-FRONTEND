import React from 'react'
import { assets, NewArivals } from '../assets/assets'

const NewArrivals = () => {
  return (
    <>
      <div className='mt-20 md:mt-40'>
        <h2 className='md:text-4xl text-2xl font-bold flex justify-center mb-15 md:mb-30'>Checkout BYC New Arrivals</h2>
        
      <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 mt-6 gap-4 md:mx-15 mr-10 ml-5'>
        {NewArivals.map((category, index) => (
            <div key={index} className="max-w-full">
                <img className="max-h-full w-full object-cover" src={category.image} alt="officeImage"/>
                <p className="text-gray-900 text-2xl font-semibold ml-2 mt-2">{category.productName}</p>
                <p className="text-gray-500 mt-1 ml-2">{category.productDescription}</p>
            </div>
        ))}
      </div>

      <div className='flex justify-center mt-12 md:mt-20'>
        <button className="border-1 border-black py-[9px] px-[40px] md:py-[8px] md:px-[80px] md:text-lg text-l font-bold">View All</button>
      </div>
      </div>
    </>
  )
}

export default NewArrivals
