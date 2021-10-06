const nodemailer = require("nodemailer");
var QRCode = require('qrcode')


exports.sendOTPMail = async (to_email , imageData, manualKey) => {
  let img = await QRCode.toDataURL(imageData);

  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

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
  let mailOptions = {
    from: "pythoncabproject@gmail.com",
    to: to_email,
    subject: "Verfication Code",
    attachDataUrls: true,
    text: "Please Scan the Below Qr Code with Google Authenticator to get the OTP",
    html: html,
    attachments:[
      {   
        filename: "qrcode.png",
        contentType:  'image/png',
        content: Buffer.from(img.split("base64,")[1], "base64")
      }
    ]
  };

  mailTransporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log(err);
    }
  });
};
