const CreatedThread = require('../CreatedThread');

describe('CreatedThread', () => {
  it('should create CreatedThread object correctly when given valid payload', () => {
    const payload = {
      id: 'thread-123',
      title: 'judul thread',
      owner: 'user-123',
    };

    const createdThread = new CreatedThread(payload);

    expect(createdThread.id).toBe(payload.id);
    expect(createdThread.title).toBe(payload.title);
    expect(createdThread.owner).toBe(payload.owner);
  });

  it('should throw error when payload does not contain needed property', () => {
    const payloadMissingId = {
      title: 'judul thread',
      owner: 'user-123',
    };

    expect(() => new CreatedThread(payloadMissingId))
      .toThrowError('CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');

    const payloadMissingTitle = {
      id: 'thread-123',
      owner: 'user-123',
    };

    expect(() => new CreatedThread(payloadMissingTitle))
      .toThrowError('CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');

    const payloadMissingOwner = {
      id: 'thread-123',
      title: 'judul thread',
    };

    expect(() => new CreatedThread(payloadMissingOwner))
      .toThrowError('CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload properties are not string', () => {
    const payloadWrongIdType = {
      id: 123, // number, harus string
      title: 'judul thread',
      owner: 'user-123',
    };

    expect(() => new CreatedThread(payloadWrongIdType))
      .toThrowError('CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');

    const payloadWrongTitleType = {
      id: 'thread-123',
      title: 123, // number, harus string
      owner: 'user-123',
    };

    expect(() => new CreatedThread(payloadWrongTitleType))
      .toThrowError('CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');

    const payloadWrongOwnerType = {
      id: 'thread-123',
      title: 'judul thread',
      owner: {}, // object, harus string
    };

    expect(() => new CreatedThread(payloadWrongOwnerType))
      .toThrowError('CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
