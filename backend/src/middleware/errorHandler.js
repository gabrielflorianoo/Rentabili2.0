import logger from '../logger.js';

function errorHandler(err, req, res, next) {
    logger.error({ err, reqId: req.id }, 'Error Handler Middleware');

    let status = err.status || 500;
    let message = err.message || 'Internal Server Error';

    if (err.message === 'Not Found' || err.status === 404) {
        status = 404;
        message = 'Not Found';
    }
    let details = err.details;

    if (err.code === 'P2002') {
        status = 409;
        message = 'Conflict: Unique constraint violation';
        details = {
            target: err.meta.target,
            message: `Unique constraint failed on ${err.meta.target.join(', ')}`,
        };
    }

    // Normalize error response
    const response = {
        status,
        message,
        ...(details ? { details } : {}), // Conditionally add details
    };

    res.status(status).json(response);
}

export default errorHandler;
