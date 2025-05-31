/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadsTableTestHelper = {
  async addThread({
    id = 'thread-123',
    title = 'dicoding',
    body = 'ini body thread',
    owner_id = 'user-123', // ← perbaikan: ubah dari 'owner' ke 'owner_id'
    created_at = new Date().toISOString(),
  }) {
    // HAPUS baris ini karena user sudah dibuat di test
    // await UsersTableTestHelper.addUser({ id: owner_id });

    const query = {
      text: 'INSERT INTO threads (id, title, body, owner_id, created_at) VALUES($1, $2, $3, $4, $5)',
      values: [id, title, body, owner_id, created_at], // ← gunakan owner_id
    };

    await pool.query(query);
  },

  async findThreadById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
};

module.exports = ThreadsTableTestHelper;