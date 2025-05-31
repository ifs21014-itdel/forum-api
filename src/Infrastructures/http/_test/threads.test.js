const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const bcrypt = require('bcrypt');
const Jwt = require('@hapi/jwt');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const userId = 'user-123';
      const username = 'dicoding';
      const password = await bcrypt.hash('secret', 10);
      
      // Add user to database
      await UsersTableTestHelper.addUser({
        id: userId,
        username,
        password,
        fullname: 'Dicoding Indonesia',
      });

      // Create access token
      const accessToken = Jwt.token.generate(
        { id: userId, username },
        process.env.ACCESS_TOKEN_KEY || 'dicoding'
      );

      const requestPayload = {
        title: 'Judul thread',
        body: 'Isi thread',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
      expect(responseJson.data.addedThread.owner).toEqual(userId);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const userId = 'user-123';
      const username = 'dicoding';
      const password = await bcrypt.hash('secret', 10);
      
      await UsersTableTestHelper.addUser({
        id: userId,
        username,
        password,
        fullname: 'Dicoding Indonesia',
      });

      const accessToken = Jwt.token.generate(
        { id: userId, username },
        process.env.ACCESS_TOKEN_KEY || 'dicoding'
      );

      const requestPayload = {
        title: 'Judul thread',
        // missing body property
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const userId = 'user-123';
      const username = 'dicoding';
      const password = await bcrypt.hash('secret', 10);
      
      await UsersTableTestHelper.addUser({
        id: userId,
        username,
        password,
        fullname: 'Dicoding Indonesia',
      });

      const accessToken = Jwt.token.generate(
        { id: userId, username },
        process.env.ACCESS_TOKEN_KEY || 'dicoding'
      );

      const requestPayload = {
        title: ['Judul thread'], // should be string, not array
        body: 'Isi thread',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 401 when request without access token', async () => {
      // Arrange
      const requestPayload = {
        title: 'Judul thread',
        body: 'Isi thread',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should response 401 when request with invalid access token', async () => {
      // Arrange
      const requestPayload = {
        title: 'Judul thread',
        body: 'Isi thread',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: 'Bearer invalid_token',
        },
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });
});