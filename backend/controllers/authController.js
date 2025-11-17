const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../config/email');
const { getAdminAuth } = require('../config/firebaseAdmin');

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'PRODUCTION') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
        }
    });
};

// Register user => /api/v1/register
exports.registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create default avatar
        const defaultAvatar = {
            public_id: 'default_avatar',
            url: 'https://res.cloudinary.com/dkqnaqbvg/image/upload/v1/default_avatar.png'
        };

        const user = await User.create({
            name,
            email,
            password,
            avatar: defaultAvatar
        });

        // Generate email verification token
        const verificationToken = user.getEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        // Create verification URL - point to frontend
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/verify-email/${verificationToken}`;

        const message = `
            <h2>Email Verification</h2>
            <p>Hello ${name},</p>
            <p>Thank you for registering with Nourishy! Please verify your email address by clicking the link below:</p>
            <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            <p>Or copy and paste this link in your browser:</p>
            <p>${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Nourishy - Email Verification',
                html: message
            });

            res.status(201).json({
                success: true,
                message: 'registered successful please check email for verefication'
            });
        } catch (error) {
            user.emailVerificationToken = undefined;
            user.emailVerificationExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Please try again later.'
            });
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const { cloudinary } = require('../config/cloudinary');

// Update user profile => /api/v1/me/update
exports.updateProfile = async (req, res, next) => {
    try {
        const newUserData = {
            name: req.body.name,
            email: req.body.email
        };

        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Handle avatar update via file upload, base64, or direct URL
        let uploadedAvatar = null;
        try {
            if (req.file) {
                // Binary file uploaded via multer
                uploadedAvatar = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'avatars',
                    resource_type: 'image',
                    transformation: [{ width: 300, height: 300, crop: 'fill' }]
                });
            } else if (req.body.avatar && typeof req.body.avatar === 'string') {
                const avatarStr = req.body.avatar;
                if (avatarStr.startsWith('data:')) {
                    // Base64 data URL uploaded directly
                    uploadedAvatar = await cloudinary.uploader.upload(avatarStr, {
                        folder: 'avatars',
                        resource_type: 'image',
                        transformation: [{ width: 300, height: 300, crop: 'fill' }]
                    });
                } else if (avatarStr.trim() !== '') {
                    // Plain URL provided, just store it
                    newUserData.avatar = {
                        public_id: currentUser.avatar?.public_id || 'external_url',
                        url: avatarStr
                    };
                }
            }
        } catch (uploadErr) {
            console.error('Avatar upload error:', uploadErr);
            return res.status(500).json({ success: false, message: 'Avatar upload failed' });
        }

        // If we uploaded a new image to Cloudinary, optionally remove old one and set new
        if (uploadedAvatar) {
            // Destroy old avatar if it exists and is not a default placeholder
            if (currentUser.avatar?.public_id && !currentUser.avatar.public_id.startsWith('default_')) {
                try { await cloudinary.uploader.destroy(currentUser.avatar.public_id); } catch (e) { /* ignore */ }
            }
            newUserData.avatar = {
                public_id: uploadedAvatar.public_id,
                url: uploadedAvatar.secure_url || uploadedAvatar.url
            };
        }

        const updatedUser = await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Login user => /api/v1/login
exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if email and password is entered by user
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please enter email & password'
            });
        }

        // Finding user in database
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Email or Password'
            });
        }

        // Checks if password is correct or not
        const isPasswordMatched = await user.comparePassword(password);

        if (!isPasswordMatched) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Email or Password'
            });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email before logging in. Check your inbox for verification link.'
            });
        }

        // Block login for deactivated accounts
        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: 'Your account is deactivated. Please contact support or an administrator.'
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.redirect('http://localhost:5174/login?error=server_error');
    }
};


exports.googleLogin = async (req, res, next) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: "Missing Google ID token"
            });
        }

        // Verify token with Firebase Admin
        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifyIdToken(idToken);

        const { email, name, picture, uid } = decoded;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Google account does not have an email"
            });
        }

        // Look for existing user
        let user = await User.findOne({ email });

        // If user does not exist — create one
        if (!user) {
            const avatar = {
                public_id: "google_avatar",
                url: picture || "https://res.cloudinary.com/demo/image/upload/v1/default_avatar.png"
            };

            user = await User.create({
                name: name || email.split("@")[0],
                email,
                avatar,
                isEmailVerified: true,     // Google accounts are verified
                provider: "google",
                firebaseUID: uid
            });
        }

        // Normal JWT login
        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error("Google login error:", error);
        res.status(500).json({
            success: false,
            message: "Google login failed",
            error: error.message
        });
    }
};
// Logout user => /api/v1/logout
exports.logout = async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out'
    });
};

// Get currently logged in user details => /api/v1/me
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create admin user => /api/v1/admin/register (for testing purposes)
exports.createAdmin = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create default avatar
        const defaultAvatar = {
            public_id: 'admin_avatar',
            url: 'https://res.cloudinary.com/dkqnaqbvg/image/upload/v1/admin_avatar.png'
        };

        const user = await User.create({
            name,
            email,
            password,
            avatar: defaultAvatar,
            role: 'admin'
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Verify email => /api/v1/verify-email/:token
exports.verifyEmail = async (req, res, next) => {
    try {
        // Get hashed token
        const emailVerificationToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            emailVerificationToken,
            emailVerificationExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.redirect('http://localhost:5174/login?error=invalid_token');
        }

        // Verify the email
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;

        await user.save();

        // Redirect to login page with success message
        res.redirect('http://localhost:5174/login?verified=true');
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ===== Admin: Users Management =====
// Get all users => /api/v1/admin/users
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update user role => /api/v1/admin/user/:id
exports.updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true, useFindAndModify: false }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'Role updated', user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update user activation status => /api/v1/admin/user/:id/status
exports.updateUserStatus = async (req, res, next) => {
    try {
        const { isActive } = req.body;
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true, runValidators: true, useFindAndModify: false }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'Status updated', user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete user => /api/v1/admin/user/:id
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await user.deleteOne();
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Resend email verification => /api/v1/resend-verification
exports.resendEmailVerification = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        // Generate new verification token
        const verificationToken = user.getEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        // Create verification URL
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/verify-email/${verificationToken}`;

        const message = `
            <h2>Email Verification</h2>
            <p>Hello ${user.name},</p>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            <p>Or copy and paste this link in your browser:</p>
            <p>${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Nourishy - Email Verification',
                html: message
            });

            res.status(200).json({
                success: true,
                message: 'Verification email sent successfully!'
            });
        } catch (error) {
            user.emailVerificationToken = undefined;
            user.emailVerificationExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Please try again later.'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};