import { Router } from 'express';
import { Cart } from '../dao/models/carts.model.js';
import { Product } from '../dao/models/product.model.js';

const router = Router();

// 1) POST /api/carts/ - Crear carrito nuevo vacío
router.post('/', async (req, res) => {
  try {
    const newCart = await Cart.create({ products: [] });
    return res.status(200).json({ status: 'success', payload: newCart });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Error al crear carrito', error: error.message });
  }
});

// 2) GET /api/carts/:cid - Obtener carrito por id con populate
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid)
      .populate('products.product')
      .lean();

    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    return res.status(200).json({ status: 'success', payload: cart });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Error al obtener carrito', error: error.message });
  }
});

// 3) POST /api/carts/:cid/products/:pid - Agregar producto al carrito
router.post('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;

    // Verificar que el producto exista
    const product = await Product.findById(pid);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

    // Buscar el carrito
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    // Verificar si el producto ya está en el carrito
    const existingProduct = cart.products.find(
      item => item.product.toString() === pid
    );

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cid)
      .populate('products.product')
      .lean();

    return res.status(200).json({ status: 'success', payload: updatedCart });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Error al agregar producto al carrito', error: error.message });
  }
});

// 4) DELETE /api/carts/:cid/products/:pid - Eliminar producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    cart.products = cart.products.filter(
      item => item.product.toString() !== pid
    );

    await cart.save();

    const updatedCart = await Cart.findById(cid)
      .populate('products.product')
      .lean();

    return res.status(200).json({ status: 'success', payload: updatedCart });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Error al eliminar producto del carrito', error: error.message });
  }
});

// 5) PUT /api/carts/:cid - Actualizar todos los productos del carrito
router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    // Validar que products exista y sea un array
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ status: 'error', message: 'products debe ser un array' });
    }

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    cart.products = products;
    await cart.save();

    const updatedCart = await Cart.findById(cid)
      .populate('products.product')
      .lean();

    return res.status(200).json({ status: 'success', payload: updatedCart });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Error al actualizar carrito', error: error.message });
  }
});

// 6) PUT /api/carts/:cid/products/:pid - Actualizar cantidad de un producto
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    // Validar que quantity exista y sea un número mayor a 0
    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ status: 'error', message: 'quantity debe ser un número mayor a 0' });
    }

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    const productInCart = cart.products.find(
      item => item.product.toString() === pid
    );

    if (!productInCart) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
    }

    productInCart.quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findById(cid)
      .populate('products.product')
      .lean();

    return res.status(200).json({ status: 'success', payload: updatedCart });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Error al actualizar cantidad del producto', error: error.message });
  }
});

// 7) DELETE /api/carts/:cid - Vaciar carrito
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    cart.products = [];
    await cart.save();

    const updatedCart = await Cart.findById(cid)
      .populate('products.product')
      .lean();

    return res.status(200).json({ status: 'success', payload: updatedCart });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Error al vaciar carrito', error: error.message });
  }
});

export default router;

