const formidable = require('formidable');
const validator = require('validator');
const registerModel = require('../models/authModel');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

// Enhanced user registration with error handling
module.exports.userRegister = (req, res) => {
    const form = formidable();
    form.parse(req, async (err, fields, files) => {
        try {
            const { userName, email, password, confirmPassword } = fields;
            const { image } = files;
            const errors = [];

            // Validation checks
            if (!userName) errors.push('Please provide your user name');
            if (!email) errors.push('Please provide your Email');
            if (email && !validator.isEmail(email)) errors.push('Please provide a valid Email');
            if (!password) errors.push('Please provide your Password');
            if (!confirmPassword) errors.push('Please provide your confirm Password');
            if (password && confirmPassword && password !== confirmPassword) errors.push('Passwords do not match');
            if (password && password.length < 6) errors.push('Password must be at least 6 characters');
            if (!files.image) errors.push('Please provide user image');

            if (errors.length > 0) {
                return res.status(400).json({ 
                    success: false,
                    errors: { errorMessage: errors } 
                });
            }

            // Image handling
            const getImageName = files.image.originalFilename;
            const randNumber = Math.floor(Math.random() * 99999);
            const newImageName = randNumber + getImageName;
            const newPath = path.join(__dirname, '../uploads/', newImageName);

            // Check existing user
            const existingUser = await registerModel.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ 
                    success: false,
                    errors: { errorMessage: ['Email already exists'] }
                });
            }

            // File operations
            await fs.promises.copyFile(files.image.filepath, newPath);

            // User creation
            const user = await registerModel.create({
                userName,
                email,
                password: await bcrypt.hash(password, 10),
                image: newImageName
            });

            // JWT token generation
            const token = jwt.sign({
                id: user._id,
                email: user.email,
                userName: user.userName,
                image: user.image,
                registerTime: user.createdAt
            }, process.env.SECRET, { expiresIn: process.env.TOKEN_EXP });

            // Cookie configuration
            const cookieOptions = {
                expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000),
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            };

            res.status(201)
                .cookie('authToken', token, cookieOptions)
                .json({ 
                    success: true,
                    message: 'Registration successful',
                    token 
                });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ 
                success: false,
                errors: { errorMessage: ['Internal server error'] } 
            });
        }
    });
};

// Improved login controller
module.exports.userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const errors = [];

        if (!email) errors.push('Please provide your Email');
        if (!password) errors.push('Please provide your Password');
        if (email && !validator.isEmail(email)) errors.push('Please provide a valid Email');

        if (errors.length > 0) {
            return res.status(400).json({ 
                success: false,
                errors: { errorMessage: errors } 
            });
        }

        const user = await registerModel.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                errors: { errorMessage: ['User not found'] } 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                errors: { errorMessage: ['Invalid credentials'] } 
            });
        }

        // JWT token generation
        const token = jwt.sign({
            id: user._id,
            email: user.email,
            userName: user.userName,
            image: user.image,
            registerTime: user.createdAt
        }, process.env.SECRET, { expiresIn: process.env.TOKEN_EXP });

        // Cookie configuration
        const cookieOptions = {
            expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        };

        res.status(200)
            .cookie('authToken', token, cookieOptions)
            .json({ 
                success: true,
                message: 'Login successful',
                token 
            });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            errors: { errorMessage: ['Internal server error'] } 
        });
    }
};

// Fixed logout controller
module.exports.userLogout = (req, res) => {
    try {
        // Clear cookie with same options used for setting
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        };

        res.status(200)
            .clearCookie('authToken', cookieOptions)
            .json({
                success: true,
                message: 'Logout successful'
            });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            success: false,
            errors: { errorMessage: ['Logout failed'] } 
        });
    }
};
