import express from 'express';
import { generateImage } from '../controllers/imageController.js';
import userAuth from '../middlewares/auth.js'; // uses updated auth

const router = express.Router();

router.post('/generate-image', userAuth, generateImage); // ✅ Protected with token

export default router;
