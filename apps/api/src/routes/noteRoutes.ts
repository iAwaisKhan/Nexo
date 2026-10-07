import { Router } from 'express';
import { createNoteInputSchema, noteListQuerySchema, updateNoteInputSchema } from '@nexo/contracts';
import { authenticate } from '../middleware/authenticate.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { createNote, deleteNote, listNotes, updateNote } from '../services/noteService.js';
import { AppError } from '../utils/AppError.js';

export const noteRoutes = Router();
noteRoutes.use(authenticate);

noteRoutes.get('/', validateQuery(noteListQuerySchema), async (req, res) => {
  const query = req.validatedQuery as ReturnType<typeof noteListQuerySchema.parse>;
  res.json(await listNotes(req.auth!.userId, query.page, query.limit, query.q));
});

noteRoutes.post('/', validateBody(createNoteInputSchema), async (req, res) => {
  const note = await createNote(req.auth!.userId, req.body);
  res.status(201).json({ note });
});

noteRoutes.patch('/:noteId', validateBody(updateNoteInputSchema), async (req, res) => {
  const noteId = req.params.noteId;
  if (typeof noteId !== 'string' || noteId.length > 128)
    throw new AppError(400, 'VALIDATION_ERROR', 'Note identifier is invalid.');
  const note = await updateNote(req.auth!.userId, noteId, req.body);
  res.json({ note });
});

noteRoutes.delete('/:noteId', async (req, res) => {
  const noteId = req.params.noteId;
  if (typeof noteId !== 'string' || noteId.length > 128)
    throw new AppError(400, 'VALIDATION_ERROR', 'Note identifier is invalid.');
  await deleteNote(req.auth!.userId, noteId);
  res.status(204).end();
});
