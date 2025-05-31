const DeleteComment = require('../../../Domains/comments/entities/DeleteComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrate the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.getCommentDetailIfOwner = jest.fn()
      .mockResolvedValue({
        id: 'comment-123',
        content: 'Test comment',
        owner: 'user-123'
      });

    mockCommentRepository.deleteComment = jest.fn()
      .mockResolvedValue();

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.getCommentDetailIfOwner)
      .toHaveBeenCalledWith('comment-123', 'user-123');
    expect(mockCommentRepository.deleteComment)
      .toHaveBeenCalledWith(new DeleteComment(useCasePayload));
    
    // Assert jumlah pemanggilan method
    expect(mockCommentRepository.getCommentDetailIfOwner).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledTimes(1);
  });

  it('should throw error when user is not the owner', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.getCommentDetailIfOwner = jest.fn()
      .mockRejectedValue(new Error('AUTHORIZATION_ERROR'));

    mockCommentRepository.deleteComment = jest.fn()
      .mockResolvedValue();

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects.toThrow('AUTHORIZATION_ERROR');

    expect(mockCommentRepository.getCommentDetailIfOwner)
      .toHaveBeenCalledWith('comment-123', 'user-123');
    expect(mockCommentRepository.deleteComment).not.toHaveBeenCalled();
    
    // Assert jumlah pemanggilan method
    expect(mockCommentRepository.getCommentDetailIfOwner).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledTimes(0);
  });

  it('should throw error when comment not found', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-not-found',
      owner: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.getCommentDetailIfOwner = jest.fn()
      .mockRejectedValue(new Error('COMMENT_NOT_FOUND'));

    mockCommentRepository.deleteComment = jest.fn()
      .mockResolvedValue();

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects.toThrow('COMMENT_NOT_FOUND');

    expect(mockCommentRepository.getCommentDetailIfOwner)
      .toHaveBeenCalledWith('comment-not-found', 'user-123');
    expect(mockCommentRepository.deleteComment).not.toHaveBeenCalled();
    
    // Assert jumlah pemanggilan method
    expect(mockCommentRepository.getCommentDetailIfOwner).toHaveBeenCalledTimes(1);
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledTimes(0);
  });
});