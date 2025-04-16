import { STATUS_CODES } from "../constants/statusCodes.js";

export default (err, _req, res, _next) => {
    let statusCode = err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
    let message = err.message || 'Internal Server Error';
    res.status(statusCode).json({success: false, error: message})
}