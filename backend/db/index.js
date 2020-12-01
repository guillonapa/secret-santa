const cryptoRandomString = require('crypto-random-string');
const Pool = require('pg').Pool;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false 
    }
});

/**
 * Get a unique key for an event, making sure it does not exist
 * already in the db.
 */
async function verifiedKey() {
    // potential key
    let key = cryptoRandomString({
        length: 10,
        type: 'url-safe'
    });

    // attempt up to ten times to generate a unique key (although changes of dupe are minimal)
    for (let i = 0; i < 10; i++) {
        try {
            let result = await pool.query(`SELECT * FROM events WHERE key = '${key}'`);
            if (result.rowCount == 0) {
                return key;
            }
            key = cryptoRandomString({
                length: 10,
                type: 'url-safe'
            });
        } catch (err) {
            continue;
        }
    }
    return null;
}

/**
 * Suffle the contents of an array of integers.
 * We guarantee that value at index i, is i (the index) itself.
 */
const shuffle = (array) => {
    let loop = true;

    // loop until every value at index i, is not i (the index) itself, after shuffling
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

        // check that no element has it's own index as value
        array.forEach((elem, index) => {
            if (elem === index) {
                done = false;
            }
        });

        // update loop condition
        loop = !done;
    }
    return array;
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    verifiedKey: () => verifiedKey(),
    shuffle: (array) => shuffle(array)
};