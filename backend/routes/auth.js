const express = require('express');
const router = express.Router();

const {
    registerUser,
    loginUser,
    logout,
    getUserProfile,
    updateProfile,
    updatePassword,
    createAdmin,
    verifyEmail,
    resendEmailVerification,
    googleLogin
} = require('../controllers/authController');

const { isAuthenticatedUser } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const { getAllUsers, updateUserRole, deleteUser, updateUserStatus } = require('../controllers/authController');

router.route('/register').post(upload.single('avatar'), registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(logout);
router.route('/me').get(isAuthenticatedUser, getUserProfile);
router.route('/me/update').put(isAuthenticatedUser, upload.single('avatar'), updateProfile);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);

// Email verification routes
router.route('/verify-email/:token').get(verifyEmail);
router.route('/resend-verification').post(resendEmailVerification);

// Admin route (for testing purposes)
router.route('/admin/register').post(createAdmin);

// Admin users management
router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), getAllUsers);
router.route('/admin/user/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateUserRole)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser);

router.route('/admin/user/:id/status')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateUserStatus);

module.exports = router;
// Google auth route
router.post('/auth/google', googleLogin);