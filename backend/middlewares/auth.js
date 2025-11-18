const User = require('../models/user');
const { getAdminAuth, isFirebaseAdminReady } = require('../config/firebaseAdmin');

// Check if user is authenticated or not
exports.isAuthenticatedUser = async (req, res, next) => {
    try {
        let token;

        // Expect Firebase ID token in Authorization header: Bearer <idToken>
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.token) {
            // Support legacy cookie-based tokens but encourage header usage
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Login first to access this resource' });
        }

        if (!isFirebaseAdminReady()) {
            return res.status(500).json({ success: false, message: 'Server auth not configured (Firebase Admin)' });
        }

        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifyIdToken(token);

        // Find existing user by firebaseUid or email
        let user = await User.findOne({ firebaseUid: decoded.uid });
        if (!user && decoded.email) {
            user = await User.findOne({ email: decoded.email });
        }

        // If user exists but is deactivated, block access
        if (user && user.isActive === false) {
            return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
        }

        if (!user) {
            // Provision user record on first authenticated request
            const defaultAvatar = {
                public_id: 'default_avatar',
                url: 'https://res.cloudinary.com/dkqnaqbvg/image/upload/v1/default_avatar.png'
            };

            user = await User.create({
                name: decoded.name || (decoded.email ? decoded.email.split('@')[0] : 'User'),
                email: decoded.email || `user_${decoded.uid}@example.com`,
                avatar: defaultAvatar,
                firebaseUid: decoded.uid,
                isEmailVerified: Boolean(decoded.email_verified)
            });
        } else if (!user.firebaseUid) {
            // Link existing account to Firebase UID if not already linked
            user.firebaseUid = decoded.uid;
            if (decoded.email_verified) user.isEmailVerified = true;
            await user.save({ validateBeforeSave: false });
        }

        req.user = user;
        next();
    } catch (error) {
        // Provide clearer diagnostics for frontend and logs for backend
        const code = error?.code || 'unknown';
        const message = error?.message || 'Authentication error';

        // Map Firebase Admin error codes to friendly messages
        let clientMessage = 'Invalid or expired token';
        if (code === 'auth/id-token-expired') clientMessage = 'Token expired. Please sign in again.';
        else if (code === 'auth/invalid-id-token') clientMessage = 'Invalid ID token. Please retry sign-in.';
        else if (code === 'auth/argument-error') clientMessage = 'Bad token format. Ensure Authorization: Bearer <idToken>.';
        else if (code === 'auth/project-id-mismatch') clientMessage = 'Project mismatch. Backend and frontend Firebase projects differ.';

        // Log server-side for debugging
        // eslint-disable-next-line no-console
        console.error('Auth verification failed:', { code, message });

        return res.status(401).json({ success: false, message: clientMessage, code });
    }
};

// Handling users roles
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role (${req.user.role}) is not allowed to access this resource`
            });
        }
        next();
    };
};