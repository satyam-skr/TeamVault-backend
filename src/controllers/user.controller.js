import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiResponse } from '../utils/apiResponse.util.js';
import { ApiError } from '../utils/apiError.util.js';
import userService from '../services/user.service.js';


export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers();

    res.status(200).json(
        new ApiResponse(200, users, 'Users fetched successfully')
    );
});


export const getUserStats = asyncHandler(async (req, res) => {
    const stats = await userService.getUserStats();

    res.status(200).json(
        new ApiResponse(200, stats, 'User statistics fetched successfully')
    );
});


export const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    res.status(200).json(
        new ApiResponse(200, user, 'User fetched successfully')
    );
});


export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (id === req.user.id) {
        throw new ApiError(400, 'You cannot delete your own account');
    }

    await userService.deleteUser(id);

    res.status(200).json(
        new ApiResponse(200, null, 'User deleted successfully')
    );
});
