const nodemailer = require("nodemailer");

// can be used later
// async function mailer(name, message) {
//   const transporter = await nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//       user: process.env.TRANSPORT_EMAIL,
//       pass: process.env.TRANSPORT_PASSWORD,
//     },
//   });
//   transporter.verify(function (error, success) {
//     if (error) {
//       throw new Error(error);
//     } else {
//       console.log("Server is ready to take our messages");
//     }
//   });
//   const mailOptions = {
//     from: "Portfolio Message",
//     to: "parsediyarishabh@gmail.com",
//     subject: `Message from ${name}, Shared something with you`,
//     text: `${message}`,
//   };
//   const info = await transporter.sendMail(mailOptions);
//   if (!info) {
//     return { message: "failure", sent: false };
//   }
//   return {
//     data: info,
//     message: "Sent Successfully",
//     sent: true,
//   };
// }

const generateOTP = () => {
  let otp = "";
  for (var i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};
async function verifyEmail(email) {
  const otp = generateOTP();
  const transporter = await nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.TRANSPORT_EMAIL,
      pass: process.env.TRANSPORT_PASSWORD,
    },
  });
  transporter.verify(function (error, success) {
    if (error) {
      throw new Error(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });
  const mailOptions = {
    from: "Expense Manager",
    to: email,
    subject: `OTP for Expense Manager Verification`,
    text: `You can use this otp: ${otp} to verify yourself.!`,
  };
  const info = await transporter.sendMail(mailOptions);
  if (!info) {
    return { message: "failure", sent: false };
  }
  return {
    data: info,
    message: "Sent Successfully",
    sent: true,
    otp,
  };
}

module.exports = {
  verifyEmail,
};
