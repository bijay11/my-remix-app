import fs from 'node:fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

await prisma.user.deleteMany();

await prisma.user.create({
  data: {
    email: 'testuser@testUser.com',
    username: 'testUser',
    name: 'testUser',
    notes: {
      create: [
        {
          id: 'a5c8f34b',
          title: 'Interesting Fact',
          content:
            'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.',
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
      ],
    },
  },
});
