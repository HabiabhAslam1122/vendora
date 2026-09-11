const stripe = require('../config/stripe');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

// Create a Stripe PaymentIntent based on the buyer's current cart
const createPaymentIntent = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyer: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const amountInCents = Math.round(totalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: { buyerId: req.user._id.toString() },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      totalAmount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Confirm the order after payment, update stock, and trigger auto-notifications
const confirmOrder = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment has not been completed' });
    }

    const cart = await Cart.findOne({ buyer: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty, nothing to order' });
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      seller: item.product.seller,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      buyer: req.user._id,
      items: orderItems,
      totalAmount,
      paymentStatus: 'paid',
      stripePaymentIntentId: paymentIntentId,
    });

    // 1. Send Notification to Buyer
    await Notification.create({
      recipient: req.user._id,
      title: 'Order Confirmed! 🎉',
      message: `Your order of Rs. ${totalAmount} has been placed successfully.`,
      type: 'order_status',
      link: '/orders',
    });

    // 2. Reduce stock, check low-stock alerts, & notify Sellers
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();

        // Notify seller about new sale
        await Notification.create({
          recipient: product.seller,
          title: 'New Order Received! 💰',
          message: `${item.quantity}x "${product.name}" was ordered in Order #${order._id.toString().slice(-6)}.`,
          type: 'order_status',
          link: '/seller/orders',
        });

        // Trigger low-stock alert if remaining stock < 5
        if (product.stock < 5) {
          await Notification.create({
            recipient: product.seller,
            title: '⚠️ Low Stock Warning',
            message: `"${product.name}" is running low (${product.stock} units remaining). Restock soon!`,
            type: 'low_stock',
            link: '/seller/dashboard',
          });
        }
      }
    }

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    console.error('Order Confirmation Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get all orders placed by the logged-in buyer
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all orders that include products belonging to the logged-in seller
const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'items.seller': req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update the status of an order and notify the buyer
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const sellerOwnsItem = order.items.some(
      (item) => item.seller.toString() === req.user._id.toString()
    );

    if (!sellerOwnsItem) {
      return res.status(403).json({ message: 'You do not have permission to update this order' });
    }

    order.orderStatus = status;
    await order.save();

    // Notify the Buyer about the status update
    const statusEmoji = {
      processing: '⚙️',
      shipped: '🚚',
      delivered: '📦',
      cancelled: '❌',
    };

    await Notification.create({
      recipient: order.buyer,
      title: `Order Update ${statusEmoji[status] || ''}`,
      message: `Your order #${order._id.toString().slice(-6)} status is now "${status.toUpperCase()}".`,
      type: 'order_status',
      link: '/orders',
    });

    res.json(order);
  } catch (err) {
    console.error('Order Status Update Error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createPaymentIntent,
  confirmOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
};
