const express = require('express');
const router = express.Router();

const { getAdminAnalytics } = require('../controllers/analyticsController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// Admin analytics
router.route('/admin/analytics').get(
  isAuthenticatedUser,
  authorizeRoles('admin'),
  getAdminAnalytics
);

module.exports = router;