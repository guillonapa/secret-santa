const Router = require('express-promise-router');
const db = require('../db/index');

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router();

router.get('/:eventKey/:personalKey', async (req, res) => {

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

    

    // // create a new people array
    // const peopleArray = [];

    // // create an array to check for dupes
    // let keysArray = [];
    
    // // give everyone personal keys
    // people.forEach(person => {
    //     // potential key
    //     let potentialKey = cryptoRandomString({ length: 15, type: 'url-safe' });
    //     while (keysArray.includes(potentialKey)) {
    //         potentialKey = cryptoRandomString({ length: 15, type: 'url-safe' });
    //     }
    //     keysArray.push(potentialKey);
    //     peopleArray.push({ name: person.name, email: person.email, personalKey: potentialKey });
    // });

    // console.log("PeopleArray: ", peopleArray);
    // console.log("Keys: ", keysArray);

    // // get the pairing array
    // let pairing = shuffle(Array(peopleArray.length).fill().map((x, i) => i));

    // let finalArray = Array(peopleArray.length);
    
    // pairing.forEach((elem, index) => {
    //     let drawingPerson = peopleArray[index];
    //     let matchedPerson = peopleArray[elem];
    //     finalArray[index] = { 
    //         name: drawingPerson.name, 
    //         email: drawingPerson.email, 
    //         personalKey: drawingPerson.personalKey, 
    //         match: matchedPerson.personalKey
    //     }
    // });

    // let values = '';

    // let i = 0;
    // finalArray.forEach(element => {
    //     values += `('${element.name}', '${element.email}', '${key}', '${element.personalKey}', '${element.match}')`;
    //     if (++i < people.length) {
    //         values += ', ';
    //     }
    // });

    // const peopleResult = await db.query(`INSERT INTO people (name, email, event_key, personal_key, match) VALUES ${values}`);
    // if (!peopleResult) {
    //     console.log("Error for people insertion");
    // }

    // res.send(`Event '${eventKey}' searched with key '${personalKey}'`);
});

// export our router to be mounted by the parent application
module.exports = router;