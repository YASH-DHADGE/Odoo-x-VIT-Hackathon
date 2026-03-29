const { Client } = require('pg');

const databaseUrl = 'postgresql://postgres:root@localhost:5432/Odoo?schema=public';

const client = new Client({
    connectionString: databaseUrl,
});

async function test() {
    try {
        await client.connect();
        console.log('Successfully connected to Postgres!');
        const res = await client.query('SELECT current_database();');
        console.log('Connected to:', res.rows[0].current_database);
        await client.end();
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
}

test();
