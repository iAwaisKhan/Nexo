import type { CreateNoteInput, Note, UpdateNoteInput } from '@nexo/contracts';
import { NoteModel } from '../models/Note.js';
import { AppError } from '../utils/AppError.js';
import { toNoteDto } from '../utils/noteDto.js';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function listNotes(userId: string, page: number, limit: number, query?: string) {
  const filter: Record<string, unknown> = { ownerId: userId, deletedAt: null };
  if (query) {
    const search = new RegExp(escapeRegex(query), 'i');
    filter.$or = [{ title: search }, { content: search }, { tags: search }];
  }
  const [records, total] = await Promise.all([
    NoteModel.find(filter)
      .sort({ isPinned: -1, updatedAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    NoteModel.countDocuments(filter),
  ]);
  return { items: records.map(toNoteDto), page, limit, total, pages: Math.ceil(total / limit) };
}

export async function createNote(userId: string, input: CreateNoteInput): Promise<Note> {
  const now = Date.now();
  const note = await NoteModel.create({
    _id: input.id,
    ownerId: userId,
    title: input.title,
    content: input.content,
    tags: input.tags,
    isPinned: input.isPinned,
    isPublic: input.isPublic,
    publishedAt: input.isPublic ? now : null,
    slug: input.slug ?? null,
    isBlog: input.isBlog,
  });
  return toNoteDto(note);
}

export async function updateNote(
  userId: string,
  id: string,
  input: UpdateNoteInput,
): Promise<Note> {
  const { expectedVersion, ...fields } = input;
  const update: Record<string, unknown> = { $set: fields, $inc: { version: 1 } };
  if (fields.isPublic === true) update.$set = { ...fields, publishedAt: Date.now() };
  if (fields.isPublic === false) update.$set = { ...fields, publishedAt: null };

  const filter: Record<string, unknown> = { _id: id, ownerId: userId, deletedAt: null };
  if (expectedVersion !== undefined) filter.version = expectedVersion;
  const note = await NoteModel.findOneAndUpdate(filter, update, { new: true, runValidators: true });
  if (note) return toNoteDto(note);

  const existing = await NoteModel.findOne({ _id: id, ownerId: userId, deletedAt: null }).select(
    '_id version',
  );
  if (existing && expectedVersion !== undefined) {
    throw new AppError(
      409,
      'VERSION_CONFLICT',
      'This note changed elsewhere. Refresh it before saving again.',
    );
  }
  throw new AppError(404, 'NOTE_NOT_FOUND', 'Note not found.');
}

export async function deleteNote(userId: string, id: string): Promise<void> {
  const note = await NoteModel.findOneAndUpdate(
    { _id: id, ownerId: userId, deletedAt: null },
    { $set: { deletedAt: new Date(), isPublic: false, publishedAt: null }, $inc: { version: 1 } },
  );
  if (!note) throw new AppError(404, 'NOTE_NOT_FOUND', 'Note not found.');
}

export async function getPublicNote(slugOrId: string): Promise<Note> {
  const note = await NoteModel.findOne({
    isPublic: true,
    deletedAt: null,
    $or: [{ _id: slugOrId }, { slug: slugOrId }],
  });
  if (!note) throw new AppError(404, 'NOTE_NOT_FOUND', 'Public note not found.');
  return toNoteDto(note);
}
