const Router = require('express-promise-router');
const cryptoRandomString = require('crypto-random-string');
const db = require('../db/index');
const emailSender = require('../mailer/index');

console.log("in routes events.js");


// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router();

async function getVerifiedKey() {

    // potential key
    let key = cryptoRandomString({
        length: 10,
        type: 'url-safe'
    });

    let result = null;
    for (let i = 0; i < 10; i++) {
        // the result
        result = await db.query(`SELECT * FROM events WHERE key = '${key}'`);

        if (!result) {
            continue;
        }

        if (result.rowCount == 0) {
            return key;
        }

        key = cryptoRandomString({
            length: 10,
            type: 'url-safe'
        });

    }

    return null;
}

const shuffle = (array) => {

    console.log("Before: ", array);

    let loop = true;
    while (loop) {
        var m = array.length, t, i;
      
        // While there remain elements to shuffle…
        while (m) {  
            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);
        
            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }

        let done = true;

        // check that no element has it's own index
        array.forEach((elem, index) => {
            if (elem === index) {
                done = false;
            }
        });

        loop = !done;
    }
  
    return array;
}

router.post('/', async (req, res) => {
    
    const { name, people } = req.body

    console.log("name: ", name);
    console.log("people: ", people);

    let key = await getVerifiedKey();


    const result = await db.query('INSERT INTO events (name, key) VALUES ($1, $2)', [name, key]);
    if (!result) {
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
    let pairing = shuffle(Array(peopleArray.length).fill().map((x, i) => i));

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

    const peopleResult = await db.query(`INSERT INTO people (name, email, event_key, personal_key, match) VALUES ${values}`);
    if (!peopleResult) {
        console.log("Error for people insertion");
    }

    emailSender.email(name, key, finalArray);

    res.send(`${key}`);
});

// export our router to be mounted by the parent application
module.exports = router;