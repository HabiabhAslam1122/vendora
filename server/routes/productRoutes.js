const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, sellerOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Middleware to handle Multer upload errors gracefully
const handleUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer Upload Error:', JSON.stringify(err, null, 2), err.message || err);
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }
    next();
  });
};

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Seller-only routes
router.post('/', protect, sellerOnly, handleUpload, createProduct);
router.get('/seller/my-products', protect, sellerOnly, getMyProducts);
router.put('/:id', protect, sellerOnly, handleUpload, updateProduct);
router.delete('/:id', protect, sellerOnly, deleteProduct);

module.exports = router;
