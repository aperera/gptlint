// This snippet uses require to load a JSON file, which is not the ESM way.
const config = require('./config.json')

module.exports.getConfig = function () {
  return config
}

// Generated by gpt-4-0125-preview
