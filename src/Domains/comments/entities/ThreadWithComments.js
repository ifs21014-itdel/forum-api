// src/Domains/comments/entities/ThreadWithComments.js
class ThreadWithComments {
  constructor(payload) {
    this._verifyPayload(payload);
    const { id, title, body, date, username, comments } = payload;

    this.id = id;
    this.title = title;
    this.body = body;
    this.date = date;
    this.username = username;
    this.comments = comments.map(comment => new CommentDetail(comment));
  }

  _verifyPayload({ id, title, body, date, username, comments }) {
    if (!id || !title || !body || !date || !username || !Array.isArray(comments)) {
      throw new Error('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }
}

class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);
    const { id, username, date, content, isDeleted } = payload;

    this.id = id;
    this.username = username;
    this.date = date instanceof Date ? date.toISOString() : date;
    this.content = isDeleted ? '**komentar telah dihapus**' : content;
  }

  _verifyPayload({ id, username, date, content }) {
    if (!id || !username || !date || content === undefined) {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }
}

module.exports = { ThreadWithComments, CommentDetail };