const CreateComment = require('../../../Domains/comments/entities/CreateComment');
const CreatedComment = require('../../../Domains/comments/entities/CreatedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'ini komentar',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    const returnedCreatedComment = {
      id: 'comment-123',
      content: 'ini komentar',
      owner: 'user-123',
    };

    // Mock repositories
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mock function implementations
    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    
    // Kembalikan data mentah, bukan instance CreatedComment
    mockCommentRepository.addComment = jest.fn()
      .mockResolvedValue(returnedCreatedComment);

    // Create use case instance
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act
    const createdComment = await addCommentUseCase.execute(useCasePayload);

    // Assert - verifikasi jumlah pemanggilan untuk method-method terkait use case ini
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(useCasePayload.threadId);
    
    expect(mockCommentRepository.addComment).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.addComment).toBeCalledWith(new CreateComment(useCasePayload));
    
    // Karena use case mengembalikan hasil langsung dari repository (data mentah)
    expect(createdComment).toStrictEqual(returnedCreatedComment);
    
    // Verifikasi properti yang dikembalikan
    expect(createdComment).toEqual(expect.objectContaining({
      id: expect.any(String),
      content: expect.any(String),
      owner: expect.any(String),
    }));
    
    expect(createdComment.id).toBe('comment-123');
    expect(createdComment.content).toBe('ini komentar');
    expect(createdComment.owner).toBe('user-123');
  });

  it('should throw error when thread does not exist', async () => {
    // Arrange
    const useCasePayload = {
      content: 'ini komentar',
      owner: 'user-123',
      threadId: 'thread-nonexistent',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mock verifyThreadExist to throw error
    mockThreadRepository.verifyThreadExist = jest.fn()
      .mockRejectedValue(new Error('Thread tidak ditemukan'));
    
    mockCommentRepository.addComment = jest.fn();

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act & Assert
    await expect(addCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrow('Thread tidak ditemukan');

    // Verify that verifyThreadExist was called
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(useCasePayload.threadId);
    
    // Verify that addComment was not called due to error
    expect(mockCommentRepository.addComment).not.toHaveBeenCalled();
  });

  it('should throw error when comment repository fails', async () => {
    // Arrange
    const useCasePayload = {
      content: 'ini komentar',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Mock verifyThreadExist to succeed
    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    
    // Mock addComment to throw error
    mockCommentRepository.addComment = jest.fn()
      .mockRejectedValue(new Error('Gagal menambahkan comment'));

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act & Assert
    await expect(addCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrow('Gagal menambahkan comment');

    // Verify method calls
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(useCasePayload.threadId);
    
    expect(mockCommentRepository.addComment).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.addComment).toBeCalledWith(new CreateComment(useCasePayload));
  });
});