import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Blog from './pages/Blog'
import Blog2 from './pages/Blog2'
import About from './pages/About'
import Contact from './pages/Contact'
import Account from './pages/Account'
import Products from './pages/Products'
import Camisole from './pages/Camisole'
import Boxers from './pages/Boxers'
import Cart from './pages/Cart'
import CheckOut from './pages/CheckOut'
import Modifycart from './pages/ModifyCart'
import Wishlist from './pages/Wishlist'
import Footer from './components/Footer'
import { Toaster } from 'react-hot-toast'
import MyOrders from './pages/MyOrders'
import ProductDetail from './components/ProductDetails'
import AdminLogin from './components/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AddProduct from './pages/admin/AddProduct'
import AddBlog from './pages/admin/AddBlog'
import ProductList from './pages/admin/ProductList'
import OrdersPage from './pages/admin/OrdersPage'
import AdminProducts from './pages/admin/adminProducts'
import Dashboard from './pages/admin/Dashboard'
import PaymentSuccess from './pages/PaymentSuccess'
import { useAppContext } from './context/AppsContext'


const Display = () => {

  const isAdminPath = useLocation().pathname.includes('admin')
  const { isAdmin } = useAppContext()

  return (
    <div>

        { isAdminPath ? null : <Navbar/>}

        <Toaster/>

        <div className={`${isAdminPath ? "" : ""}`}>
          <Routes>
              <Route index element={<Home/>}/>
              <Route path='/blogs' element={<Blog/>}/>
              <Route path="/blogs/:id" element={<Blog2 />} />
              <Route path='/about' element={<About/>}/>
              <Route path='/contact' element={<Contact/>}/>
              <Route path='/account' element={<Account/>}/>
              <Route path='/product' element={<Products/>}/>
              <Route path='/camisole' element={<Camisole/>}/>
              <Route path='/boxer' element={<Boxers/>}/>
              <Route path='/cart' element={<Cart/>}/>
              <Route path='/checkout' element={<CheckOut/>}/>
              <Route path='/modify/:id' element={<Modifycart/>}/>
              <Route path='/wishlist' element={<Wishlist/>}/>
              <Route path='/my-orders' element={<MyOrders/>}/>
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path='/admin' element={isAdmin ? <AdminLayout/> : <AdminLogin/>}>
                <Route index element={isAdmin ? <Dashboard/> : null} />
                <Route path='add-product' element={isAdmin ? <AddProduct/> : null} />
                <Route path='blog' element={isAdmin ? <AddBlog/> : null}/>
                <Route path='product-list' element={isAdmin ? <ProductList/> : null} />
                <Route path='orders' element={isAdmin ? <OrdersPage/> : null}/>
                <Route path='admin-product' element={isAdmin ? <AdminProducts/> : null}/>
              </Route>
              <Route path="/payment-success" element={<PaymentSuccess />} />
          </Routes>
        </div>
        {!isAdminPath && <Footer/>}
      </div>
    
  )
}

export default Display
