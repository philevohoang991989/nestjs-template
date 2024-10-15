import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig();

const dbConfig = {
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema: process.env.DB_SCHEMA || 'public',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrationsTableName: 'migrations',
  migrations: ['dist/**/migration/*.js'],
  migrationsRun: process.env.DB_MIGRATION_RUN === 'true',
  synchronize: true,
  logging: process.env.DB_LOGGING === 'true',
};

export default registerAs('database', () => dbConfig);

export const dataSource = new DataSource(dbConfig as DataSourceOptions);
