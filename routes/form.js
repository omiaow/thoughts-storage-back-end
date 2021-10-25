import express from "express";
import auth from "../middleware/auth.js"
import { create, getAll, getOne, submit, responses, remove } from "../controllers/form.js";

const router = express.Router();

router.post('/create', auth, create);
router.get('/getAll', auth, getAll);
router.get('/responses/:id', auth, responses);
router.delete('/delete/:id', auth, remove);
router.get('/:id', getOne);
router.post('/submit', submit);

export default router;
