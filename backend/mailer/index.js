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
async function sendEmail(eventName, eventKey, element) {
    var mailOptions = {
        from: ENV.MAILER_EMAIL,
        to: element.email,
        subject: `You've been added to ${eventName}`,
        text: getBody(eventKey, element.name, element.personalKey)
    };
    try {
        let emailResult = await transporter.sendMail(mailOptions);
        console.log(emailResult);
        return '200';
    } catch (err) {
        console.log(err);
        return '400';
    }
}

/**
 * Returns a string with the formatted contents of the email for a person.
 */
const getBody = (eventKey, name, personalKey) => {
    return `Hi ${name},

You have been added to a new secret santa event. Log in to ${ENV.WEBSITE_URL} with your event ID and personal key to see who you will give a gift to this year.

    Event ID: ${eventKey}
    Personal Key: ${personalKey}
    
Ho-ho-ho,
Santa`
}

/**
 * Sends an email to each of the participants, synchronously.
 */
async function email(eventName, eventKey, list) { 
    await new Promise(resolve => setTimeout(resolve, 1000));
    for (var i = 0; i < list.length; i++) {
        let returnCode = await sendEmail(eventName, eventKey, list[i]);
        console.log('Email return code: ', returnCode);
        if (returnCode !== '200') {
            return returnCode;
        }
    }
    return '200';
}

module.exports = {
    email
}