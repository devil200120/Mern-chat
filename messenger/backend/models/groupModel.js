const { Schema, model } = require('mongoose');

const groupSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  image: { 
    type: String, 
    default: '' 
  },
  members: [{ 
    type: String, 
    required: true 
  }],
  admin: { 
    type: String, 
    required: true 
  },
}, { timestamps: true });

module.exports = model('group', groupSchema);
