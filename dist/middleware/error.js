"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, next) {
    const status = err.status && Number.isInteger(err.status) ? err.status : 500;
    const message = err.message || 'Server error';
    // Log server errors
    if (status === 500)
        console.error(err);
    return res.status(status).json({ message });
}
