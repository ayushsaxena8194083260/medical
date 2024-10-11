const Cart = require('../models/cart');
const Medicine = require('../models/medicine');

// Add item to cart
exports.addToCart = async (req, res) => {
  const { medicineId, quantity } = req.body;
  const userId = req.user.id;

  try {
    // Find the user's cart
    let cart = await Cart.findOne({ user: userId });

    // If no cart exists for the user, create a new one
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if the medicine exists
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Find if the item is already in the cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === medicineId);

    if (itemIndex > -1) {
      // If item exists in cart, update its quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Otherwise, add the new item to the cart
      cart.items.push({ product: medicineId, quantity });
    }

    // Recalculate the total by fetching the price for each medicine in the cart
    cart.totalAmount = 0;
    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      const itemMedicine = await Medicine.findById(item.product);  // Fetch price of each medicine
      if (itemMedicine) {
        cart.totalAmount += item.quantity * itemMedicine.price;
      }
    }

    // Save the updated cart
    await cart.save();

    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


// Get cart items
exports.getCart = async (req, res) => {
  const userId = req.user.id;
  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      return res.status(200).json({ msg: 'Cart is empty' });
    }

    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Remove item from cart
// Remove item from cart
exports.removeFromCart = async (req, res) => {
  const { medicalId } = req.params;
  const userId = req.user.id;

  try {
    // Find the cart for the user and populate the product details
    let cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    // Find the item index in the cart
    const itemIndex = cart.items.findIndex(item => item.product._id.toString() === medicalId);

    if (itemIndex > -1) {
      // Remove the item from the cart
      cart.items.splice(itemIndex, 1);

      // Recalculate the total amount
      cart.totalAmount = cart.items.reduce((acc, item) => acc + item.quantity * item.product.price, 0);

      // Save the updated cart
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ msg: 'Item not found in cart' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.updateCartQuantity = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;
  
    if (quantity < 1) {
      req.params.productId = productId;
      return exports.removeFromCart(req, res);
    }
  
    try {
      let cart = await Cart.findOne({ user: userId });
  
      if (!cart) {
        return res.status(404).json({ msg: 'Cart not found' });
      }
  
      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
  
      if (itemIndex === -1) {
        return res.status(404).json({ msg: 'Item not found in cart' });
      }
  
      cart.items[itemIndex].quantity = quantity; 
  
      cart.totalAmount = await calculateTotalAmount(cart.items);
  
      await cart.save();
      res.json(cart);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  async function calculateTotalAmount(items) {
    let total = 0;
    for (const item of items) {
      const product = await Medicine.findById(item.product);
      total += item.quantity * product.price;
    }
    return total;
  }