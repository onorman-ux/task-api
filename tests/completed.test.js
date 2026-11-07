import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { once } from 'node:events';
import express from 'express';
import prisma from '../src/config/db.js';
import taskRoutes from '../src/routes/taskRoutes.js';

const database = new URL(process.env.DATABASE_URL);
assert.ok(['127.0.0.1', 'localhost'].includes(database.hostname));
assert.ok(database.pathname.endsWith('_test'), 'Use a dedicated local _test database');

let server;
let baseUrl;
let fixtures = [];

before(async () => {
  fixtures = await Promise.all([
    prisma.task.create({ data: { title: 'Filter fixture done', completed: true } }),
    prisma.task.create({ data: { title: 'Filter fixture pending', completed: false } }),
    prisma.task.create({ data: { title: 'Filter fixture legacy', completed: null } }),
  ]);
  const app = express();
  app.use(express.json());
  app.use('/tasks', taskRoutes);
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (fixtures.length) {
    await prisma.task.deleteMany({ where: { id: { in: fixtures.map((task) => task.id) } } });
  }
  await prisma.$disconnect();
});

for (const [query, indexes] of [
  ['', [0, 1, 2]],
  ['?completed=true', [0]],
  ['?completed=false', [1]],
]) {
  test(`GET /tasks${query} returns the correct tasks`, async () => {
    const response = await fetch(`${baseUrl}/tasks${query}`);
    assert.equal(response.status, 200);
    const tasks = await response.json();
    const fixtureIds = new Set(fixtures.map((task) => task.id));
    assert.deepEqual(
      tasks.filter((task) => fixtureIds.has(task.id)).map((task) => task.id).sort((a, b) => a - b),
      indexes.map((index) => fixtures[index].id).sort((a, b) => a - b),
    );
    if (query) assert.ok(tasks.every((task) => task.completed === (query === '?completed=true')));
  });
}

for (const query of [
  'completed=invalid', 'completed=', 'completed=TRUE', 'completed=False',
  'completed=1', 'completed=0', 'completed=null', 'completed=%20true%20',
  'completed=true&completed=false', 'completed=true&completed=true',
]) {
  test(`GET /tasks?${query} returns 400`, async () => {
    const response = await fetch(`${baseUrl}/tasks?${query}`);
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error, 'Validation failed');
    assert.ok(body.details.length > 0);
  });
}

test('an unrelated query parameter preserves the unfiltered result', async () => {
  const response = await fetch(`${baseUrl}/tasks?unrelated=value`);
  assert.equal(response.status, 200);
  const tasks = await response.json();
  for (const fixture of fixtures) assert.ok(tasks.some((task) => task.id === fixture.id));
});

test('POST /tasks still rejects an invalid title', async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'x', completed: false }),
  });
  assert.equal(response.status, 400);
});
