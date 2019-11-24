const express = require('express');
const path = require('path');
const mountRoutes = require('./routes/index');
const db = require('./db/index');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const ENV = process.env;
const port = ENV.PORT || ENV.REACT_APP_API_PORT; //3001;

console.log("First: ", ENV.REACT_APP_API_PORT);
console.log("Second: ", ENV.MAILER_EMAIL);

app.use(cors());
// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// );
// app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/api', (request, response) => {
  response.send("Express API is up and running!");
});

app.get('/:eventKey/:personalKey', (req, res) => {
    const { eventKey, personalKey } = req.params;

    console.log("eventKey: ", eventKey);
    console.log("personalKey: ", personalKey);

    const result = await db.query(`SELECT name FROM people WHERE personal_key IN (SELECT match FROM people WHERE personal_key = '${personalKey}' AND event_key = '${eventKey}')`);
    if (!result) {
        console.log("Error querying");
    }
    console.log("Ultimate result: ", result);
    console.log("Done!!!");

    const { rows } = result;
    console.log("Rows: " + rows);
    if (!rows || rows.length == 0) {
        res.send("Something is not right... Check your keys and try again");
        return;
    }

    const name = rows[0].name;
    console.log("Name: " + name);
    res.send(name ? name : "Something is not right... Check your keys and try again");
})

// Anything that doesn't match the above, send back the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + 'client/build/index.html'));
});

// app.post('/event', db.createEvent);

mountRoutes(app);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});
