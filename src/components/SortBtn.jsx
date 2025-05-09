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

    if (!data || !setData) return;

    const sortedData = [...data];
    switch (option) {
      case 'Most Sold':
        sortedData.sort((a, b) => b.soldCount - a.soldCount);
        break;
      case 'Newest':
        sortedData.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'Oldest':
        sortedData.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'Price: High to Low':
        sortedData.sort((a, b) => b.price - a.price);
        break;
      case 'Price: Low to High':
        sortedData.sort((a, b) => a.price - b.price);
        break;
      default:
        break;
    }

    setData(sortedData);
  };

  const isRed = variant === "red";

  const buttonStyle = `
    relative w-[160px] rounded px-3 py-2 font-medium 
    ${isRed 
      ? "border border-red-500 text-red-600 hover:bg-red-50" 
      : "border border-gray-700 text-gray-800 bg-white hover:bg-gray-50"}
  `;

  const dropdownItemStyle = (option) =>
    selectedSort === option
      ? isRed
        ? "bg-red-50 text-red-600 font-semibold"
        : "bg-gray-100 font-semibold"
      : "hover:bg-gray-100";

      const sortStyle = `
        absolute -top-2 left-2 bg-white px-1 text-[10px] uppercase tracking-wide 
        ${isRed ? "text-red-500" : "text-gray-600"}
      `

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button className={buttonStyle} onClick={toggleDropdown}>
        <div className={sortStyle}>
          Sort By
        </div>
        <div className="flex justify-between items-center w-full">
          <span>{selectedSort}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-2 w-[160px] bg-white border border-gray-200 rounded shadow-md">
          {sortOptions.map((option) => (
            <li key={option}>
              <a
                href="#"
                className={`block px-4 py-2 text-sm ${dropdownItemStyle(option)}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleSortChange(option);
                }}
              >
                {option}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SortBtn;
