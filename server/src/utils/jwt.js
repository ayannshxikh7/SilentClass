import jwt from 'jsonwebtoken';

export const signJwt = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET || 'silentclass-secret', {
    expiresIn: '7d'
  });
