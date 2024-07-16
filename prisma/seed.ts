import fs from 'node:fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

await prisma.user.deleteMany();

const testUser = await prisma.user.create({
  data: {
    email: 'testuser@testUser.com',
    username: 'testUser',
    name: 'testUser',
  },
});

await prisma.note.create({
  data: {
    id: 'a5c8f34b',
    title: 'Interesting Fact',
    content:
      'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.',
    ownerId: testUser.id,
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
