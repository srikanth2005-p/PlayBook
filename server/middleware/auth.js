const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('x-auth-token');

        // Check if no token
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token, authorization denied'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add owner to request
        req.owner = {
            id: decoded.id
        };
        
        next();
    } catch (err) {
        res.status(401).json({
            success: false,
            error: 'Token is not valid'
        });
    }
};
