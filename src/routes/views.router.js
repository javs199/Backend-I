import { Router } from 'express';
import { Cart } from '../dao/models/carts.model.js';
import { Product } from '../dao/models/product.model.js';

const router = Router();
const PORT = process.env.PORT || 8080;

router.get('/', (req, res) => {
  res.redirect('/products');
});

router.get('/products', async (req, res) => {
  try {
    const { page, limit, sort, query } = req.query;
    
    // Construir URL con query params
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (sort) queryParams.append('sort', sort);
    if (query) queryParams.append('query', query);
    
    const apiUrl = `http://localhost:${PORT}/api/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    // Hacer petición al endpoint interno
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.status === 'error') {
      return res.status(500).render('products', {
        title: 'Lista de productos',
        error: data.message,
        products: [],
        page: 1,
        totalPages: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevLink: null,
        nextLink: null
      });
    }
    
    // Convertir los links absolutos a relativos para la navegación
    // Reemplazar /api/products por /products para las vistas
    const prevLink = data.prevLink ? data.prevLink.replace(`http://localhost:${PORT}`, '').replace('/api/products', '/products') : null;
    const nextLink = data.nextLink ? data.nextLink.replace(`http://localhost:${PORT}`, '').replace('/api/products', '/products') : null;
    
    res.render('products', {
      title: 'Lista de productos',
      products: data.payload,
      page: data.page,
      totalPages: data.totalPages,
      hasPrevPage: data.hasPrevPage,
      hasNextPage: data.hasNextPage,
      prevLink,
      nextLink
    });
  } catch (error) {
    res.status(500).render('products', {
      title: 'Lista de productos',
      error: 'Error al cargar productos',
      products: [],
      page: 1,
      totalPages: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevLink: null,
      nextLink: null
    });
  }
});

router.get('/products/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await Product.findById(pid).lean();

    if (!product) {
      return res.status(404).render('productDetail', {
        title: 'Producto no encontrado',
        error: 'El producto solicitado no existe.'
      });
    }

    const DEFAULT_CART_ID = '693357b366a81acd83a39d82';

    return res.render('productDetail', {
      title: product.title,
      product,
      cartId: DEFAULT_CART_ID
    });
  } catch (error) {
    console.error('Error al obtener producto para la vista:', error);
    return res.status(500).render('productDetail', {
      title: 'Error',
      error: 'Hubo un problema al cargar el producto.'
    });
  }
});

router.get('/carts/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid)
      .populate('products.product')
      .lean();

    if (!cart) {
      return res.status(404).render('cart', {
        title: 'Carrito no encontrado',
        error: 'El carrito solicitado no existe.'
      });
    }

    return res.render('cart', {
      title: 'Carrito',
      cart
    });
  } catch (error) {
    console.error('Error al obtener carrito para la vista:', error);
    return res.status(500).render('cart', {
      title: 'Error',
      error: 'Hubo un problema al cargar el carrito.'
    });
  }
});

export default router;

