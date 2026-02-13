import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiResponse } from '../utils/apiResponse.util.js';
import taskService from '../services/task.service.js';



export const createTask = asyncHandler(async (req, res) => {
    const { title, description, status } = req.body;

    const task = await taskService.createTask(
        { title, description, status },
        req.user.id
    );

    res.status(201).json(
        new ApiResponse(201, task, 'Task created successfully')
    );
});


export const getMyTasks = asyncHandler(async (req, res) => {
    const tasks = await taskService.getMyTasks(req.user.id, req.user.role);

    res.status(200).json(
        new ApiResponse(200, tasks, 'Tasks fetched successfully')
    );
});


export const getTaskStats = asyncHandler(async (req, res) => {
    const stats = await taskService.getTaskStats(req.user.id, req.user.role);

    res.status(200).json(
        new ApiResponse(200, stats, 'Task statistics fetched successfully')
    );
});


export const getTaskById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const task = await taskService.getTaskById(id, req.user.id, req.user.role);

    res.status(200).json(
        new ApiResponse(200, task, 'Task fetched successfully')
    );
});


export const updateTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const task = await taskService.updateTask(
        id,
        updateData,
        req.user.id,
        req.user.role
    );

    res.status(200).json(
        new ApiResponse(200, task, 'Task updated successfully')
    );
});


export const deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await taskService.deleteTask(id, req.user.id, req.user.role);

    res.status(200).json(
        new ApiResponse(200, null, 'Task deleted successfully')
    );
});
