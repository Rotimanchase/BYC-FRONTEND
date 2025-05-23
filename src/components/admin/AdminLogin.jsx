import React, { useEffect, useState } from 'react'
import axiosInstance from '../../../axios'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAppContext } from '../../context/AppsContext'

const AdminLogin = () => {
    const { isAdmin, setIsAdmin } = useAppContext()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate()

    const onSubmitHandler = async (event) => {
  try {
    event.preventDefault();
    const res = await axiosInstance.post('/api/admin/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('adminToken', res.data.token);
      setIsAdmin(true);
      navigate('/admin');
    } else {
      toast.error(res.data.message);
    }
  } catch (error) {
    console.error('Login error:', error.response?.data?.message || error.message);
    toast.error(error.message);
  }
};

    useEffect(()=>{
        if(isAdmin){
            navigate("/admin")
        }
    }, [isAdmin])

  return !isAdmin && (
      <form onSubmit={onSubmitHandler} className='min-h-screen flex items-center text-sm text-black'>
        <div className='flex flex-col gap-5 m-auto items-start p-8 py-12 min-w-80 sm:min-w-88 rounded-lg shadow-xl border-gray-200'>
            <p className='text-2xl font-medium m-auto'><span className='text-red-600'>Admin</span>Login</p>

            <div className='w-full'>
                <p>Email</p>
                <input onChange={(e)=> setEmail(e.target.value)} value={email} type="email" placeholder='enter your email' className='border border-gray-200 w-full p-2 mt-1 outline-primary' required/>
            </div>
            <div className='w-full'>
                <p>Password</p>
                <input onChange={(e)=> setPassword(e.target.value)} value={password} type="password"placeholder='enter your password' className='border border-gray-200 w-full p-2 mt-1 outline-primary' required/>
            </div>
            <button className='bg-black text-white  w-full py-2 rounded-md cursor-pointer'>Login</button>
        </div>
      </form>
  )
}

export default AdminLogin
