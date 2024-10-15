import { registerAs } from '@nestjs/config';

export interface AppConfig {
  name: string;
  env: string;
  port: number;
  globalPrefix: string;
}

export default registerAs('app', () => ({
  name: process.env.APP_NAME || 'Nest',
  env: process.env.APP_ENV || 'local',
  port: process.env.PORT || 3000,
  globalPrefix: process?.env?.GLOBAL_PREFIX || '/',
  useQueueApiCall: process?.env?.USE_QUEUE_API_CALL || false,
}));
