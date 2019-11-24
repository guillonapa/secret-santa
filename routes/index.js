const event = require('./event');
const secret = require('./secret');

module.exports = (app) => {
  app.use('/event', event);
  app.use('/secret', secret);
  // etc..
};