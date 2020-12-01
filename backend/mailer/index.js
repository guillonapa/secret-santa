var nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

// the process environment
const ENV = process.env;


const myOAuth2Client = new OAuth2(
    ENV.CLIENT_ID,
    ENV.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
)

myOAuth2Client.setCredentials({
    refresh_token: ENV.TOKEN_REFRESH
});

const myAccessToken = myOAuth2Client.getAccessToken()

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
         type: "OAuth2",
         user: ENV.MAILER_EMAIL,
         clientId: ENV.CLIENT_ID,
         clientSecret: ENV.CLIENT_SECRET,
         refreshToken: ENV.TOKEN_REFRESH,
         accessToken: myAccessToken 
}});

/**
 * Sends an email with the event and personal keys to a person.
 */
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

/**
 * Returns a string with the formatted contents of the email for a person.
 */
const getBody = (eventKey, name, personalKey) => {
    return `Hi ${name},

You have been added to a new secret santa event. Log in to ${ENV.WEBSITE_URL} with your event and personal key to see who you will give a gift to this year.

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