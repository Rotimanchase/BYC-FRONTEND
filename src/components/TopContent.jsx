import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const TopContent = () => {
    const [text, setText] = useState('yourself')
    const texts = ["yourself", "Men", "Women", "Kids"]

    useEffect(()=>{
        const intervalId = setInterval(() => {
            setText((defaultText)=>{
                const currentText = texts.indexOf(defaultText);
                const next = (currentText + 1) % texts.length;
                return texts[next]
            })
        }, 2000);
        return () => clearInterval(intervalId);
    }, [])

  return (
    <>
      <div className='mt-6'>
        <p className='text-l sm:text-xl md:text-1xl lg:text-[30px] flex gap-5 justify-center'>Your body deserve comfort</p>
        <div>
            <h1 className='text-2xl my-3 md:my-8 sm:text-3xl md:text-4xl lg:text-6xl font-extrabold flex justify-center'>Get the best for {text}</h1>
        </div>

        <div className="flex  md:flex-row items-center justify-center gap-4 mt-5">
          <Link to={'/product'}>
            <button className="bg-black py-[10px] cursor-pointer px-[35px] md:py-[12px] md:px-[70px] md:text-lg text-l text-white font-bold">Shop Now</button>
          </Link>
          <Link to={'/about'}>
            <button className="border-2 cursor-pointer border-black py-[9px] px-[30px] md:py-[10px] md:px-[70px] md:text-lg text-l font-bold">
                Learn More</button>
          </Link>
        </div>

        <div className='flex justify-center mt-15'>
            <img className='w-95 md:w-250' src={assets.firstimg} alt="" />
        </div>
      </div>
    </>
  )
}

export default TopContent
