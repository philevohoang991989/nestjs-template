import { registerAs } from '@nestjs/config';

export interface LoggingConfig {
  level: string;
  http: string;
}

export default registerAs('log', () => ({
  level: process.env.LOG_LEVEL || 'debug',
  http: process.env.LOG_HTTP || 'false',
}));
