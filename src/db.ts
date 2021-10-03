import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config()

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: +(process.env.DB_PORT || 3306),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  timezone: 'UTC',
});

db.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

export default db