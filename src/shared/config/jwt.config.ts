import { registerAs } from '@nestjs/config';
import { jwtConstants } from 'src/auth/constants';

export default registerAs('jwt', () => {
  return {
    secret: process.env?.JWT_SECRET || jwtConstants.secret,
    exp: +(process.env?.JWT_EXP || 2 * 24 * 3600), // in second
    resetPasswordTtl: +(process.env?.EXPIRED_TIME_PASSWORD || 2 * 3600), // in second
  };
});
