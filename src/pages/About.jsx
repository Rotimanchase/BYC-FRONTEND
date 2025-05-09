import React from 'react'
import { aboutRecords, assets } from '../assets/assets'
import RecentlyView from '../components/RecentlyView'

const About = () => {
  return (
    <>
        <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white py-8 pl-15">
            <a href='/' type="button">
                <p>Home</p>
            </a>
            <svg width="8" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m1 15 7.875-7L1 1" stroke="#6B7280" stroke-opacity=".8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>About Us</p>
        </div>

      <div className='mt-20'>
        <h2 className='md:text-[40px] text-3xl font-bold flex justify-center mb-15 md:mb-20'>
            ABOUT US
        </h2>

        <div className='md:flex items-center gap-15 ml-5 md:ml-15 mb-15'>
            <img src={assets.apic1} alt=""  className='md:w-1/2 w-88'/>
            <div className='md:w-1/2 mb-10 md:mt-0 mt-5'>
                <h1 className='md:text-4xl text-3xl font-semibold mb-5'>ABOUT BYC AFRICA</h1>
                <h1 className='md:text-4xl text-[18px] font-light'>We are the sole distributor of BYC products in<br/> Africa. We import BYC products from Korea<br/> and distribute them to African countries<br/> through Onamik Holdings Limited.</h1>
            </div>
        </div>

        <div>
            <h2 className='md:text-[38px] text-2xl font-bold flex justify-center mb-10 md:mb-20'>
                WHAT OUR RECORD SAYS
            </h2>

            <div className='grid grid-cols md:grid-cols-3 gap-5 md:mx-15 mx-5 mb-20 md:mb-40'>
                {aboutRecords.map((category, index)=>(
                    <div key={index} className={`p-6 rounded-md ${index === 0 ? 'bg-[#BD3A3A0A]' : 'bg-[#FBFBFB]'}`}>
                        <img className='mb-6 mt-5' src={category.image} alt="" />
                        {category.record.split('/').map((line, i) => (
                            <p key={i} className="md:text-[15px] text-[12px]">
                            {line.trim().endsWith('.') ? line.trim() : line.trim() + ''}
                            </p>
                        ))}
                        <h1 className='my-6 text-red-600 font-bold text-sm md:text-xl'>{category.year}</h1>
                    </div>
                ))}
            </div>
        </div>

        <RecentlyView/>
      </div>
    </>
  )
}

export default About
