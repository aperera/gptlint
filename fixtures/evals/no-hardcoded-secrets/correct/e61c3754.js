// Using environment variables for OAuth client secrets in a Passport strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  })
)

// Generated by gpt-4-0125-preview
