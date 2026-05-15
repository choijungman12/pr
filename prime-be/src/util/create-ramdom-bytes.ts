import { randomBytes } from 'crypto';

export const createRandomBytes = (size = 24): string => {
  return randomBytes(size).toString('base64url');
};
