import jwt from 'jsonwebtoken';
import { ApiError } from './apiError.util.js';

export const generateAccessToken = (payload) => {
    try {
        const { id, role } = payload;
        return jwt.sign(
            { id, role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );
    } catch (error) {
        throw new ApiError(500, 'Failed to generate access token');
    }
};


export const generateRefreshToken = (payload) => {
    try {
        const { id, role } = payload;
        return jwt.sign(
            { id, role },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );
    } catch (error) {
        throw new ApiError(500, 'Failed to generate refresh token');
    }
};


export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Access token expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, 'Invalid access token');
        }
        throw new ApiError(401, 'Token verification failed');
    }
};


export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Refresh token expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, 'Invalid refresh token');
        }
        throw new ApiError(401, 'Token verification failed');
    }
};

export const generateTokens = (payload) => {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload)
    };
};
