class ThreadRepository {
    async addThread (createThread) {
        throw new Error ('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async verifyThreadAvailability(threadId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
   async verifyThreadExist(threadId) {
    throw new Error('THREAD_REPOSITORY.VERIFY_THREAD_EXIST_METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = ThreadRepository;