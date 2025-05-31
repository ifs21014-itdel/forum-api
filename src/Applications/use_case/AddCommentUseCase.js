const CreateComment = require('../../Domains/comments/entities/CreateComment');

class AddCommentUseCase {
    constructor ({ commentRepository, threadRepository }) {
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute(useCasePayload) {
        const createComment = new CreateComment(useCasePayload);
    
        await this._threadRepository.verifyThreadExist(createComment.threadId);
        
        return await this._commentRepository.addComment(createComment);
    }
}

module.exports = AddCommentUseCase;