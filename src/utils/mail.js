import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async function(options){
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Project Management App",
            link: "http://project-management-app.com",
        }   

    })

    const emaiTexual  = mailGenerator.generatePlaintext(options.mailgenContent);
    const emaiHtml  = mailGenerator.generate(options.mailgenContent);


    const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_SMTP_HOST,
  port: process.env.MAILTRAP_SMTP_PORT,
  
  auth: {
    user: process.env.MAILTRAP_SMTP_USER,
    pass: process.env.MAILTRAP_SMTP_PASS,
  },

  
   });

   const mail ={
     from: 'heyyyakash907@gmail.com', // sender address
    to: options.email, // list of recipients
    subject: options.subject, // subject line
    text: emaiTexual, // plain text body
    html: emaiHtml, // HTML body
   }


   try{
    await transporter.sendMail(mail)
   }catch(err){
    console.error(`Email verification failed at : ${err}`)
   }
}


const  emailVerficationMailgenContent  = (username , verificationLink) => {
    return {
         body: {
        name: username,
        intro: 'Welcome to Project Management App! We\'re very excited to have you on board.',
        action: {
            instructions: 'To get started with your account, please click here:',
            button: {
                color: '#22BC66', // Optional action button color
                text: 'Confirm your account',
                link: verificationLink
            }
        },
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
    }
}

const  forgetPasswordMailgenContent  = (username , passwordResetURL) => {
    return {
         body: {
        name: username,
        intro: 'Welcome to Project Management App! We\'re very excited to have you on board.',
        action: {
            instructions: 'To reset your password, please click here:',
            button: {
                color: '#ca2f23', // Optional action button color
                text: 'Confirm your account',
                link: passwordResetURL
            }
        },
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
    }
}

export { emailVerficationMailgenContent , forgetPasswordMailgenContent , sendEmail }