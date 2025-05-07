const formidable = require('formidable');
const validator = require('validator');
const registerModel = require('../models/authModel');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const crypto = require('crypto');

// Helper: Unified cookie configuration
const getCookieOptions = () => ({
    expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
});

// Helper: Validate password strength
const isStrongPassword = (password) =>
    validator.isStrongPassword(password, {
        minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
    });

// Registration Controller
module.exports.userRegister = (req, res) => {
    const form = formidable({ multiples: false, maxFileSize: 2 * 1024 * 1024 }); // 2MB limit
    form.parse(req, async (err, fields, files) => {
        try {
            const { userName, email, password, confirmPassword } = fields;
            const errors = [];

            // Basic validations
            if (!userName || !email || !password || !confirmPassword)
                errors.push('All fields are required');
            if (email && !validator.isEmail(email))
                errors.push('Please provide a valid Email');
            if (password && confirmPassword && password !== confirmPassword)
                errors.push('Passwords do not match');
            if (password && !isStrongPassword(password))
                errors.push('Password must be at least 8 characters and include uppercase, lowercase, number, and symbol');

            // Image validation
            const image = files.image;
            if (!image)
                errors.push('Please provide a user image');
            else {
                const allowedMimeTypes = ['image/jpeg', 'image/png'];
                if (!allowedMimeTypes.includes(image.mimetype))
                    errors.push('Invalid image type. Only JPEG and PNG allowed.');
                if (image.size > 2 * 1024 * 1024)
                    errors.push('Image size must be less than 2MB');
            }

            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    errors: { errorMessage: errors }
                });
            }

            // Check if user exists
            const existingUser = await registerModel.findOne({ email });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    errors: { errorMessage: ['Email already exists'] }
                });
            }

            // Generate secure random filename
            const ext = path.extname(image.originalFilename);
            const newImageName = crypto.randomBytes(16).toString('hex') + ext;
            const newPath = path.join(__dirname, '../uploads/', newImageName);

            // Save image
            await fs.promises.copyFile(image.filepath, newPath);

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = await registerModel.create({
                userName,
                email,
                password: hashedPassword,
                image: newImageName
            });

            // JWT token
            const token = jwt.sign({
                id: user._id,
                email: user.email,
                userName: user.userName,
                image: user.image,
                registerTime: user.createdAt
            }, process.env.SECRET, { expiresIn: process.env.TOKEN_EXP });

            res.status(201)
                .cookie('authToken', token, getCookieOptions())
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

// Login Controller
module.exports.userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const errors = [];

        if (!email || !password)
            errors.push('Email and password are required');
        if (email && !validator.isEmail(email))
            errors.push('Please provide a valid Email');

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

        const token = jwt.sign({
            id: user._id,
            email: user.email,
            userName: user.userName,
            image: user.image,
            registerTime: user.createdAt
        }, process.env.SECRET, { expiresIn: process.env.TOKEN_EXP });

        res.status(200)
            .cookie('authToken', token, getCookieOptions())
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

// Logout Controller
module.exports.userLogout = (req, res) => {
    try {
        res.status(200)
            .clearCookie('authToken', getCookieOptions())
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
