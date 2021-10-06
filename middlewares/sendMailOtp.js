require('dotenv').config();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

var QRCode = require('qrcode')

const CLIENT_ID = process.env.CLIENT_ID;
const CLEINT_SECRET = process.env.CLEINT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });


exports.sendOTPMail = async (to_email , imageData, manualKey) => {
  try{
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
    const img = await QRCode.toDataURL(imageData);
    const html =`
    <h1>Please Save this Email for future references.</h1>
    <p>Scan the Below Qr Code with Google Authenticator to get the OTP</p><br/>
    <center>
      <img src="${img}"/>
    </center>
    <h3>If you are unable to scan the QR Code Follow These Steps:</h3>
    <p>1. Copy this text given below</p>
    <pre><b>    ${manualKey}</b></pre>
    <p>2. Open Google Authenticator.</p>
    <p>3. Click on "Enter Setup Key"</p>
    <p>4. Give the Account name of Your Choice.</p>
    <p>5. Paste the above bold text into "Your Key" box.</p>
    <p>6. Select Time Based under "Type of Key"</p>
    <p>7. Click on "Add"</p><br><br><br>
    
    <p>If Qr Code Not Visible Check the attactment below</p>
    `
    const mailOptions = {
      from: `FRESHKART <${process.env.EMAIL}>`,
      to: to_email,
      subject: "Verfication Code",
      text: "Please Scan the Below Qr Code with Google Authenticator to get the OTP",
      html: html,
      attachDataUrls: true,
      attachments:[
        {   
          filename: "qrcode.png",
          contentType:  'image/png',
          content: Buffer.from(img.split("base64,")[1], "base64")
        }
      ]
    };
    await transport.sendMail(mailOptions);
  }
  catch(error){
    console.log(error.message);
  }
};
