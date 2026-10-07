import type { NoteRecord } from '../models/Note.js';

export function toNoteDto(note: NoteRecord) {
  return {
    id: note._id,
    title: note.title,
    content: note.content,
    tags: note.tags,
    isPinned: note.isPinned,
    lastModified: note.updatedAt.getTime(),
    version: note.version,
    timeSpent: note.timeSpent,
    isPublic: note.isPublic,
    ...(note.publishedAt ? { publishedAt: note.publishedAt } : {}),
    ...(note.slug ? { slug: note.slug } : {}),
    isBlog: note.isBlog,
  };
}
