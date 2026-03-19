import logger from '../utils/logger.js';

export const globalErrorHandler = (err, req, res, next) => {
    logger.error('API Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body // WARNING: sanitize passwords in real enterprise!
    });

    const statusCode = err.statusCode || 500;
    const environment = process.env.NODE_ENV || 'development';

    res.status(statusCode).json({
        success: false,
        message: environment === 'production' 
            ? 'An internal server error occurred.' 
            : err.message,
    });
};
