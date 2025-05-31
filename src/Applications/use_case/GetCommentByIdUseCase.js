const { ThreadWithComments, CommentDetail } = require('../../Domains/comments/entities/ThreadWithComments');

class GetCommentByIdUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadExist(threadId);
    
    const threadData = await this._threadRepository.getThreadById(threadId);
    const commentsData = await this._commentRepository.getCommentsByThreadId(threadId);
    const commentDetails = commentsData.map((comment) => new CommentDetail({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.content,
      isDeleted: comment.is_deleted,
    }));

    const threadWithComments = {
      id: threadData.id,
      title: threadData.title,
      body: threadData.body,
      date: threadData.date,
      username: threadData.username,
      comments: commentDetails,
    };

    return new ThreadWithComments(threadWithComments);
  }
}

module.exports = GetCommentByIdUseCase;
