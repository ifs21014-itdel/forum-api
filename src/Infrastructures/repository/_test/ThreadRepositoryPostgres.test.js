const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread', () => {
    it('should persist and return created thread correctly', async () => {
      const userId = 'user-123';
      const username = 'dicoding';
      const password = 'secret';

      await UsersTableTestHelper.addUser({
        id: userId,
        username,
        password,
        fullname: 'Dicoding Indonesia',
      });

      const createThread = new CreateThread({
        title: 'Thread Title',
        body: 'Thread Body',
        owner: userId,
      });
      const repo = new ThreadRepositoryPostgres(pool);

      const created = await repo.addThread(createThread);

      const thread = await ThreadsTableTestHelper.findThreadById(created.id);
      expect(thread).toHaveLength(1);

      expect(created).toBeInstanceOf(CreatedThread);
      expect(created.id).toBeDefined();
      expect(created.id).toMatch(/^thread-/);
      expect(created.title).toEqual('Thread Title');
      expect(created.owner).toEqual(userId);
    });

  });

  describe('verifyThreadExist', () => {
    it('should throw NotFoundError if thread not exists', async () => {
      const userId = 'user-123';
      const existingThreadId = 'thread-123';
      const invalidThreadId = 'thread-not-exist';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: existingThreadId, owner: userId });

      const repo = new ThreadRepositoryPostgres(pool);

      await expect(repo.verifyThreadExist(invalidThreadId))
        .rejects.toThrow(NotFoundError);
      await expect(repo.verifyThreadExist(invalidThreadId))
        .rejects.toThrow('thread tidak ditemukan');
    });
  });

  describe('getThreadById', () => {
    it('should return thread detail with correct structure', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      const username = 'user1';
      const title = 'dicoding';
      const body = 'ini body thread';

      await UsersTableTestHelper.addUser({ id: userId, username });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title,
        body,
        owner_id: userId,
      });

      const repo = new ThreadRepositoryPostgres(pool);
      const result = await repo.getThreadById(threadId);

      expect(result).toEqual({
        id: threadId,
        title,
        body,
        username,
        date: expect.any(Date),
      });

      expect(typeof result.id).toBe('string');
      expect(typeof result.title).toBe('string');
      expect(typeof result.body).toBe('string');
      expect(typeof result.username).toBe('string');
      expect(result.date).toBeInstanceOf(Date);
    });

    it('should throw NotFoundError when thread does not exist', async () => {
      const repo = new ThreadRepositoryPostgres(pool);
      const nonExistentId = 'thread-not-found';

      await expect(repo.getThreadById(nonExistentId))
        .rejects.toThrow(NotFoundError);
      await expect(repo.getThreadById(nonExistentId))
        .rejects.toThrow('Thread tidak ditemukan');
    });

    it('should not throw NotFoundError if thread exists', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const repo = new ThreadRepositoryPostgres(pool);

      await expect(repo.verifyThreadExist(threadId))
        .resolves.not.toThrow(NotFoundError);
    });

  });
});
