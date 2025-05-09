import React from "react";
import { assets } from "../../assets/assets";
// import { useAppContext } from "../../context/AppContext"
import { NavLink, Outlet, useNavigate } from "react-router-dom"; // Added for redirect
import { useAppContext } from "../../context/appContext";

const AdminLayout = () => {
  const { logout } = useAppContext(); // Fixed: Call the hook with ()
  const navigate = useNavigate(); // Added for redirect

  const handleLogout = () => {
    console.log("Logout button clicked"); // Debug
    logout();
    navigate("/admin"); // Redirect to login page
  };

  const sidebarLinks = [
    { name: "Add Product", path: "/admin", icon: assets.addIcon },
    { name: "Add Blog", path: "/admin/blog", icon: assets.addIcon },
    { name: "Product List", path: "/admin/product-list", icon: assets.productIcon },
    { name: "Order", path: "/admin/orders", icon: assets.orderIcon },
    { name: "Admin Products", path: "/admin/admin-product", icon: assets.orderIcon },
  ];

  return (
    <>
      <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white transition-all duration-300">
        <a href="/">
          <img className="h-9" src={assets.byc} alt="" />
        </a>
        <div className="flex items-center gap-5 text-gray-500">
          <p>Hi! Admin</p>
          <button
            onClick={handleLogout}
            className="border rounded-full text-sm px-4 py-1 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="flex">
        <div className="md:w-64 w-16 border-r h-[95vh] text-base border-gray-300 pt-4 flex flex-col ">
            {sidebarLinks.map((item) => (
                <NavLink to={item.path} key={item.name} end={item.path == "/seller"}
                    className={({isActive})=> `flex items-center py-3 px-4 gap-3 
                        ${isActive ? "border-r-4 md:border-r-[6px] bg-red-100 border-red-400 text-red-400"
                            : "hover:bg-gray-100/90 border-white"
                        }`
                    }
                >
                    <img src={item.icon} alt="" className="w-7 h-7"/>
                    <p className="md:block hidden text-center">{item.name}</p>
                </NavLink>
            ))}
        </div>
        <Outlet/>
      </div>
    </>
  );
};

export default AdminLayout;