const { ThreadWithComments, CommentDetail } = require('../../../Domains/comments/entities/ThreadWithComments');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetCommentByIdUseCase = require('../GetCommentByIdUseCase');

describe('GetCommentByIdUseCase', () => {
  it('should orchestrate the get thread with comments action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    // Data yang akan dikembalikan oleh mock repository (berbeda dari expected value)
    const mockThreadDataFromRepository = {
      id: 'thread-123',
      title: 'judul thread',
      body: 'isi body',
      date: '2023-08-25T12:00:00.000Z',
      username: 'user123',
    };

    const mockCommentsDataFromRepository = [
      {
        id: 'comment-123',
        username: 'user123',
        date: '2023-08-25T12:30:00.000Z',
        content: 'isi komentar',
        is_deleted: false,
      },
    ];

    // Expected value yang terpisah dari mock data
    const expectedComments = [
      new CommentDetail({
        id: 'comment-123',
        username: 'user123',
        date: '2023-08-25T12:30:00.000Z',
        content: 'isi komentar',
        isDeleted: false,
      })
    ];

    const expectedThreadWithComments = new ThreadWithComments({
      id: 'thread-123',
      title: 'judul thread',
      body: 'isi body',
      date: '2023-08-25T12:00:00.000Z',
      username: 'user123',
      comments: expectedComments,
    });

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mock menggunakan data yang terpisah dari expected value
    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(mockThreadDataFromRepository);
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue(mockCommentsDataFromRepository);

    const getCommentByIdUseCase = new GetCommentByIdUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act
    const result = await getCommentByIdUseCase.execute(threadId);

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith(threadId);
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
    
    // Assert jumlah pemanggilan method
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledTimes(1);
    
    expect(result).toStrictEqual(expectedThreadWithComments);
  });

  it('should throw error when thread does not exist', async () => {
    // Arrange
    const threadId = 'thread-not-found';

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExist = jest.fn()
      .mockRejectedValue(new Error('THREAD_NOT_FOUND'));
    mockThreadRepository.getThreadById = jest.fn();
    mockCommentRepository.getCommentsByThreadId = jest.fn();

    const getCommentByIdUseCase = new GetCommentByIdUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act & Assert
    await expect(getCommentByIdUseCase.execute(threadId))
      .rejects.toThrow('THREAD_NOT_FOUND');

    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith(threadId);
    expect(mockThreadRepository.getThreadById).not.toHaveBeenCalled();
    expect(mockCommentRepository.getCommentsByThreadId).not.toHaveBeenCalled();
    
    // Assert jumlah pemanggilan method
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledTimes(0);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledTimes(0);
  });
});