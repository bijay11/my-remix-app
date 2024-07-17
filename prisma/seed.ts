import fs from 'node:fs';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { promiseHash } from 'remix-utils/promise';

const prisma = new PrismaClient();

// await prisma.user.deleteMany();

export function createUser() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const username = faker.internet.userName({
    firstName: firstName.toLowerCase(),
    lastName: lastName.toLowerCase(),
  });

  return {
    username,
    name: `${firstName} ${lastName}`,
    email: `${username}@example.com`,
  };
}

async function img({
  altText,
  filepath,
}: {
  altText?: string;
  filepath: string;
}) {
  return {
    altText,
    contentType: filepath.endsWith('.png') ? 'image/png' : 'image/jpeg',
    blob: await fs.promises.readFile(filepath),
  };
}

async function seed() {
  console.log('🌱 Seeding...');
  console.time(`🌱 Database has been seeded`);

  console.time('🧹 Cleaned up the database...');
  await prisma.user.deleteMany();
  console.timeEnd('🧹 Cleaned up the database...');

  const totalUsers = 5;
  console.time(`👤 Created ${totalUsers} users...`);

  const noteImages = await Promise.all([
    img({
      altText: 'a nice country house',
      filepath: './tests/fixtures/images/notes/0.png',
    }),
    img({
      altText: 'a city scape',
      filepath: './tests/fixtures/images/notes/1.png',
    }),
    img({
      altText: 'a sunrise',
      filepath: './tests/fixtures/images/notes/2.png',
    }),
    img({
      altText: 'a group of friends',
      filepath: './tests/fixtures/images/notes/3.png',
    }),
    img({
      altText: 'friends being inclusive of someone who looks lonely',
      filepath: './tests/fixtures/images/notes/4.png',
    }),
    img({
      altText: 'an illustration of a hot air balloon',
      filepath: './tests/fixtures/images/notes/5.png',
    }),
    img({
      altText:
        'an office full of laptops and other office equipment that look like it was abandond in a rush out of the building in an emergency years ago.',
      filepath: './tests/fixtures/images/notes/6.png',
    }),
    img({
      altText: 'a rusty lock',
      filepath: './tests/fixtures/images/notes/7.png',
    }),
    img({
      altText: 'something very happy in nature',
      filepath: './tests/fixtures/images/notes/8.png',
    }),
    img({
      altText: `someone at the end of a cry session who's starting to feel a little better.`,
      filepath: './tests/fixtures/images/notes/9.png',
    }),
  ]);

  const userImages = await Promise.all(
    Array.from({ length: 10 }, (_, index) =>
      img({ filepath: `./tests/fixtures/images/user/${index}.jpg` })
    )
  );

  for (let i = 0; i < totalUsers; i++) {
    await prisma.user.create({
      data: {
        ...createUser(),
        image: { create: userImages[i % 10] },
        notes: {
          create: Array.from({
            length: faker.number.int({ min: 0, max: 3 }),
          }).map(() => {
            return {
              title: faker.lorem.sentence(),
              content: faker.lorem.paragraphs(),
              images: {
                create: Array.from({
                  length: faker.number.int({ min: 0, max: 3 }),
                }).map(() => {
                  const imageNumber = faker.number.int({ min: 0, max: 9 });
                  return noteImages[imageNumber];
                }),
              },
            };
          }),
        },
      },
    });
  }

  console.timeEnd(`👤 Created ${totalUsers} users...`);

  console.time(`🐨 Created user "testUser"`);

  const testUserImages = await promiseHash({
    bird: img({ filepath: './tests/fixtures/images/user/testuser.jpg' }),
    bridge: img({
      altText: 'its a bridge',
      filepath: './tests/fixtures/images/user-notes/bridge.jpg',
    }),
    highway: img({
      altText: 'its a highway',
      filepath: './tests/fixtures/images/user-notes/highway.jpg',
    }),
    mountain: img({
      altText: 'its a mountain',
      filepath: './tests/fixtures/images/user-notes/mountain.jpg',
    }),
    scenary: img({
      altText: 'its a scenary',
      filepath: './tests/fixtures/images/user-notes/scenary.jpg',
    }),
    relax: img({
      altText: 'its a relax',
      filepath: './tests/fixtures/images/user-notes/relax.jpg',
    }),
  });

  await prisma.user.create({
    data: {
      email: 'testUser@test.com',
      username: 'testUser',
      name: 'testUser',
      image: { create: testUserImages.bird },
      notes: {
        create: [
          {
            id: 'a5c8f34b',
            title: 'Interesting Fact',
            content:
              'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.',
            images: {
              create: [testUserImages.bridge, testUserImages.highway],
            },
          },
        ],
      },
    },
  });

  console.timeEnd('Created user');

  console.timeEnd(`🌱 Database has been seeded`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
