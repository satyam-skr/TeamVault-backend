import { verifyAccessToken } from '../utils/jwt.util.js';
import { ApiError } from '../utils/apiError.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { prisma } from '../config/prisma.js';


export const authenticate = asyncHandler(async (req, res, next) => {
    try {
        // Try to get token from Authorization header first
        const authHeader = req.headers.authorization || req.headers.Authorization;
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            // Extract token from Bearer header
            token = authHeader.substring(7);
        } else if (req.cookies?.accessToken) {
            // Fall back to cookie if no Bearer header
            token = req.cookies.accessToken;
        }

        if (!token) {
            throw new ApiError(401, 'Access token is required');
        }

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
