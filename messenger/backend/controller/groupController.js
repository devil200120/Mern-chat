const Group = require('../models/groupModel');
const Message = require('../models/messageModel');
const formidable = require('formidable');
const fs = require('fs');

// Create a new group
exports.createGroup = async (req, res) => {
  const form = formidable();
  form.parse(req, async (err, fields, files) => {
    const { name, members } = fields;
    const admin = req.myId;
    
    if (!name) {
      return res.status(400).json({
        error: { errorMessage: ['Group name is required'] }
      });
    }
    
    // Parse members array
    let memberArray = [];
    try {
      memberArray = JSON.parse(members);
      // Add admin to members if not already included
      if (!memberArray.includes(admin)) {
        memberArray.push(admin);
      }
    } catch (error) {
      return res.status(400).json({
        error: { errorMessage: ['Invalid members format'] }
      });
    }
    
    try {
      let newImageName = '';
      
      // Handle image upload
      if (files && files.image) {
        const getImageName = files.image.originalFilename;
        const randNumber = Math.floor(Math.random() * 99999);
        newImageName = randNumber + getImageName;
        const newPath = __dirname + `../../../frontend/public/image/${newImageName}`;
        
        fs.copyFile(files.image.filepath, newPath, async (error) => {
          if (error) {
            return res.status(500).json({
              error: { errorMessage: ['Image upload failed'] }
            });
          }
          
          saveGroup();
        });
      } else {
        saveGroup();
      }
      
      async function saveGroup() {
        try {
          const group = await Group.create({
            name,
            members: memberArray,
            admin,
            image: newImageName
          });
          
          res.status(201).json({
            success: true,
            group
          });
        } catch (err) {
          res.status(500).json({
            error: { errorMessage: ['Internal Server Error'] }
          });
        }
      }
    } catch (error) {
      res.status(500).json({
        error: { errorMessage: ['Internal Server Error'] }
      });
    }
  });
};

// Get all groups for the current user
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: { $in: [req.myId] } });
    res.status(200).json({
      success: true,
      groups
    });
  } catch (err) {
    res.status(500).json({
      error: { errorMessage: ['Internal Server Error'] }
    });
  }
};

// Get messages for a specific group
exports.getGroupMessages = async (req, res) => {
  try {
    const groupId = req.params.id;
    const messages = await Message.find({ groupId });
    
    res.status(200).json({
      success: true,
      messages
    });
  } catch (err) {
    res.status(500).json({
      error: { errorMessage: ['Internal Server Error'] }
    });
  }
};

// Send a text message to a group
exports.sendGroupMessage = async (req, res) => {
  try {
    const { groupId, message, senderName } = req.body;
    const senderId = req.myId;
    
    if (!groupId || !message) {
      return res.status(400).json({
        error: { errorMessage: ['Group ID and message are required'] }
      });
    }
    
    // Check if user is a member of the group
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(senderId)) {
      return res.status(403).json({
        error: { errorMessage: ['You are not a member of this group'] }
      });
    }
    
    const newMessage = await Message.create({
      senderId,
      senderName,
      groupId,
      message: {
        text: message,
        image: ''
      }
    });
    
    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (err) {
    res.status(500).json({
      error: { errorMessage: ['Internal Server Error'] }
    });
  }
};

// Send an image message to a group
exports.sendGroupImageMessage = async (req, res) => {
  const senderId = req.myId;
  const form = formidable();
  
  form.parse(req, async (err, fields, files) => {
    const { senderName, groupId, imageName } = fields;
    
    // Check if user is a member of the group
    try {
      const group = await Group.findById(groupId);
      if (!group || !group.members.includes(senderId)) {
        return res.status(403).json({
          error: { errorMessage: ['You are not a member of this group'] }
        });
      }
      
      const newPath = __dirname + `../../../frontend/public/image/${imageName}`;
      files.image.originalFilename = imageName;
      
      fs.copyFile(files.image.filepath, newPath, async (error) => {
        if (error) {
          return res.status(500).json({
            error: { errorMessage: ['Image upload failed'] }
          });
        }
        
        try {
          const newMessage = await Message.create({
            senderId,
            senderName,
            groupId,
            message: {
              text: '',
              image: files.image.originalFilename
            }
          });
          
          res.status(201).json({
            success: true,
            message: newMessage
          });
        } catch (err) {
          res.status(500).json({
            error: { errorMessage: ['Internal Server Error'] }
          });
        }
      });
    } catch (err) {
      res.status(500).json({
        error: { errorMessage: ['Internal Server Error'] }
      });
    }
  });
};
