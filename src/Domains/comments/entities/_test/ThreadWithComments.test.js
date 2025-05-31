const { ThreadWithComments, CommentDetail } = require('../ThreadWithComments');



describe('ThreadWithComments entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread Body',
      date: '2023-10-10T10:00:00.000Z',
      username: 'user123',
      // comments tidak ada
    };

    expect(() => new ThreadWithComments(payload)).toThrowError('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should create ThreadWithComments object correctly with valid comments', () => {
    const payload = {
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread Body',
      date: '2023-10-10T10:00:00.000Z',
      username: 'user123',
      comments: [
        {
          id: 'comment-123',
          username: 'user456',
          date: '2023-10-11T10:00:00.000Z',
          content: 'komentar pertama',
          isDeleted: false,
        },
        {
          id: 'comment-456',
          username: 'user789',
          date: '2023-10-12T11:00:00.000Z',
          content: 'komentar kedua',
          isDeleted: true,
        },
      ],
    };

    const thread = new ThreadWithComments(payload);

    // Assert properti thread
    expect(thread.id).toEqual(payload.id);
    expect(thread.title).toEqual(payload.title);
    expect(thread.body).toEqual(payload.body);
    expect(thread.date).toEqual(payload.date);
    expect(thread.username).toEqual(payload.username);

    // Assert panjang komentar
    expect(thread.comments).toHaveLength(payload.comments.length);

    // Assert tiap komentar dalam thread.comments
    thread.comments.forEach((commentEntity, index) => {
      const originalComment = payload.comments[index];

      expect(commentEntity).toBeInstanceOf(CommentDetail);
      expect(commentEntity.id).toEqual(originalComment.id);
      expect(commentEntity.username).toEqual(originalComment.username);

      // Jika date berupa objek Date, sudah di-convert ke ISO string di entity
      const expectedDate = originalComment.date instanceof Date
        ? originalComment.date.toISOString()
        : originalComment.date;
      expect(commentEntity.date).toEqual(expectedDate);

      // Cek konten sesuai isDeleted flag
      if (originalComment.isDeleted) {
        expect(commentEntity.content).toEqual('**komentar telah dihapus**');
      } else {
        expect(commentEntity.content).toEqual(originalComment.content);
      }
    });
  });
});

describe('CommentDetail entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      id: 'comment-123',
      username: 'user123',
      date: '2023-10-11T10:00:00.000Z',
      // content missing
    };

    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should create CommentDetail correctly when isDeleted is false', () => {
    const payload = {
      id: 'comment-123',
      username: 'user123',
      date: '2023-10-11T10:00:00.000Z',
      content: 'Komentar aktif',
      isDeleted: false,
    };

    const comment = new CommentDetail(payload);

    expect(comment.id).toEqual(payload.id);
    expect(comment.username).toEqual(payload.username);
    expect(comment.date).toEqual(payload.date);
    expect(comment.content).toEqual('Komentar aktif');
  });

  it('should return content as "**komentar telah dihapus**" when isDeleted is true', () => {
    const payload = {
      id: 'comment-456',
      username: 'user456',
      date: '2023-10-12T11:00:00.000Z',
      content: 'seharusnya tidak tampil',
      isDeleted: true,
    };

    const comment = new CommentDetail(payload);

    expect(comment.id).toEqual(payload.id);
    expect(comment.username).toEqual(payload.username);
    expect(comment.date).toEqual(payload.date);
    expect(comment.content).toEqual('**komentar telah dihapus**');
  });

  it('should default to original content when isDeleted is undefined (not deleted)', () => {
    const payload = {
      id: 'comment-999',
      username: 'user999',
      date: '2023-10-13T12:00:00.000Z',
      content: 'komentar tanpa isDeleted',
      // isDeleted tidak disediakan
    };

    const comment = new CommentDetail(payload);

    expect(comment.id).toEqual(payload.id);
    expect(comment.username).toEqual(payload.username);
    expect(comment.date).toEqual(payload.date);
    expect(comment.content).toEqual('komentar tanpa isDeleted');
  });

  it('should convert Date object to ISO string for date field', () => {
    const payload = {
      id: 'comment-999',
      username: 'user999',
      date: new Date('2023-10-13T12:00:00.000Z'),
      content: 'komentar dengan objek Date',
      isDeleted: false,
    };

    const comment = new CommentDetail(payload);

    expect(comment.date).toEqual('2023-10-13T12:00:00.000Z');
  });
});
