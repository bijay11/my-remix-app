import fs from 'node:fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const firstNote = await prisma.note.findFirst();

if (!firstNote) {
  throw new Error('You need to have a note in the database first');
}

await prisma.note.update({
  where: { id: firstNote.id },
  data: {
    images: {
      create: [
        {
          altText: 'A beautiful bird',
          contentType: 'image/jpg',
          blob: await fs.promises.readFile(
            './tests/fixtures/images/user-notes/bird.jpg'
          ),
        },
        {
          altText: 'San Francisco bridge',
          contentType: 'image/jpg',
          blob: await fs.promises.readFile(
            './tests/fixtures/images/user-notes/bridge.jpg'
          ),
        },
      ],
    },
  },
});
