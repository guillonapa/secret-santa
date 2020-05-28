const express = require('express');
const path = require('path');
const cryptoRandomString = require('crypto-random-string');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db/index');
const emailSender = require('./mailer/index');

// the express api app
const app = express();

app.use(cors());
app.use(
    bodyParser.urlencoded({
      extended: true,
    })
);
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client/build')));

/**
 * Get the secret person for the specific person and event based on the
 * personal key and the event key passed in the parameters.
 */
app.get('/secret/:eventKey/:personalKey', async (req, res) => {
    const { eventKey, personalKey } = req.params;
    // let errMsg = "Something is not right... Check your keys and try again";
    let errMsg = [eventKey, personalKey];

    try {
        // get the person who's key is the same as the one for the person's matched key
        const result = await db.query(`SELECT name FROM people WHERE personal_key IN (SELECT match FROM people WHERE personal_key = '${personalKey}' AND event_key = '${eventKey}')`);
        errMsg.push(result);

        // make sure the a single row is returned
        const { rows } = result;
        if (!rows || rows.length != 1) {
            res.send(errMsg.toString());
            return;
        }

        // return the name of the secret person
        const name = rows[0].name;
        res.send(name ? name : errMsg.toString());
    } catch (err) {
        errMsg.push(err);
        res.send(errMsg.toString());
    }
});

/**
 * Converts the array of people into comma separated 'objects' represented by
 * comma separated values within parentheses.
 */
const stringifyPeopleResult = (people) => {
    let i = 0;
    let result = '';
    people.forEach(person => {
        values += `('${person.name}', '${person.email}', '${key}', '${person.personalKey}', '${person.match}')`;
        if (++i < people.length) {
            result += ', ';
        }
    });
    return result;
}

/**
 * Will create an event with the name and people array passed in the
 * body of the request. The key of the event is returned or an empty
 * string if any error occurred.
 */
app.post('/event', async (req, res) => {
    try {
        const { name, people } = req.body

        // a unique key for the event (non-existent in the db)
        let key = await db.verifiedKey();

        // add event to events table
        await db.query('INSERT INTO events (name, key) VALUES ($1, $2)', [name, key]);

        // create people array to include personal keys
        const peopleArray = [];

        // create a set to check for duplicate personal keys
        const keysSet = new Set();

        // give everyone personal keys
        people.forEach(person => {
            let potentialKey = cryptoRandomString({ length: 15, type: 'url-safe' });
            while (keysSet.has(potentialKey)) {
              potentialKey = cryptoRandomString({ length: 15, type: 'url-safe' });
            }
            keysSet.add(potentialKey);
            peopleArray.push({ name: person.name, email: person.email, personalKey: potentialKey });
        });

        // get the array that will determine who (the index in the array) gives a gift to whom (the value at that index)
        let pairing = db.shuffle(Array(peopleArray.length).fill().map((x, i) => i));

        // the final result to insert to the db
        let matchedPeopleArray = Array(peopleArray.length);

        // populate the result
        pairing.forEach((elem, index) => {
            let drawingPerson = peopleArray[index];
            let matchedPerson = peopleArray[elem];
            matchedPeopleArray[index] = {
                name: drawingPerson.name,
                email: drawingPerson.email,
                personalKey: drawingPerson.personalKey,
                match: matchedPerson.personalKey
            }
        });

        // insert all people with their respective match into db
        await db.query(`INSERT INTO people (name, email, event_key, personal_key, match) VALUES ${stringifyPeopleResult(matchedPeopleArray)}`);
        
        // send emails to each person with event and personal keys
        emailSender.email(name, key, matchedPeopleArray);

        // return the key of the event
        res.send(`${key}`);
    } catch (err) {
        res.send("");
    }
});

// Anything that doesn't match the above, send back the index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + 'client/build/index.html'));
});

// get a port for the app to listen at
const port = process.env.PORT || process.env.REACT_APP_API_PORT;

// start listening for rest calls
app.listen(port, () => {
    console.log(`App running on port ${port}.`)
});
