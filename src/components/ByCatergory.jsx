import React, { useEffect, useState } from 'react'
import { assets, slideImages } from '../assets/assets';

const ByCatergory = () => {

  const [itemsPerSlide, setItemsPerSlide] = useState(3);

  useEffect(() => {
    const updateItemsPerSlide = () => {
      setItemsPerSlide(window.innerWidth < 768 ? 1 : 3);
    };
    updateItemsPerSlide();
    window.addEventListener("resize", updateItemsPerSlide);
    return () => window.removeEventListener("resize", updateItemsPerSlide);
  }, []);

  // Group images dynamically
  const groupedImages = [];
  for (let i = 0; i < slideImages.length; i += itemsPerSlide) {
    groupedImages.push(slideImages.slice(i, i + itemsPerSlide));
  }
const [currentSlide, setCurrentSlide] = useState(0);

const handlePrev = () => {
  setCurrentSlide((prev) =>
    prev === 0 ? groupedImages.length - 1 : prev - 1
  );
};

const handleNext = () => {
  setCurrentSlide((prev) =>
    prev === groupedImages.length - 1 ? 0 : prev + 1
  );
};


  return (
    <>
      <div className='mt-[50px]'>
        <h2 className='md:text-[40px] text-3xl font-bold flex justify-center mb-8 md:mb-10'>Shop By Category</h2>

        <div className='flex text-center justify-center gap-6'>
            <h1 className='md:text-3xl text-1xl'>For Women</h1>
            <div>
                <h1 className='md:text-3xl text-1xl text-gray-500 font-light'>For Men</h1>
                <div className='md:w-22 w-15 h-0.5 bg-gray-400 rounded-full mt-2'></div>
            </div>
            <h1 className='md:text-3xl text-1xl'>For Kids</h1>
        </div>

        <div className='md:flex grid grid-cols-2 text-center mx-10 justify-center gap-3 mt-10 w-60 ml-17 md:ml-10 md:w-auto'>
            <button className='border-1 border-gray-300 px-6 text-xl py-3'>T-shirt</button>
            <button className='border-1 border-gray-300 px-6 py-3'>Singlet</button>
            <button className='bg-red-700 text-white px-7 py-3'>Pants</button>
            <button className='border-1 border-gray-300 px-6 py-3'>Boxers</button>
        </div>


        <div className="relative w-full py-10 bg-white">
        {/* Carousel Wrapper */}
        <div className="overflow-hidden relative">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {groupedImages.map((group, index) => (
                <div
                key={index}
                className="flex-shrink-0 w-full flex justify-center"
                >
                {group.map((img, idx) => (
                    <img
                    key={idx}
                    src={img}
                    alt={`Slide ${index * itemsPerSlide + idx + 1}`}
                    className="mx-2 object-cover"
                    style={{
                        width: `${80 / itemsPerSlide}%`,
                        height: "300px",
                    }}
                    />
                ))}
                </div>
            ))}
            </div>

            {/* Prev Button */}
            <button
            onClick={handlePrev}
            className="absolute top-1/2 left-5 -translate-y-1/2 text-black p-3 cursor-pointer z-10"
            >
            <img src={assets.arrowleft} alt="" />
            </button>

            {/* Next Button */}
            <button
            onClick={handleNext}
            className="absolute top-1/2 right-5 -translate-y-1/2 cursor-pointer text-black p-3 z-10"
            >
            <img src={assets.arrowright} alt="" />
            </button>
        </div>
        </div>

      </div>
    </>
  )
}

export default ByCatergory
