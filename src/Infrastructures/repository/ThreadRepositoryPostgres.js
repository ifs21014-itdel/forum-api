const { nanoid } = require('nanoid');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CreatedThread = require('../../Domains/threads/entities/CreatedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool) {
    super();
    this._pool = pool;
  }

   async addThread(createThread) {
    const { title, body, owner } = createThread;
    console.log(createThread);
    const id = `thread-${nanoid(16)}`;


    const query = {
      text: 'INSERT INTO threads (id, title, body, owner_id) VALUES($1, $2, $3, $4) RETURNING id, title, owner_id AS owner',
      values: [id, title, body, owner],
    };
      const result = await this._pool.query(query);
      return new CreatedThread({ ...result.rows[0] });
  }

   async verifyThreadExist(threadId) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }

  async getThreadById(threadId) {
    const query = {
      text: `
        SELECT t.id, t.title, t.body, t.created_at AS date, u.username
        FROM threads t
        LEFT JOIN users u ON t.owner_id = u.id
        WHERE t.id = $1
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
