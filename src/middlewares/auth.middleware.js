import { verifyAccessToken } from '../utils/jwt.util.js';
import { ApiError } from '../utils/apiError.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { prisma } from '../config/prisma.js';


export const authenticate = asyncHandler(async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization
            || req.cookies?.accessToken;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, 'Access token is required');
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

        const decoded = verifyAccessToken(token);

        // Fetch user from database (excluding password)
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            throw new ApiError(401, 'User not found');
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
});


export const authorizeRoles = (...allowedRoles) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, 'Authentication required');
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(
                403,
                `Access denied. Only ${allowedRoles.join(', ')} can access this resource`
            );
        }

        next();
    });
};
