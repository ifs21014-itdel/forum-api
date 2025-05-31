const Joi = require('joi');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads/{threadId}/comments',
    handler: handler.postCommentHandler,
    options: {
      auth: 'forum_api_jwt',
      validate: {
        payload: Joi.object({
          content: Joi.string().required(),
        }),
        params: Joi.object({
          threadId: Joi.string().required(),
        }),
        failAction: (request, h, err) => {
          return h.response({
            status: 'fail',
            message: err.message,
          }).code(400).takeover();
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}',
    handler: handler.deleteCommentHandler,
    options: {
      auth: 'forum_api_jwt',
      validate: {
        params: Joi.object({
          threadId: Joi.string().required(),
          commentId: Joi.string().required(),
        }),
        failAction: (request, h, err) => {
          return h.response({
            status: 'fail',
            message: err.message,
          }).code(400).takeover();
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: handler.getCommentByIdHandler,
    options: {
      // auth: 'forum_api_jwt', 
      validate: {
        params: Joi.object({
          threadId: Joi.string().required(),
        }),
        failAction: (request, h, err) => {
          return h.response({
            status: 'fail',
            message: err.message,
          }).code(400).takeover();
        },
      },
    },
  },
];

module.exports = routes;