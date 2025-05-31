const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const GetCommentByIdUseCase = require('../../../../Applications/use_case/GetCommentByIdUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    // Bind supaya context this tetap benar saat dipakai sebagai callback
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.getCommentByIdHandler = this.getCommentByIdHandler.bind(this);
  }

  async postCommentHandler(request, h) {
  try {
    const { id: credentialId } = request.auth.credentials;
    const { threadId } = request.params;
    const { content } = request.payload;

    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);

    const useCasePayload = {
      content,
      threadId,
      owner: credentialId,
    };

    const addedComment = await addCommentUseCase.execute(useCasePayload);

    return h.response({
      status: 'success',
      data: {
        addedComment,
      },
    }).code(201);
  } catch (error) {
    return h.response({
      status: 'fail',
      message: error.message,
    }).code(error.statusCode || 500);
  }
}


  // Contoh skeleton untuk handler lain
  async deleteCommentHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { threadId, commentId } = request.params;

      const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);

      const useCasePayload = {
        threadId,
        commentId,
        owner: credentialId,
      };

      await deleteCommentUseCase.execute(useCasePayload);

      return h.response({
        status: 'success',
        message: 'komentar telah dihapus',
      }).code(200);
    } catch (error) {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(error.statusCode || 500);
    }
  }

  async getCommentByIdHandler(request, h) {
    try {
      const { threadId } = request.params;

      const getCommentByIdUseCase = this._container.getInstance(GetCommentByIdUseCase.name);

      const threadWithComments = await getCommentByIdUseCase.execute(threadId);

      return h.response({
        status: 'success',
        data: {
          thread: threadWithComments,
        },
      }).code(200);
    } catch (error) {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(error.statusCode || 500);
    }
  }
}

module.exports = CommentsHandler;
