import { registerAs } from '@nestjs/config';

export interface CacheConfig {
  host: string;
  password: string;
  port: number;
  ttl: number;
  prefix: string;
}

export default registerAs('cache', () => ({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  ttl: +process.env.CACHE_TTL || 300, // seconds
  prefix: process.env.CACHE_PREFIX,
  username: process?.env?.REDIS_USERNAME
    ? process?.env?.CACHE_PREFIX
    : undefined,
}));
