import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    // Look for the token in the Authorization header or x-auth-token header
    let token = req.header('Authorization') || req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No security token provided.' });
    }

    try {
        // If the token starts with "Bearer ", clean it up to get just the string
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length).trimLeft();
        }

        // Verify the token using your environment variable secret
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attach the user payload to the request object
        next(); // Pass control to the gameController
    } catch (error) {
        res.status(400).json({ message: 'Invalid token validation failed.' });
    }
};