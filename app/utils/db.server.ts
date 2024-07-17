/**
 * Don't worry too much about this file. It's just an in-memory "database"
 * for the purposes of our workshop. The data modeling workshop will cover
 * the proper database.
 */
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import chalk from 'chalk';
import { factory, manyOf, nullable, oneOf, primaryKey } from '@mswjs/data';
import { singleton } from './singleton.server';

export const prisma = singleton('prisma', () => {
  const logThreshold = 0;

  const client = new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'info', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  });

  client.$on('query', async (e) => {
    if (e.duration < logThreshold) return;
    const color =
      e.duration < logThreshold * 1.1
        ? 'green'
        : e.duration < logThreshold * 1.2
        ? 'blue'
        : e.duration < logThreshold * 1.3
        ? 'yellow'
        : e.duration < logThreshold * 1.4
        ? 'redBright'
        : 'red';
    const dur = chalk[color](`${e.duration}ms`);
    console.info(`prisma:query - ${dur} - ${e.query}`);
  });

  // this will make the connection faster
  client.$connect();

  return client;
});

console.log(await prisma.user.findMany());

const getId = () => crypto.randomBytes(16).toString('hex').slice(0, 8);

export const db = singleton('db', () => {
  const db = factory({
    user: {
      id: primaryKey(getId),
      email: String,
      username: String,
      name: nullable(String),

      createdAt: () => new Date(),

      notes: manyOf('note'),
    },
    note: {
      id: primaryKey(getId),
      title: String,
      content: String,

      createdAt: () => new Date(),

      owner: oneOf('user'),
      images: manyOf('image'),
    },
    image: {
      id: primaryKey(getId),
      filepath: String,
      contentType: String,
      altText: nullable(String),
    },
  });

  const user = db.user.create({
    id: '9d6eba59daa2fc2078cf8205cd451041',
    email: 'johndoe@test.dev',
    username: 'johndoe',
    name: 'John',
  });

  const userNotes = [
    {
      id: 'd27a197e',
      title: 'Interesting Fact',
      content:
        'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.',
    },
    {
      id: 'e3f4b5c2',
      title: 'Curious Animal',
      content: "A group of flamingos is called a 'flamboyance'.",
    },
    {
      id: 'f1a2b3c4',
      title: 'Space Trivia',
      content:
        "There are more stars in the universe than grains of sand on all the Earth's beaches combined.",
    },
    {
      id: 'a4b5c6d7',
      title: 'Historical Tidbit',
      content:
        'The shortest war in history was between Britain and Zanzibar on August 27, 1896. Zanzibar surrendered after 38 minutes.',
    },
    {
      id: 'b5c6d7e8',
      title: 'Human Body',
      content: 'The human body contains enough fat to make seven bars of soap.',
    },
    {
      id: 'c6d7e8f9',
      title: 'Ocean Fact',
      content:
        "More people have been to the moon than to the Mariana Trench, the deepest part of the Earth's oceans.",
    },
    {
      id: 'd7e8f9a1',
      title: 'World Records',
      content: 'The longest time between two twins being born is 87 days.',
    },
    {
      id: 'e8f9a1b2',
      title: 'Food Fact',
      content: 'Bananas are berries, but strawberries are not.',
    },
    {
      id: 'f9a1b2c3',
      title: 'Geographical Wonder',
      content:
        'Mount Everest is the highest point on Earth, but Mauna Kea in Hawaii is the tallest mountain when measured from its base underwater.',
    },
    {
      id: 'a1b2c3d4',
      title: 'Animal Behavior',
      content: 'Octopuses have three hearts and blue blood.',
    },
    {
      id: 'b2c3d4e5',
      title: "Nature's Phenomenon",
      content: 'A day on Venus is longer than a year on Venus.',
    },
    {
      id: 'c3d4e5f6',
      title: 'Technological Feat',
      content:
        'The first 1GB hard disk, announced in 1980, weighed over 500 pounds and cost $40,000.',
    },
  ];

  for (const note of userNotes) {
    db.note.create({
      ...note,
      owner: user,
    });
  }

  return db;
});

export async function updateNote({
  id,
  title,
  content,
  images,
}: {
  id: string;
  title: string;
  content: string;
  images?: Array<{
    id?: string;
    file?: File;
    altText?: string;
  } | null>;
}) {
  const noteImagePromises =
    images?.map(async (image) => {
      if (!image) return null;

      if (image.id) {
        const hasReplacement = (image?.file?.size || 0) > 0;
        const filepath =
          image.file && hasReplacement
            ? await writeImage(image.file)
            : undefined;
        // update the ID so caching is invalidated
        const id = image.file && hasReplacement ? getId() : image.id;

        return db.image.update({
          where: { id: { equals: image.id } },
          data: {
            id,
            filepath,
            altText: image.altText,
          },
        });
      } else if (image.file) {
        if (image.file.size < 1) return null;
        const filepath = await writeImage(image.file);
        return db.image.create({
          altText: image.altText,
          filepath,
          contentType: image.file.type,
        });
      } else {
        return null;
      }
    }) ?? [];

  const noteImages = await Promise.all(noteImagePromises);
  db.note.update({
    where: { id: { equals: id } },
    data: {
      title,
      content,
      images: noteImages.filter(Boolean),
    },
  });
}

async function writeImage(image: File) {
  const tmpDir = path.join(os.tmpdir(), 'test-fs', 'images');
  await fs.mkdir(tmpDir, { recursive: true });

  const timestamp = Date.now();
  const filepath = path.join(tmpDir, `${timestamp}.${image.name}`);
  await fs.writeFile(filepath, Buffer.from(await image.arrayBuffer()));
  return filepath;
}
