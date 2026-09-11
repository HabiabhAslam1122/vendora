const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, sellerOnly } = require('../middleware/authMiddleware');

router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/seller-orders', protect, sellerOnly, getSellerOrders);
router.put('/:id/status', protect, sellerOnly, updateOrderStatus);

module.exports = router;