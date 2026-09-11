const Product = require('../models/Product');

// Create a new product (seller only)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    let imagePath = '';
    if (req.file) {
      imagePath = req.file.path.startsWith('http')
        ? req.file.path
        : `https://vendora-nilz.onrender.com/uploads/${req.file.filename}`;
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      category,
      image: imagePath,
      seller: req.user._id,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('Product Creation Error:', err);
    res.status(500).json({ message: err.message || 'Failed to create product' });
  }
};

// Escape regex special characters to prevent regex query crashes
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// Get all products with search, category, and price filters
const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      query.name = { $regex: escapeRegex(search.trim()), $options: 'i' };
    }

    if (category && category.trim() !== '') {
      query.category = { $regex: escapeRegex(category.trim()), $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice && !isNaN(Number(minPrice))) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        query.price.$lte = Number(maxPrice);
      }
      // Clean up if neither min nor max were valid numbers
      if (Object.keys(query.price).length === 0) {
        delete query.price;
      }
    }

    const products = await Product.find(query).populate('seller', 'name shopName').sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Get Products Query Error:', err);
    res.status(500).json({ message: err.message || 'Error fetching products' });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name shopName');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all products belonging to logged-in seller
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product (seller owner only)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own products' });
    }

    const { name, description, price, stock, category } = req.body;

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ? Number(price) : product.price;
    product.stock = stock ? Number(stock) : product.stock;
    product.category = category ?? product.category;

    if (req.file) {
      product.image = req.file.path.startsWith('http')
        ? req.file.path
        : `https://vendora-nilz.onrender.com/uploads/${req.file.filename}`;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    console.error('Product Update Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Delete product (seller owner only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  deleteProduct,
};
