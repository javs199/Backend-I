import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.send('Carts API base');
});

export default router;

