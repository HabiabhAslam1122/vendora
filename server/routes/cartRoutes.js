const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// Accept both POST / and POST /add
router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.post('/add', protect, addToCart);
router.put('/', protect, updateCartItem);
router.put('/update', protect, updateCartItem);
router.delete('/remove/:productId', protect, removeFromCart);
router.delete('/:productId', protect, removeFromCart);
router.delete('/clear', protect, clearCart);

module.exports = router;
