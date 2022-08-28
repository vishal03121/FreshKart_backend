require('dotenv').config();

var QRCode = require('qrcode')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)




exports.sendOTPMail = async (to_email, imageData, manualKey) => {
  try {
    const img = QRCode.toDataURL(imageData).then((image) => {
      const html = `
      <h1>Please Save this Email for future references.</h1>
      <p>Scan the Attached Qr Code with Google Authenticator to get the OTP</p><br/>
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
      const msg = {
        to: to_email,
        from: `FRESHKART <${process.env.EMAIL}>`,
        subject: 'Verfication Code',
        text: 'Please Scan the Below Qr Code with Google Authenticator to get the OTP',
        html: html,
        attachDataUrls: true,
        attachments: [
          {
            filename: "qrcode.png",
            contentType: 'image/png',
            content: image.split("base64,")[1]
          }
        ]
      }
      sgMail
        .send(msg)
        .then(() => {
          console.log('Email sent')
        })
        .catch((error) => {
          console.error(error)
        })

    });

  }
  catch (error) {
    console.log(error.message);
  }
};
