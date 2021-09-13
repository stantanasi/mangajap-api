import mysql from 'mysql2';
import { dbConfig } from "./db.config";

const db = mysql.createConnection({
  host: dbConfig.host,
  user: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.dbname,
  timezone: 'UTC',
});

db.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

export default db