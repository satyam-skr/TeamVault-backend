import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.util.js';


class UserService {

  async getAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            tasks: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return users;
  }


  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }


  async deleteUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    await prisma.user.delete({
      where: { id: userId }
    });
  }


  async getUserStats() {
    const [totalUsers, adminCount, userCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'USER' } })
    ]);

    return {
      totalUsers,
      adminCount,
      userCount
    };
  }
}

export default new UserService();
