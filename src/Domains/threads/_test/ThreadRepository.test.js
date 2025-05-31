const ThreadRepository = require('../ThreadRepository'); // sesuaikan path

describe('ThreadRepository', () => {
  it('should throw error when addThread method is called', async () => {
    const threadRepository = new ThreadRepository();

    await expect(threadRepository.addThread({}))
      .rejects
      .toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when verifyThreadAvailability method is called', async () => {
    const threadRepository = new ThreadRepository();

    await expect(threadRepository.verifyThreadAvailability('thread-123'))
      .rejects
      .toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when verifyThreadExist method is called', async () => {
    const threadRepository = new ThreadRepository();

    await expect(threadRepository.verifyThreadExist('thread-123'))
      .rejects
      .toThrowError('THREAD_REPOSITORY.VERIFY_THREAD_EXIST_METHOD_NOT_IMPLEMENTED');
  });
});
