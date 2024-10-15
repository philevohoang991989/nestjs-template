import { registerAs } from '@nestjs/config';

export interface SwaggerConfig {
  enable: string;
  path: string;
}

export default registerAs('swagger', () => ({
  enable: process.env.SWAGGER_ENABLE || false,
  path: process.env.SWAGGER_PATH || 'swagger',
}));
