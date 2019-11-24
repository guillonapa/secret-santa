var nodemailer = require('nodemailer');

const ENV = process.env;

var transporter = nodemailer.createTransport({
  service: ENV.MAILER_SERVICE,
  auth: {
    user: ENV.MAILER_EMAIL,
    pass: ENV.MAILER_PW
  }
});

const sendEmail = (eventName, eventKey, element) => {
    var mailOptions = {
        from: ENV.MAILER_EMAIL,
        to: element.email,
        subject: `You've been added to ${eventName}`,
        text: getBody(eventKey, element.name, element.personalKey)
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

const getBody = (eventKey, name, personalKey) => {
    return `Hi ${name},

You have been added to a new secret santa event. Log in to https://secret-santa-events.herokuapp.com/ with your event and personal key to see who you will give a gift to this year.

    Event Key: ${eventKey}
    Personal Key: ${personalKey}
    
Ho-ho-ho,
Santa`
}

module.exports = {
    email: (eventName, eventKey, list) => { 
        list.forEach(element => {
            sendEmail(eventName, eventKey, element);
        });
    }
}