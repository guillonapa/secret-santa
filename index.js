const express = require('express');
const path = require('path');
const mountRoutes = require('./routes/index');
const db = require('./db/index');
const emailSender = require('./mailer/index');
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

app.get('/secret/:eventKey/:personalKey', (req, res) => {
    const { eventKey, personalKey } = req.params;

    console.log("eventKey: ", eventKey);
    console.log("personalKey: ", personalKey);

    db.query(`SELECT name FROM people WHERE personal_key IN (SELECT match FROM people WHERE personal_key = '${personalKey}' AND event_key = '${eventKey}')`)
      .then(result => {
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

      });
});

app.post('/event', async (req, res) => {
  
  try {
    console.log(req);
    const { name, people } = req.body
    console.log("name: ", name);
    console.log("people: ", people);
  
    let key = await db.verifiedKey();

    const insEventRes = await db.query('INSERT INTO events (name, key) VALUES ($1, $2)', [name, key]);

    if (!insEventRes) {
      console.log("Error for event insertion");
    }

    // create a new people array
    const peopleArray = [];

    // create an array to check for dupes
    let keysArray = [];
    
    // give everyone personal keys
    people.forEach(person => {
        // potential key
        let potentialKey = cryptoRandomString({ length: 15, type: 'url-safe' });
        while (keysArray.includes(potentialKey)) {
            potentialKey = cryptoRandomString({ length: 15, type: 'url-safe' });
        }
        keysArray.push(potentialKey);
        peopleArray.push({ name: person.name, email: person.email, personalKey: potentialKey });
    });

    console.log("PeopleArray: ", peopleArray);
    console.log("Keys: ", keysArray);

    // get the pairing array
    let pairing = db.shuffle(Array(peopleArray.length).fill().map((x, i) => i));

    let finalArray = Array(peopleArray.length);
    
    pairing.forEach((elem, index) => {
        let drawingPerson = peopleArray[index];
        let matchedPerson = peopleArray[elem];
        finalArray[index] = { 
            name: drawingPerson.name, 
            email: drawingPerson.email, 
            personalKey: drawingPerson.personalKey, 
            match: matchedPerson.personalKey
        }
    });

    let values = '';

    let i = 0;
    finalArray.forEach(element => {
        values += `('${element.name}', '${element.email}', '${key}', '${element.personalKey}', '${element.match}')`;
        if (++i < people.length) {
            values += ', ';
        }
    });

    try {

      const insPeopleRes = await db.query(`INSERT INTO people (name, email, event_key, personal_key, match) VALUES ${values}`);
      if (!insPeopleRes) {
        console.log("Error for people insertion");
      }
      emailSender.email(name, key, finalArray);
      res.send(`${key}`);

    } catch (err) {
      throw err;
    }
  } catch (err) {
    console.log("Error creating event: ", err);
    res.send("");
  }
});

// Anything that doesn't match the above, send back the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + 'client/build/index.html'));
});

// app.post('/event', db.createEvent);

// mountRoutes(app);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});
