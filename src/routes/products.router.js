import { Router } from 'express';
import { Product } from '../dao/models/product.model.js';

const router = Router();
const PORT = process.env.PORT || 8080;

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort;
    const query = req.query.query;

    // Construir el filtro
    let filter = {};
    if (query === 'available') {
      filter = { status: true };
    } else if (query === 'unavailable') {
      filter = { status: false };
    } else if (query && query.trim() !== '') {
      filter = { category: query };
    }

    // Construir las opciones de sort
    let sortOptions = {};
    if (sort === 'asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'desc') {
      sortOptions = { price: -1 };
    }

    // Realizar la paginación
    const result = await Product.paginate(filter, {
      page,
      limit,
      ...(Object.keys(sortOptions).length > 0 && { sort: sortOptions })
    });

    // Construir la respuesta
    const response = {
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? `http://localhost:${PORT}/api/products?page=${result.prevPage}&limit=${limit}&sort=${sort || ''}&query=${query || ''}`
        : null,
      nextLink: result.hasNextPage
        ? `http://localhost:${PORT}/api/products?page=${result.nextPage}&limit=${limit}&sort=${sort || ''}&query=${query || ''}`
        : null
    };

    res.json(response);
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener productos',
      error: error.message
    });
  }
});

export default router;

