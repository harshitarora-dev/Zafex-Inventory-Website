const mysql = require('mysql2/promise');

const passwords = ['', 'root', '1234', '123456', '12345678', 'admin', 'password', 'mysql', 'zafex', 'root123'];

async function test() {
  for (const pw of passwords) {
    try {
      const conn = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: pw
      });
      console.log(`FOUND_PASSWORD: "${pw}"`);
      await conn.query('CREATE DATABASE IF NOT EXISTS zafex_db');
      console.log('Database zafex_db ensured!');
      await conn.end();
      return;
    } catch (err) {
      console.log(`Tested "${pw}": ${err.message}`);
    }
  }
}
test();
