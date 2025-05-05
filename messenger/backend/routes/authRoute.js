const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken'); // Added JWT import
const {userRegister, userLogin, userLogout} = require('../controller/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Existing routes
router.post('/user-login', userLogin);
router.post('/user-register', userRegister);
router.post('/user-logout', authMiddleware, userLogout);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));

// Updated Google callback route with JWT token implementation
router.get('/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: 'http://localhost:3000/login'
    }),
    (req, res) => {
        // Create a JWT token for the Google user - similar to regular login
        const token = jwt.sign({
            id: req.user._id,
            email: req.user.email,
            userName: req.user.userName,
            image: req.user.image,
            registerTime: req.user.createdAt
        }, process.env.SECRET, {
            expiresIn: process.env.TOKEN_EXP
        });
        
        // Set cookie with token and proper expiration
        const options = { expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000) };
        res.cookie('authToken', token, options);
        
        // Redirect to frontend OAuth callback route
        res.redirect(`http://localhost:3000/oauth-callback?token=${token}`);
    }
);
// authRoute.js
router.post('/user-logout', authMiddleware, (req, res) => {
    try {
      // Clear HTTP-only cookie
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        path: '/'
      });
      
      // Invalidate JWT token (optional - if using token blacklist)
      const token = req.cookies.authToken;
      // Add token to blacklist database/redis here
      
      res.status(200).json({ 
        success: true,
        message: 'Logout successful'
      });
    } catch (err) {
      res.status(500).json({ 
        success: false,
        message: 'Server error during logout'
      });
    }
  });
  
module.exports = router;
