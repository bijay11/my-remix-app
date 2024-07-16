import fs from 'node:fs';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

await prisma.user.deleteMany();

await prisma.user.create({
  data: {
    email: faker.internet.email(),
    username: faker.internet.userName(),
    name: faker.person.fullName(),
    notes: {
      create: [
        {
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(),
        },
      ],
    },
  },
});

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
