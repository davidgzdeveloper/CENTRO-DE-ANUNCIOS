import { Router } from 'express';
import { 
  getAnuncios, 
  createAnuncio, 
  updateAnuncio, 
  deleteAnuncio, 
  addComentario 
} from '../controllers/anunciosController';

const router = Router();

// Rutas para anuncios
router.get('/', getAnuncios);
router.post('/', createAnuncio);
router.put('/:id', updateAnuncio);
router.delete('/:id', deleteAnuncio);
router.post('/:id/comentarios', addComentario);

export default router;