const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const CreateComment = require('../../../Domains/comments/entities/CreateComment');
const CreatedComment = require('../../../Domains/comments/entities/CreatedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist create comment and return created comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ 
        id: 'thread-123',
        owner_id: 'user-123'
      });
      
      const createComment = new CreateComment({
        content: 'sebuah komentar',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action
      const createdComment = await commentRepositoryPostgres.addComment(createComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById(createdComment.id);
      expect(comments).toHaveLength(1);
    });

    it('should return created comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ 
        id: 'thread-123',
        owner_id: 'user-123'
      });
      
      const createComment = new CreateComment({
        content: 'sebuah komentar',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action
      const createdComment = await commentRepositoryPostgres.addComment(createComment);

      // Assert
      expect(createdComment).toStrictEqual(new CreatedComment({
        id: createdComment.id,
        content: 'sebuah komentar',
        owner: 'user-123',
      }));
      expect(createdComment.id).toMatch(/^comment-/);
    });
  });

  describe('getCommentDetailIfOwner function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action & Assert
      await expect(commentRepositoryPostgres.getCommentDetailIfOwner('comment-123', 'user-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when user is not owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await UsersTableTestHelper.addUser({ 
        id: 'user-456', 
        username: 'johndoe' 
      });
      await ThreadsTableTestHelper.addThread({ 
        id: 'thread-123',
        owner_id: 'user-123'
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'sebuah komentar',
        owner: 'user-123',
        thread_id: 'thread-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action & Assert
      await expect(commentRepositoryPostgres.getCommentDetailIfOwner('comment-123', 'user-456'))
        .rejects
        .toThrowError(AuthorizationError);
    });

    it('should return comment detail correctly when user is owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ 
        id: 'thread-123',
        owner_id: 'user-123'
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'sebuah komentar',
        owner: 'user-123',
        thread_id: 'thread-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action
      const comment = await commentRepositoryPostgres.getCommentDetailIfOwner('comment-123', 'user-123');

      // Assert
      expect(comment.id).toEqual('comment-123');
      expect(comment.content).toEqual('sebuah komentar');
      expect(comment.owner).toEqual('user-123');
    });
  });

  describe('deleteComment function', () => {
    it('should soft delete comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ 
        id: 'thread-123',
        owner_id: 'user-123'
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'sebuah komentar',
        owner: 'user-123',
        thread_id: 'thread-123',
        is_deleted: false,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action
      await commentRepositoryPostgres.deleteComment({
        commentId: 'comment-123',
        owner: 'user-123'
      });

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment).toHaveLength(1);
      expect(comment[0].is_deleted).toEqual(true);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ 
        id: 'thread-123',
        owner_id: 'user-123'
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'sebuah komentar',
        owner: 'user-123',
        thread_id: 'thread-123',
        created_at: '2021-08-08T07:19:09.775Z',
        is_deleted: false,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual('comment-123');
      expect(comments[0].username).toEqual('dicoding');
      expect(comments[0].content).toEqual('sebuah komentar');
      expect(comments[0].is_deleted).toEqual(false);
    });

    it('should return empty array when no comments found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(0);
      expect(Array.isArray(comments)).toBe(true);
    });

    it('should return comments with deleted status correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ 
        id: 'thread-123',
        owner_id: 'user-123'
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'sebuah komentar',
        owner: 'user-123',
        thread_id: 'thread-123',
        created_at: '2021-08-08T07:19:09.775Z',
        is_deleted: true,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual('comment-123');
      expect(comments[0].username).toEqual('dicoding');
      expect(comments[0].content).toEqual('sebuah komentar');
      expect(comments[0].is_deleted).toEqual(true);
    });

    it('should return comments in correct order', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await UsersTableTestHelper.addUser({ 
        id: 'user-456', 
        username: 'johndoe' 
      });
      await ThreadsTableTestHelper.addThread({ 
        id: 'thread-123',
        owner_id: 'user-123'
      });
      
      // Add comments with different timestamps
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'komentar pertama',
        owner: 'user-123',
        thread_id: 'thread-123',
        created_at: '2021-08-08T07:19:09.775Z',
        is_deleted: false,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        content: 'komentar kedua',
        owner: 'user-456',
        thread_id: 'thread-123',
        created_at: '2021-08-08T08:19:09.775Z',
        is_deleted: false,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(2);
      expect(comments[0].id).toEqual('comment-123');
      expect(comments[0].username).toEqual('dicoding');
      expect(comments[0].content).toEqual('komentar pertama');
      expect(comments[1].id).toEqual('comment-456');
      expect(comments[1].username).toEqual('johndoe');
      expect(comments[1].content).toEqual('komentar kedua');
    });
  });
});