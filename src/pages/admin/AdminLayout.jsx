import React from "react";
import { assets } from "../../assets/assets";
import { NavLink, Outlet, useNavigate } from "react-router-dom"; 
import { useAppContext } from "../../context/AppsContext";

const AdminLayout = () => {
  const { logout } = useAppContext(); 
  const navigate = useNavigate(); 

  const handleLogout = () => {
    logout();
    navigate("/admin"); 
  };

  const sidebarLinks = [
    { name: "Dashboard", path: "/admin", icon: assets.dashIcon },
    { name: "Add Product", path: "/admin/add-product", icon: assets.addIcon },
    { name: "Add Blog", path: "/admin/blog", icon: assets.addIcon },
    { name: "Product List", path: "/admin/product-list", icon: assets.productIcon },
    { name: "Order", path: "/admin/orders", icon: assets.orderIcon },
    { name: "Admin Products", path: "/admin/admin-product", icon: assets.orderIcon },
  ];

  return (
    <>
      <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white transition-all duration-300">
        <a href="#">
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
        <div className="md:w-64 w-16 border-r h- text-base border-gray-300 
    pt-4 flex flex-col transition-all duration-300">
            {sidebarLinks.map((item, index) => (
                <NavLink to={item.path} key={index} end='/admin'
                    className={({isActive})=> `flex items-center py-3 px-4 gap-3 
                        ${isActive ? "border-r-4 md:border-r-[6px] bg-red-200 border-red-400 text-red-600"
                            : "hover:bg-gray-100/90 border-white"
                        }`}>
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