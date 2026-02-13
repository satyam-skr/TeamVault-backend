import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.util.js';
import { hashPassword, comparePassword } from '../utils/password.util.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.util.js';


class AuthService {

    async register({ name, email, password, role = 'USER' }) {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new ApiError(409, 'User with this email already exists');
        }

        const hashedPassword = await hashPassword(password);


        const tempPayload = { id: 'temp', role };
        const { refreshToken } = generateTokens(tempPayload);


        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                refreshToken
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        // Generate actual tokens with real user ID
        const tokens = generateTokens({ id: user.id, role: user.role });

        // Update refresh token in database
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: tokens.refreshToken }
        });

        return {
            user,
            ...tokens
        };
    }

    async login({ email, password }) {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            throw new ApiError(401, 'Invalid email or password');
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            throw new ApiError(401, 'Invalid email or password');
        }


        const tokens = generateTokens({ id: user.id, role: user.role });

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: tokens.refreshToken }
        });

        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            ...tokens
        };
    }


    async refreshAccessToken(refreshToken) {
        const decoded = verifyRefreshToken(refreshToken);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user || user.refreshToken !== refreshToken) {
            throw new ApiError(401, 'Invalid refresh token');
        }

        const tokens = generateTokens({ id: user.id, role: user.role });

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: tokens.refreshToken }
        });

        return tokens;
    }

    async getCurrentUser(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
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
            throw new ApiError(404, 'User not found');
        }

        return user;
    }


    async logout(userId) {
        await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null }
        });
    }
}

export default new AuthService();
