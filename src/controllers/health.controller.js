import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiResponse } from '../utils/apiResponse.util.js';
import { prisma } from '../config/prisma.js';


const healthCheck = asyncHandler(async (req, res) => {

    let dbStatus = 'connected';
    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
        dbStatus = 'disconnected';
    }

    const healthData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: dbStatus,
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        }
    };

    res.status(200).json(
        new ApiResponse(200, healthData, 'API is healthy')
    );
});

export {
    healthCheck
};