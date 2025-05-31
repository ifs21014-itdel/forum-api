/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
    async addComment({
    id = 'comment-123',
    content = 'ini content comment',
    owner = 'user-123', // ← Schema comments: owner (bukan owner_id)
    thread_id = 'thread-123', // ← Schema comments: thread_id (sudah benar)
    created_at = new Date().toISOString(),
    is_deleted = false,
  }) {
    const query = {
      text: 'INSERT INTO comments (id, content, owner, thread_id, created_at, is_deleted) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, owner, thread_id, created_at, is_deleted],
    };
    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;