import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.util.js';


class TaskService {

    async createTask({ title, description, status = 'TODO' }, userId) {
        const task = await prisma.task.create({
            data: {
                title,
                description,
                status,
                userId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return task;
    }


    async getMyTasks(userId, userRole) {
        const whereClause = userRole === 'ADMIN' ? {} : { userId };

        const tasks = await prisma.task.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return tasks;
    }


    async getTaskById(taskId, userId, userRole) {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!task) {
            throw new ApiError(404, 'Task not found');
        }

        if (userRole !== 'ADMIN' && task.userId !== userId) {
            throw new ApiError(403, 'You are not authorized to access this task');
        }

        return task;
    }


    async updateTask(taskId, updateData, userId, userRole) {
        const existingTask = await this.getTaskById(taskId, userId, userRole);

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return updatedTask;
    }


    async deleteTask(taskId, userId, userRole) {
        await this.getTaskById(taskId, userId, userRole);

        await prisma.task.delete({
            where: { id: taskId }
        });
    }


    async getTaskStats(userId, userRole) {
        const whereClause = userRole === 'ADMIN' ? {} : { userId };

        const [total, todo, inProgress, done] = await Promise.all([
            prisma.task.count({ where: whereClause }),
            prisma.task.count({ where: { ...whereClause, status: 'TODO' } }),
            prisma.task.count({ where: { ...whereClause, status: 'IN_PROGRESS' } }),
            prisma.task.count({ where: { ...whereClause, status: 'DONE' } })
        ]);

        return {
            total,
            todo,
            inProgress,
            done
        };
    }
}

export default new TaskService();
