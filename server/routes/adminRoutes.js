const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  getAllProducts,
  deleteProduct,
  getStats,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/stats', protect, adminOnly, getStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.get('/products', protect, adminOnly, getAllProducts);
router.delete('/products/:id', protect, adminOnly, deleteProduct);

module.exports = router;