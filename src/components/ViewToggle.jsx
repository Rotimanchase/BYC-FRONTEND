import React from "react";

const ViewToggle = ({ activeView, setActiveView }) => {
  return (
    <div className="flex space-x-2">
      <button
        onClick={() => setActiveView('list')}
        className={`p-2 rounded-md border ${
          activeView === 'list'
            ? 'bg-gray-200 border-gray-400'
            : 'bg-white border-gray-300 hover:bg-gray-100'
        }`}
      >
        {/* list view icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="30"
          height="30"
          fill="#5F6368"
        >
          <rect width="24" height="24" fill="#F5F5F5" rx="2" ry="2" />
          <rect x="5" y="7" width="4" height="3" fill="#5F6368" />
          <rect x="5" y="12" width="4" height="3" fill="#5F6368" />
          <rect x="5" y="17" width="4" height="3" fill="#5F6368" />
          <rect x="12" y="7" width="7" height="3" fill="#5F6368" />
          <rect x="12" y="12" width="7" height="3" fill="#5F6368" />
          <rect x="12" y="17" width="7" height="3" fill="#5F6368" />
        </svg>
      </button>

      <button
        onClick={() => setActiveView('grid')}
        className={`p-2 rounded-md border ${
          activeView === 'grid'
            ? 'bg-gray-200 border-gray-400'
            : 'bg-white border-gray-300 hover:bg-gray-100'
        }`}
      >
        {/* grid view icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="30"
          height="30"
          fill="red"
        >
          <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />
        </svg>
      </button>
    </div>
  );
};

export default ViewToggle;
