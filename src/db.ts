import mysql from 'mysql2';

const handleDisconnect = () => {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: +(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    timezone: '+00:00',
  });

  connection.connect(err => {
    if (err) {
      console.log('Error when connecting to db: ', err);
      setTimeout(() => {
        database.connection = handleDisconnect();
      }, 2000);
    } else {
      console.log("Successfully connected to the database.");
      // Keep connection alive
      setInterval(() => {
        connection.query('SELECT 1');
      }, 5000);
    }
  });

  connection.on('error', (err: any) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      database.connection = handleDisconnect();
    } else {
      throw err;
    }
  });

  return connection;
}

const database = {
  connection: handleDisconnect(),
};
export default database;
