const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrate the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'Judul thread',
      body: 'Isi body thread',
      owner: 'user-123',
    };

    const returnedCreatedThread = new CreatedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    });

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = jest.fn()
      .mockResolvedValue(returnedCreatedThread);

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Act
    const createdThread = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.addThread).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.addThread).toBeCalledWith(new CreateThread(useCasePayload));
    
    expect(createdThread).toStrictEqual(returnedCreatedThread);
    expect(createdThread).toBeInstanceOf(CreatedThread);
    expect(createdThread).toEqual(expect.objectContaining({
      id: expect.any(String),
      title: expect.any(String),
      owner: expect.any(String),
    }));
    expect(createdThread.title).toBe('Judul thread');
    expect(createdThread.owner).toBe('user-123');
  });

  it('should throw error when repository fails to add thread', async () => {
    // Arrange
    const useCasePayload = {
      title: 'Judul thread',
      body: 'Isi body thread',
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = jest.fn()
      .mockRejectedValue(new Error('Gagal menambahkan thread'));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Act & Assert
    await expect(addThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrow('Gagal menambahkan thread');

    expect(mockThreadRepository.addThread).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.addThread).toBeCalledWith(new CreateThread(useCasePayload));
  });

  it('should throw error when CreateThread validation fails', async () => {
    // Arrange
    const invalidPayload = {
      title: 123, // Invalid type
      body: 'Isi body thread',
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = jest.fn();

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Act & Assert
    await expect(addThreadUseCase.execute(invalidPayload))
      .rejects
      .toThrow();

    expect(mockThreadRepository.addThread).not.toHaveBeenCalled();
  });
});
