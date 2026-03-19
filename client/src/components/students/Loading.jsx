import React, { useContext, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'

const Loading = () => {

    const {path} = useParams()
    const navigate = useNavigate()
    const {backendUrl, getToken, fetchUserEnrolledCourses} = useContext(AppContext)

    useEffect(() => {
        const verifyAndRedirect = async () => {
            if (path) {
                try {
                    // Verify any pending purchases with Stripe
                    const token = await getToken()
                    if (token) {
                        await axios.get(backendUrl + '/api/user/verify-purchase', {
                            headers: { Authorization: `Bearer ${token}` }
                        })
                        // Refresh enrolled courses after verification
                        await fetchUserEnrolledCourses()
                    }
                } catch (e) {
                    console.error('Purchase verification error:', e)
                }
                // Navigate to the target page
                navigate(`/${path}`)
            }
        }
        verifyAndRedirect()
    }, [])

    return (
        <div className='min-h-screen flex items-center justify-center'>
            <div className='w-16 sm:w-20 aspect-square border-4 border-gray-300 border-t-4 border-t-blue-400 rounded-full animate-spin'></div>
        </div>
    )
}

export default Loading
