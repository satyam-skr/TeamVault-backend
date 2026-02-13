import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiResponse } from '../utils/apiResponse.util.js';
import authService from '../services/auth.service.js';


export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const result = await authService.register({ name, email, password, role });

  // Set tokens in cookies
  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(201).json(
    new ApiResponse(201, result, 'User registered successfully')
  );
});


export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  // Set tokens in cookies
  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(200).json(
    new ApiResponse(200, result, 'User logged in successfully')
  );
});


export const refreshToken = asyncHandler(async (req, res) => {
  // Accept refresh token from body or cookies
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

  const tokens = await authService.refreshAccessToken(refreshToken);

  // Set new tokens in cookies
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(200).json(
    new ApiResponse(200, tokens, 'Token refreshed successfully')
  );
});


export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);

  res.status(200).json(
    new ApiResponse(200, user, 'User profile fetched successfully')
  );
});


export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);

  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).json(
    new ApiResponse(200, null, 'User logged out successfully')
  );
});
