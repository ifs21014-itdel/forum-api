const createServer = require('../createServer');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const bcrypt = require('bcrypt');
const Jwt = require('@hapi/jwt');

// Import untuk mock
const AddThreadUseCase = require('../../../Applications/use_case/AddThreadUseCase');
const NewThread = require('../../../Domains/threads/entities/CreateThread');
const AddedThread = require('../../../Domains/threads/entities/CreatedThread');

describe('HTTP server', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should response 404 when request unregistered route', async () => {
    const server = await createServer({});

    const response = await server.inject({
      method: 'GET',
      url: '/unregisteredRoute',
    });

    expect(response.statusCode).toEqual(404);
  });

  it('should handle server error correctly', async () => {
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    const server = await createServer({});

    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: requestPayload,
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual('error');
    expect(responseJson.message).toEqual('terjadi kegagalan pada server kami');
  });

  it('should response 201 and create new thread on POST /threads', async () => {
    // Arrange: Tambahkan user ke DB
    const userId = 'user-123';
    const username = 'dicoding';
    const password = await bcrypt.hash('super_secret', 10);
    await UsersTableTestHelper.addUser({
      id: userId,
      username,
      password,
      fullname: 'Dicoding Indonesia',
    });

    // Buat token
    const accessToken = Jwt.token.generate(
      { id: userId, username },
      process.env.ACCESS_TOKEN_KEY || 'dicoding'
    );

    // Mock AddThreadUseCase
    const mockAddedThread = new AddedThread({
      id: 'thread-123',
      title: 'Judul thread',
      owner: userId,
    });

    const mockAddThreadUseCase = new AddThreadUseCase({}, {});
    mockAddThreadUseCase.execute = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));

    // Mock container dengan getInstance method
    const mockContainer = {
      getInstance: jest.fn().mockImplementation((name) => {
        if (name === AddThreadUseCase.name) {
          return mockAddThreadUseCase;
        }
        throw new Error(`Unknown dependency: ${name}`);
      }),
    };

    const server = await createServer(mockContainer);

    // Act
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: {
        title: 'Judul thread',
        body: 'Isi thread',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(201);
    expect(responseJson.status).toEqual('success');
    expect(responseJson.data.addedThread).toBeDefined();
    expect(responseJson.data.addedThread.title).toEqual('Judul thread');
    expect(mockContainer.getInstance).toHaveBeenCalledWith(AddThreadUseCase.name);
    expect(mockAddThreadUseCase.execute).toHaveBeenCalledWith({
      title: 'Judul thread',
      body: 'Isi thread',
      owner: userId,
    });
  });
});

 describe('when GET /', () => {
    it('should return 200 and hello world', async () => {
      // Arrange
      const server = await createServer({});
      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/',
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.value).toEqual('Hello world!');
    });
  });
 