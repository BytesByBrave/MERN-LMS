import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../components/educators/Navbar.jsx'
import Sidebar from '../../components/educators/Sidebar.jsx'
import Footer from '../../components/educators/Footer.jsx'


const Educator = () => {
    return (
        <div className='text-default min-h-screen bg-white'>
            <Navbar/>
            <div className='flex'>
                <Sidebar/>
                <div className='flex-1'>
                    {<Outlet/>}
                </div>
            </div>
            <Footer/>
        </div>
    )
}

export default Educator
