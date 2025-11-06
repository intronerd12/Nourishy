const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');

// Admin analytics => /api/v1/admin/analytics
exports.getAdminAnalytics = async (req, res) => {
  try {
    const granularity = String(req.query.granularity || 'month').toLowerCase();
    const periods = Number(req.query.periods || (granularity === 'year' ? 5 : 12));

    // Totals
    const [totalUsers, totalProducts] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
    ]);

    const orders = await Order.find({}).select('totalPrice createdAt orderItems user');
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

    // Sales data with configurable granularity: week | month | year
    const now = new Date();
    let start;
    if (granularity === 'week') {
      // Approximate last N weeks
      start = new Date(now.getTime() - periods * 7 * 24 * 60 * 60 * 1000);
    } else if (granularity === 'year') {
      start = new Date(now.getFullYear() - periods + 1, 0, 1);
    } else {
      // month
      start = new Date(now.getFullYear(), now.getMonth() - (periods - 1), 1);
    }

    let salesAgg = [];
    if (granularity === 'week') {
      salesAgg = await Order.aggregate([
        { $match: { createdAt: { $gte: start } } },
        {
          $group: {
            _id: { year: { $isoWeekYear: '$createdAt' }, week: { $isoWeek: '$createdAt' } },
            revenue: { $sum: '$totalPrice' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.week': 1 } },
      ]);
    } else if (granularity === 'year') {
      salesAgg = await Order.aggregate([
        { $match: { createdAt: { $gte: start } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' } },
            revenue: { $sum: '$totalPrice' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1 } },
      ]);
    } else {
      // month
      salesAgg = await Order.aggregate([
        { $match: { createdAt: { $gte: start } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            revenue: { $sum: '$totalPrice' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesData = salesAgg.map((m) => {
      if (granularity === 'week') {
        return {
          month: `W${m._id.week} ${m._id.year}`,
          revenue: m.revenue,
          orders: m.orders,
        };
      }
      if (granularity === 'year') {
        return {
          month: `${m._id.year}`,
          revenue: m.revenue,
          orders: m.orders,
        };
      }
      return {
        month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
        revenue: m.revenue,
        orders: m.orders,
      };
    });

    // Product performance (top 5 by revenue)
    const productAgg = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          sales: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    // Join with products to get names
    const productIds = productAgg.map((p) => p._id).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } }).select('name');
    const productNameMap = new Map(products.map((p) => [String(p._id), p.name]));
    const productStats = productAgg.map((p) => ({
      name: productNameMap.get(String(p._id)) || 'Unknown Product',
      sales: p.sales,
      revenue: p.revenue,
    }));

    // User stats (new vs returning customers based on orders, and admins)
    const orderCountsByUser = new Map();
    orders.forEach((o) => {
      const uid = String(o.user || '');
      if (!uid) return;
      orderCountsByUser.set(uid, (orderCountsByUser.get(uid) || 0) + 1);
    });
    const returningUsers = Array.from(orderCountsByUser.values()).filter((c) => c > 1).length;
    const newUsers = Array.from(orderCountsByUser.values()).filter((c) => c === 1).length;
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const userStats = [
      { name: 'New Customers', value: newUsers, color: '#8884d8' },
      { name: 'Returning Customers', value: returningUsers, color: '#82ca9d' },
      { name: 'Admins', value: adminUsers, color: '#ffc658' },
    ];

    res.status(200).json({
      success: true,
      totals: { totalRevenue, totalOrders, totalProducts, totalUsers },
      salesData,
      productStats,
      userStats,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};