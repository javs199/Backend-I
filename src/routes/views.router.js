import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.redirect('/products');
});

router.get('/products', (req, res) => {
  res.render('products', { title: 'Lista de productos' });
});

export default router;

