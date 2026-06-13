import { randomBytes } from 'crypto';

//Generador de urls unicas.

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const generateCode = (length: number = 6): string => {
  const bytes = randomBytes(length);
  return Array.from(bytes)
    .map(b => CHARS[b % CHARS.length])
    .join('');
};

//Math.random() seria mas predecible.