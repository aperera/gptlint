// Accessing a SendGrid API key from environment variables for sending emails
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Generated by gpt-4-0125-preview
