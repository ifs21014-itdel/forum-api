  // src/Infrastructures/repository/CommentRepositoryPostgres.js
  const { nanoid } = require('nanoid');
  const NotFoundError = require('../../Commons/exceptions/NotFoundError');
  const InvariantError = require('../../Commons/exceptions/InvariantError');
  const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
  const CreatedComment = require('../../Domains/comments/entities/CreatedComment');
  const CommentRepository = require('../../Domains/comments/CommentRepository');
  
  class CommentRepositoryPostgres extends CommentRepository {
    constructor(pool) {
      super();
      this._pool = pool;
    }
  
   async addComment(createComment) {
      const { content, owner, threadId } = createComment;
      
      const id = `comment-${nanoid(16)}`;
      const createdAt = new Date().toISOString();

      const query = {
        text: `INSERT INTO comments (id, content, owner, thread_id, created_at, is_deleted)
              VALUES ($1, $2, $3, $4, $5, false)
              RETURNING id, content, owner AS owner`,
        values: [id, content, owner, threadId, createdAt],
      };


        const result = await this._pool.query(query);
        return new CreatedComment(result.rows[0]);

      }
    

  
    async getCommentDetailIfOwner(commentId, ownerId) {
      const query = {
        text: `SELECT id, content, owner AS owner FROM comments WHERE id = $1`,
        values: [commentId],
      };
  
      const result = await this._pool.query(query);
  
      if (!result.rows.length) {
        throw new NotFoundError('Komentar tidak ditemukan');
      }
  
      const comment = result.rows[0];
      if (comment.owner !== ownerId) {
        throw new AuthorizationError('Anda bukan pemilik komentar ini');
      }
  
      return comment;
    }
  
    async deleteComment(deleteComment) {
      const { commentId, owner } = deleteComment;
      const query = {
        text: `UPDATE comments SET is_deleted = true WHERE id = $1`,
        values: [commentId],
      };
  
      await this._pool.query(query);
    }
  
    async getCommentsByThreadId(threadId) {
      const query = {
        text: `
          SELECT c.id, u.username, c.created_at AS date, c.content, c.is_deleted
          FROM comments c
          LEFT JOIN users u ON c.owner = u.id
          WHERE c.thread_id = $1
          ORDER BY c.created_at ASC
        `,
        values: [threadId],
      };
  
      const result = await this._pool.query(query);
      return result.rows;
    }
  }
  
  module.exports = CommentRepositoryPostgres;