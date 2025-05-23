import React, { useState, useEffect, useRef } from 'react';

const SortBtn = ({ defaultSort = "Most Sold", data, setData, variant = "default" }) => {
  const [selectedSort, setSelectedSort] = useState(defaultSort);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sortOptions = [
    "Most Sold",
    "Newest",
    "Oldest",
    "Price: High to Low",
    "Price: Low to High"
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSortChange = (option) => {
    setSelectedSort(option);
    setIsOpen(false);

    if (!data || !setData || !Array.isArray(data)) {
      console.warn('SortBtn: Invalid data or setData props', { data, setData });
      return;
    }

    const sortedData = [...data];
    
    switch (option) {
      case 'Most Sold':
        sortedData.sort((a, b) => {
          const aSold = Number(a.soldCount || 0);
          const bSold = Number(b.soldCount || 0);
          if (!a.soldCount && !b.soldCount) {
            console.warn('SortBtn: soldCount missing for some items', { a, b });
          }
          return bSold - aSold;
        });
        break;
      case 'Newest':
        sortedData.sort((a, b) => {
          const aDate = new Date(a.createdAt || a.dateCreated || a.created_at || 0);
          const bDate = new Date(b.createdAt || b.dateCreated || b.created_at || 0);
          return bDate - aDate;
        });
        break;
      case 'Oldest':
        sortedData.sort((a, b) => {
          const aDate = new Date(a.createdAt || a.dateCreated || a.created_at || 0);
          const bDate = new Date(b.createdAt || b.dateCreated || b.created_at || 0);
          return aDate - bDate;
        });
        break;
      case 'Price: High to Low':
        sortedData.sort((a, b) => {
          const aPrice = Number(a.productPrice || a.price || 0);
          const bPrice = Number(b.productPrice || b.price || 0);
          return bPrice - aPrice;
        });
        break;
      case 'Price: Low to High':
        sortedData.sort((a, b) => {
          const aPrice = Number(a.productPrice || a.price || 0);
          const bPrice = Number(b.productPrice || a.price || 0);
          return aPrice - bPrice;
        });
        break;
      default:
        break;
    }

    setData(sortedData);
  };

  const isRed = variant === "red";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button 
        className={`relative w-40 rounded px-3 py-2 font-medium border ${
          isRed 
            ? "border-red-500 text-red-600 bg-white hover:bg-red-50" 
            : "border-gray-700 text-gray-800 bg-white hover:bg-gray-50"
        }`}
        onClick={toggleDropdown}
      >
        <div className={`absolute -top-2 left-2 bg-white px-1 text-xs uppercase tracking-wide ${
          isRed ? "text-red-500" : "text-gray-600"
        }`}>
          Sort By
        </div>
        <div className="flex justify-between items-center w-full">
          <span className="truncate">{selectedSort}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            fill="currentColor"
            viewBox="0 0 16 16"
            className={`ml-2 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg">
          {sortOptions.map((option) => (
            <li key={option}>
              <button
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  selectedSort === option
                    ? isRed
                      ? "bg-red-50 text-red-600 font-semibold"
                      : "bg-gray-100 text-gray-900 font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => handleSortChange(option)}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SortBtn;