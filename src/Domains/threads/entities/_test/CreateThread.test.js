const CreateThread = require('../CreateThread'); // sesuaikan path import sesuai struktur foldermu

describe('CreateThread', () => {
  it('should create CreateThread object correctly when given valid payload', () => {
    const payload = {
      title: 'judul thread',
      body: 'isi body thread',
      owner: 'user-123',
    };

    const createThread = new CreateThread(payload);

    expect(createThread.title).toBe(payload.title);
    expect(createThread.body).toBe(payload.body);
    expect(createThread.owner).toBe(payload.owner);
  });

  it('should throw error when payload does not contain needed property', () => {
    const payloadMissingTitle = {
      body: 'isi body thread',
      owner: 'user-123',
    };

    expect(() => new CreateThread(payloadMissingTitle))
      .toThrowError('CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');

    const payloadMissingBody = {
      title: 'judul thread',
      owner: 'user-123',
    };

    expect(() => new CreateThread(payloadMissingBody))
      .toThrowError('CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');

    const payloadMissingOwner = {
      title: 'judul thread',
      body: 'isi body thread',
    };

    expect(() => new CreateThread(payloadMissingOwner))
      .toThrowError('CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload properties are not string', () => {
    const payloadWrongTitleType = {
      title: 123, // harus string
      body: 'isi body thread',
      owner: 'user-123',
    };

    expect(() => new CreateThread(payloadWrongTitleType))
      .toThrowError('CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');

    const payloadWrongBodyType = {
      title: 'judul thread',
      body: 123, // harus string
      owner: 'user-123',
    };

    expect(() => new CreateThread(payloadWrongBodyType))
      .toThrowError('CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');

    const payloadWrongOwnerType = {
      title: 'judul thread',
      body: 'isi body thread',
      owner: {}, // harus string
    };

    expect(() => new CreateThread(payloadWrongOwnerType))
      .toThrowError('CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
