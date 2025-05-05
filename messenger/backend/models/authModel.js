const { model, Schema } = require('mongoose');

const registerSchema = new Schema({
  
  userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  // Password is only required for local (non-Google) users
  password: {
    type: String,
    select: false
  },
  image: {
    type: String,
    required: false // Not all Google users have an image
  },
  googleId: {
    type: String,
    required: false // Only set for Google users
  }
}, { timestamps: true });

module.exports = model('user', registerSchema);
