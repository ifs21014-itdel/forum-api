const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');

class ThreadsHandler {
    constructor (container) {
        this._container = container;
        this.postThreadHandler = this.postThreadHandler.bind(this);
    
    }

    async postThreadHandler(request, h) {
       try {
         const { id: credentialId } = request.auth.credentials;
         const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
         const addedThread = await addThreadUseCase.execute({ 
            ...request.payload, 
            owner: credentialId,
        });


        const response = h.response({
            status : 'success',
            data : {
                addedThread,
            },
        });

        response.code(201);
        return response;
       } catch (error) {
            // console.error(error);
            throw error;
       }
    }
}

module.exports = ThreadsHandler;