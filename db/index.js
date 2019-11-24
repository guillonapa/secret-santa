const express = require('express');
const mountRoutes = require('./routes/index');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const ENV = process.env;
const port = ENV.API_PORT; //3001;

app.use(bodyParser.json());
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', (request, response) => {
  response.json({ info: 'Express API is up and running!' });
});

// app.post('/event', db.createEvent);

mountRoutes(app);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});
