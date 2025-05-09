import React from 'react'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'

const Pargination = ({ currentPage, totalPages, setCurrentPage }) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="flex justify-center items-center gap-2">
      <button
        type="button"
        aria-label="Previous"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="mr-4 flex items-center justify-center w-9 md:w-12 h-9 md:h-12 aspect-square border border-gray-300/60 rounded-sm hover:bg-gray-300/10 transition-all disabled:opacity-50"
      >
        <FiArrowLeft />
      </button>

      <div className="flex gap-2 text-gray-500 text-sm md:text-base">
        {[...Array(totalPages).keys()].map((_, index) => (
          <button
            key={index + 1}
            type="button"
            onClick={() => handlePageChange(index + 1)}
            className={`flex items-center justify-center w-9 md:w-12 h-9 md:h-12 aspect-square border rounded-sm transition-all ${
              currentPage === index + 1
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-gray-300/60 hover:bg-gray-300/10'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <button
        type="button"
        aria-label="Next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="ml-4 flex items-center justify-center w-9 md:w-12 h-9 md:h-12 aspect-square border border-gray-300/60 rounded-sm hover:bg-gray-300/10 transition-all disabled:opacity-50"
      >
        <FiArrowRight />
      </button>
    </div>
  )
}

export default Pargination