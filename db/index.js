const express = require('express');
const mountRoutes = require('./routes/index');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const ENV = process.env;
const port = ENV.REACT_APP_API_PORT; //3001;

console.log("First: ", ENV.REACT_APP_API_PORT);
console.log("Second: ", ENV.MAILER_EMAIL);

app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.get('/', (request, response) => {
  response.send("Express API is up and running!");
});

// app.post('/event', db.createEvent);

mountRoutes(app);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});
