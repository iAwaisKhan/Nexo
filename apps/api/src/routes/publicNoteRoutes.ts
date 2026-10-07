import { Router } from 'express';
import { getPublicNote } from '../services/noteService.js';
import { AppError } from '../utils/AppError.js';

export const publicNoteRoutes = Router();
publicNoteRoutes.get('/:slugOrId', async (req, res) => {
  const slugOrId = req.params.slugOrId;
  if (typeof slugOrId !== 'string' || slugOrId.length > 160)
    throw new AppError(404, 'NOTE_NOT_FOUND', 'Public note not found.');
  res.json({ note: await getPublicNote(slugOrId) });
});
