const Group = require('../models/groupModel');
const Message = require('../models/messageModel');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

// Configure upload directory
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Create a new group
exports.createGroup = async (req, res) => {
  const form = formidable({
    multiples: true,
    uploadDir: UPLOAD_DIR,
    keepExtensions: true,
    filename: (name, ext, part) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      return `${uniqueSuffix}${path.extname(part.originalFilename)}`;
    }
  });

  try {
    const [fields, files] = await form.parse(req);
    const { name, members } = fields;
    const admin = req.myId;

    if (!name || !name[0]) {
      return res.status(400).json({
        error: { errorMessage: ['Group name is required'] }
      });
    }

    // Process members array
    let memberArray = [];
    try {
      memberArray = JSON.parse(members[0]);
      if (!Array.isArray(memberArray)) throw new Error();
    } catch (error) {
      return res.status(400).json({
        error: { errorMessage: ['Invalid members format'] }
      });
    }

    // Add admin if not present
    if (!memberArray.includes(admin)) {
      memberArray.push(admin);
    }

    // Handle image upload
    let imageName = '';
    if (files.image && files.image[0]) {
      imageName = files.image[0].newFilename;
    }

    // Create group
    const group = await Group.create({
      name: name[0],
      members: memberArray,
      admin,
      image: imageName
    });

    res.status(201).json({
      success: true,
      group
    });

  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      error: { errorMessage: ['Internal Server Error'] }
    });
  }
};

// Get all groups for the current user
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: { $in: [req.myId] } })
      .populate('members', 'name profileImage')
      .populate('admin', 'name profileImage');

    res.status(200).json({
      success: true,
      groups
    });
  } catch (err) {
    console.error('Get groups error:', err);
    res.status(500).json({
      error: { errorMessage: ['Internal Server Error'] }
    });
  }
};

// Get messages for a specific group
exports.getGroupMessages = async (req, res) => {
  try {
    const groupId = req.params.id;
    const messages = await Message.find({ groupId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name profileImage');

    res.status(200).json({
      success: true,
      messages
    });
  } catch (err) {
    console.error('Get group messages error:', err);
    res.status(500).json({
      error: { errorMessage: ['Internal Server Error'] }
    });
  }
};

// Common message validation
const validateMessageRequest = async (req) => {
  const { groupId } = req.body;
  if (!groupId) {
    return { error: 'Group ID is required' };
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return { error: 'Group not found' };
  }

  if (!group.members.includes(req.myId)) {
    return { error: 'You are not a member of this group' };
  }

  return { group };
};

// Send a text message to a group
exports.sendGroupMessage = async (req, res) => {
  try {
    const { error, group } = await validateMessageRequest(req);
    if (error) return res.status(400).json({ error: { errorMessage: [error] } });

    const { message, senderName } = req.body;
    if (!message) {
      return res.status(400).json({
        error: { errorMessage: ['Message content is required'] }
      });
    }

    const newMessage = await Message.create({
      senderId: req.myId,
      senderName,
      groupId: group._id,
      message: {
        text: message,
        image: ''
      }
    });

    res.status(201).json({
      success: true,
      message: await newMessage.populate('senderId', 'name profileImage')
    });

  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({
      error: { errorMessage: ['Internal Server Error'] }
    });
  }
};

// Send an image message to a group
exports.sendGroupImageMessage = async (req, res) => {
  const form = formidable({
    multiples: true,
    uploadDir: UPLOAD_DIR,
    keepExtensions: true,
    filename: (name, ext, part) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      return `${uniqueSuffix}${path.extname(part.originalFilename)}`;
    }
  });

  try {
    const [fields, files] = await form.parse(req);
    const { groupId, senderName } = fields;

    // Validate group membership
    const group = await Group.findById(groupId[0]);
    if (!group || !group.members.includes(req.myId)) {
      return res.status(403).json({
        error: { errorMessage: ['You are not a member of this group'] }
      });
    }

    if (!files.image || !files.image[0]) {
      return res.status(400).json({
        error: { errorMessage: ['Image file is required'] }
      });
    }

    const newMessage = await Message.create({
      senderId: req.myId,
      senderName: senderName[0],
      groupId: groupId[0],
      message: {
        text: '',
        image: files.image[0].newFilename
      }
    });

    res.status(201).json({
      success: true,
      message: await newMessage.populate('senderId', 'name profileImage')
    });

  } catch (err) {
    console.error('Image message error:', err);
    res.status(500).json({
      error: { errorMessage: ['Internal Server Error'] }
    });
  }
};
