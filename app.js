const express = require('express');
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
const debug = require('debug')('app');

const app = express();

app.use(express.json()); 
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});
client.connect();

debug('Connection done');

//get info on all
app.get('/connections', async (req, res) => {
  debug('Getting all connections ...');
  try {
    const rows = await client
    .query('SELECT id, username, email, shipping_address, billing_address FROM user_account INNER JOIN contact_information ON user_account.id = contact_information.user_id');
    res.json([rows.rows]);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get info on one user
app.get('/connections/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const event = 'User information requested.';
    await client
    .query('INSERT INTO event_log (user_id, log) VALUES ($1, $2)', [id, event]);
    const rows = await client
    .query('SELECT id, username, email, shipping_address, billing_address FROM user_account INNER JOIN contact_information ON user_account.id = contact_information.user_id WHERE id = ($1)', [id]);
    res.json([rows.rows]);
  } catch (err) {
    res.status(500).json(err);
  }
});

//create new person with post()
app.post('/connections', async (req, res) => {
  console.log(req.body);
  try {

    const { name, email, shipping_address, billing_address } = req.body;
    const id = uuidv4();
    const event = 'New user account created.';
    await client
    .query('INSERT INTO user_account (id, username) VALUES ($1, $2)',[id, name]);
    await client
    .query('INSERT INTO contact_information (user_id, email, shipping_address, billing_address) VALUES ($1, $2, $3, $4)', [id, email, shipping_address, billing_address]);
    await client
    .query('INSERT INTO event_log (user_id, log) VALUES ($1, $2)', [id, event]);
    res.json(id);
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete with person_id
app.delete('/connections/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const event = 'User deleted.';
    await client
    .query('DELETE FROM contact_information WHERE user_id = ($1)', [id]);
    await client
    .query('DELETE FROM user_account WHERE id = ($1)', [id]);
    await client
    .query('INSERT INTO event_log (user_id, log) VALUES ($1, $2)', [id, event]);
    res.json('deleted user with id: ' + id);
  } catch (err) {
    res.status(500).json('Failed to delete user data.');
  }
});

//fix with put()
app.put('/connections/:id', async (req, res) => {
  try {
    const event = 'User information updated.';
    const id = req.params.id;
    const { name, email, shipping_address, billing_address } = req.body;
    await client
    .query('UPDATE user_account SET username = ($1) WHERE id = ($2)', [name, id]);
    await client
    .query('UPDATE contact_information SET email = ($1), shipping_address = ($2), billing_address = ($3) WHERE user_id = ($4)', [email, shipping_address, billing_address, id]);
    await client
    .query('INSERT INTO event_log (user_id, log) VALUES ($1, $2)', [id, event]);
    res.json(req.body);
  } catch (err) {
    res.status(500).json('Failed to update user data.');
  }
});

//get the event log
app.get('/log', async (req, res) => {
  try {
   const rows = await client
    .query('SELECT event_number, user_id, log, log_time FROM event_log');
    res.json(rows.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

debug(`App running on port ${process.env.PORT}`);
app.listen(process.env.PORT);