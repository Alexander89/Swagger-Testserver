import { ApiServer } from './api-server';

process.env.Port = process.env.Port || '8111';
process.env.DB_Type = process.env.DB_Type || 'mySQL';
process.env.DB_Host = process.env.DB_Host || 'localhost';
process.env.DB_Username = process.env.DB_Username || 'root';
process.env.DB_Password = process.env.DB_Password || 'root';
process.env.DB_Database = process.env.DB_Database || 'swaggerTest';

export const server = new ApiServer();
