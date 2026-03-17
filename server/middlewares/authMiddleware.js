import { clerkClient } from '@clerk/express'

// Middleware to protect ( Educator Routes)
export const protectEductor = async (req, res, next) => {
    try {
        const userId = req.auth.userId

        if (!userId) {
            return res.json({
                success: false,
                message: 'Unauthorized'
            })
        }

        const response = await clerkClient.users.getUser(userId)

        if (response.publicMetadata.role !== 'educator') {
            return res.json({
                success: false,
                message: 'You are not authorized to access this resource'
            })
        }
        next()
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}