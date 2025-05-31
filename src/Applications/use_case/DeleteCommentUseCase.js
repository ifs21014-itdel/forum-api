const DeleteComment = require('../../Domains/comments/entities/DeleteComment');

class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    
    await this._commentRepository.getCommentDetailIfOwner(useCasePayload.commentId, useCasePayload.owner);
    const deleteComment = new DeleteComment(useCasePayload);

    await this._commentRepository.deleteComment(deleteComment);
  }
}

module.exports = DeleteCommentUseCase;
