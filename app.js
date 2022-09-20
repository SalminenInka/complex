const express = require('express');
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(express.json()); 
const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});
client.connect();

//get info on all
app.get('/connections', async (req, res) => {
  try {
    const event = 'All information asked.';
    await client
    .query('INSERT INTO events (event) VALUES ($1)', [event]);
    const rows = await client
    .query('SELECT id, name, email, address FROM people INNER JOIN contacts ON people.id = contacts.person_id');
    res.json([rows.rows]);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get info on one
app.get('/connections/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const event = 'Information asked.';
    await client
    .query('INSERT INTO events (person_id, event) VALUES ($1, $2)', [id, event]);
    const rows = await client
    .query('SELECT id, name, email, address FROM people INNER JOIN contacts ON people.id = contacts.person_id WHERE id = ($1)', [id]);
    res.json([rows.rows]);
  } catch (err) {
    res.status(500).json(err);
  }
});

//create new person with post()
app.post('/connections', async (req, res) => {
  console.log(req.body);
  try {

    const { name, email, address } = req.body;
    const id = uuidv4();
    const event = 'New person created.';
    await client
    .query('INSERT INTO people (id, name) VALUES ($1, $2)',[id, name]);
    await client
    .query('INSERT INTO contacts (person_id, email, address) VALUES ($1, $2, $3)', [id, email, address]);
    await client
    .query('INSERT INTO events (person_id, event) VALUES ($1, $2)', [id, event]);
    res.json(id);
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete with person_id
app.delete('/connections/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const event = 'Deleted person.';
    await client
    .query('DELETE FROM contacts WHERE person_id = ($1)', [id]);
    await client
    .query('DELETE FROM people WHERE id = ($1)', [id]);
    await client
    .query('INSERT INTO events(person_id, event) VALUES ($1, $2)', [id, event]);
    res.json('deleted person with id:' + id);
  } catch (err) {
    res.status(500).json('Failed to delete user data.');
  }
});

//fix with put()
app.put('/connections/:id', async (req, res) => {
  try {
    const event = 'Information updated.';
    const id = req.params.id;
    const { name, email, address } = req.body;
    await client
    .query('UPDATE people SET name = ($1) WHERE id = ($2)', [name, id]);
    await client
    .query('UPDATE contacts SET email = ($1), address = ($2) WHERE person_id = ($3)', [email, address, id]);
    await client
    .query('INSERT INTO events (person_id, event) VALUES ($1, $2)', [id, event]);
    res.json(req.body);
  } catch (err) {
    res.status(500).json('Failed to update user data.');
  }
});


app.listen(process.env.PORT);