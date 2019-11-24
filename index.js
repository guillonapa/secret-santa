const express = require('express');
const path = require('path');
const mountRoutes = require('./routes/index');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const ENV = process.env;
const port = ENV.PORT || ENV.REACT_APP_API_PORT; //3001;

console.log("First: ", ENV.REACT_APP_API_PORT);
console.log("Second: ", ENV.MAILER_EMAIL);

app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/api', (request, response) => {
  response.send("Express API is up and running!");
});

// Anything that doesn't match the above, send back the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + 'client/build/index.html'));
})

// app.post('/event', db.createEvent);

mountRoutes(app);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});
