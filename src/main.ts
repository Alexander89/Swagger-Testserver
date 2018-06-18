import { ApiServer } from './api-server';

process.env.DB_Type = process.env.DB_Type || 'postgres';
process.env.DB_Host = process.env.DB_Host || '195.201.113.80';
process.env.DB_Port = process.env.DB_Port || '5432';
process.env.DB_Username = process.env.DB_Username || 'apiTestserver';
process.env.DB_Password = process.env.DB_Password || 'Y7s4YYCBQFNTJnQWrcKH4ty8';
process.env.DB_Database = process.env.DB_Database || 'apiTestdatabase';
process.env.Port = process.env.Port || '8111';

export const server = new ApiServer();
