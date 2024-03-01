const nodemailer=require('nodemailer')
const dotenv = require('dotenv').config()
// generate a random otp

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // set nodemailer

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
       user:process.env.EMAIL,
       pass:process.env.PASSWORD
    }
  })

  //Function to send otp email

  const sendOtpEmail = (recipientEmail)=>{
    const StoreOTP = generateOTP()

  //Email content

  const mailOption ={
    from :process.env.EMAIL,
    to:recipientEmail,
    subject:'OTP Verification',
    text:`Your OTP is ${StoreOTP},  Please use this code to verify your identify.`,

  }


  //send Email

  transporter.sendMail(mailOption,(error,info)=>{
    if(error){
        console.log(error)
    }else{
        console.log('Email send :' + info.response)
    }
  })
  console.log(`OTP has been sent to ${StoreOTP}`)
  return StoreOTP
}

// const recipientEmail = ''
// const StoreOTP = sendOtpEmail(recipientEmail)
// console.log(`OTP has been sent to ${StoreOTP}`)


  module.exports ={sendOtpEmail}