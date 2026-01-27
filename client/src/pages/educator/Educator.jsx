import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../components/educators/Navbar'
import Sidebar from '../../components/educators/Sidebar'
import Footer from '../../components/educators/Footer'


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
