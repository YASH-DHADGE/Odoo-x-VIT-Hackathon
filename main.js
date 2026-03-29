const { Client } = require('pg')

const client = new Client({
    host: 'localhost',
    user: 'postgres',
    password: 'admin',
    database: 'Odoo',
    port: 5432
})

client.connect().then(() => {
    console.log('Connected to database')
}).catch((err) => {
    console.error(err)
})

client.query('SELECT * FROM users', (err, res) => {
    if (err) {
        console.error(err)
    }
    console.log(res.rows)
})

client.end()
