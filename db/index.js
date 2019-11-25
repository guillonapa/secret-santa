const Pool = require('pg').Pool;
const cryptoRandomString = require('crypto-random-string');

const ENV = process.env;
const pool = new Pool({
    connectionString: ENV.DATABASE_URL,
    ssl: true
    // user: ENV.DB_USER,
    // host: ENV.DB_HOST,
    // database: ENV.DB_DB,
    // password: ENV.DB_PW,
    // port: ENV.DB_PORT
});


async function verifiedKey() {

    // potential key
    let key = cryptoRandomString({
        length: 10,
        type: 'url-safe'
    });

    let result = null;
    for (let i = 0; i < 10; i++) {
        // the result
        result = await pool.query(`SELECT * FROM events WHERE key = '${key}'`);

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


module.exports = {
    query: (text, params) => pool.query(text, params),
    verifiedKey: () => verifiedKey(),
    shuffle: (array) => shuffle(array)
};