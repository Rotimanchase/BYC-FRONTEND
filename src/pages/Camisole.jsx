import React, { useState } from 'react'
import { FaRegStar } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import ViewToggle from '../components/ViewToggle'
import SortBtn from '../components/SortBtn'
import { assets, camisoles } from '../assets/assets'

const Camisole = () => {
  const [isHover, setIsHover] = useState(null)
  const [activeView, setActiveView] = useState('grid')

  return (
    <div className='mt-10'>
        <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white py-8 pl-5 md:pl-15">
            <a href='/' type="button">
                <p>Home</p>
            </a>
            <svg width="8" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m1 15 7.875-7L1 1" stroke="#6B7280" strokeOpacity=".8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>Women</p>
            <svg width="8" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m1 15 7.875-7L1 1" stroke="#6B7280" strokeOpacity=".8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className='text-red-500'>Camisole</p>
        </div>

        <div className='md:mx-10 mx-2 border-3 rounded-xl border-[#F1EEEE] pt-15 mt-10 pb-8 px-3 md:px-10'>
        <div className='flex justify-between mb-2 md:mb-5'>
            <h1 className='md:text-2xl text-xl font-bold'>Camisole</h1>
            <div>
                <SortBtn/>
            </div>
        </div>

        <div className='border-b-2 border-t-2 p-10 border-[#F1EEEE] flex justify-between'>
            <p className='mt-[20px]'>6 Product Found</p>
            <ViewToggle activeView={activeView} setActiveView={setActiveView} />
        </div>

        <div
            className={`${
            activeView === 'grid' ? 'grid grid-cols-1 md:grid-cols-5 gap-4' : 'flex flex-col gap-6'
            } mb-[20px]`}>
            {camisoles.map((category, index) => (
            <div
                key={index}
                className={`hover:-translate-y-[5px] hover:shadow-2xl transition duration-300 rounded ${
                activeView === 'grid' ? 'md:pt-8 pt-3' : 'flex gap-6 items-center'
                }`}>
                <Link
                to={'#'}
                onMouseEnter={() => setIsHover(index)}
                onMouseLeave={() => setIsHover(null)}
                className={activeView === 'list' ? 'flex w-full pl-5' : ''}>
                <img className={`rounded-t-[5px] ${
                    activeView === 'list'
                        ? 'md:w-[150px] h-[110px] md:h-[150px] object-cover rounded'
                        : 'w-full'
                    }`}
                    src={category.image}
                    alt=""/>

                <div className={activeView === 'list' ? 'pl-6' : 'pl-3'}>
                    <h5 className='text-xl mt-3 mb-1 font-bold'>{category.productName}</h5>
                    <p className='text-[18px] mb-4'>{category.productCode}</p>
                    {category.productDescription.split('/').map(
                    (sentence, i) =>
                        sentence.trim() && (
                        <p key={i} className="text-[#787885]">
                            {sentence.trim()}
                        </p>
                        )
                    )}
                    <p className='font-semibold mt-3 mb-5'>{category.productPrice}</p>
                    <div className='flex items-center mb-5'>
                    <FaRegStar />
                    <FaRegStar />
                    <FaRegStar />
                    <FaRegStar />
                    <FaRegStar />
                    <p className='ml-2'>{category.ratings}</p>
                    </div>

                     <div className='relative'>
                     <div
                        className={`absolute ${
                        isHover === index ? 'flex' : 'hidden'
                        } ${ activeView === 'list'
                            ? 'flex-col md:flex-row mt-1'
                            : 'flex-row' } md:gap-4 gap-6 w-full`}>
                        <button className='flex items-center justify-center gap-2 border border-red-500 px-5 py-2 rounded-md cursor-pointer'>
                            <img src={assets.wishlove} alt='Add to Wishlist' className='h-4 w-4' />
                            <span className='text-red-600 font-semibold'>Wishlist</span>
                        </button>

                        <button className='flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition cursor-pointer'>
                            <img src={assets.wishcart} alt='Add to Cart' className='h-4 w-4' />
                            <span className='font-semibold'>Buy Now</span>
                        </button>
                    </div>

                    <div
                        className={`${
                        activeView === 'list' ? 'min-h-[100px] md:min-h-[65px]' : 'min-h-[55px]'}`}
                    ></div>
                    </div>
                </div>
                </Link>
            </div>
            ))}
        </div>
        </div>
    </div>
  )
}

export default Camisole
