import { Response } from 'express';

export function setTokenCookie(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true, // Helps to prevent XSS attacks
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  });
}
