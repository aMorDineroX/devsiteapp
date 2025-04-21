const request = require('supertest');
const { expect } = require('chai');
const app = require('../../../server');
const { User } = require('../../../models');
const { connectDB, disconnectDB, clearDB } = require('../../config');

describe('Auth Controller', () => {
  before(async () => {
    await connectDB();
  });
  
  after(async () => {
    await disconnectDB();
  });
  
  beforeEach(async () => {
    await clearDB();
  });
  
  describe('POST /api/v1/auth/signup', () => {
    it('should register a new user', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      };
      
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send(userData)
        .expect(201);
      
      expect(res.body.status).to.equal('success');
      expect(res.body.data).to.have.property('user');
      expect(res.body.data.user.firstName).to.equal(userData.firstName);
      expect(res.body.data.user.lastName).to.equal(userData.lastName);
      expect(res.body.data.user.email).to.equal(userData.email);
      expect(res.body.data.user).to.not.have.property('password');
      expect(res.body).to.have.property('token');
      
      // Check if user is saved in database
      const user = await User.findOne({ email: userData.email });
      expect(user).to.exist;
      expect(user.firstName).to.equal(userData.firstName);
    });
    
    it('should not register a user with existing email', async () => {
      // Create a user first
      await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      });
      
      // Try to register with the same email
      const userData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'john.doe@example.com', // Same email
        password: 'password456',
        passwordConfirm: 'password456'
      };
      
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send(userData)
        .expect(400);
      
      expect(res.body.status).to.equal('error');
      expect(res.body.message).to.include('email');
    });
    
    it('should not register a user with mismatched passwords', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        passwordConfirm: 'password456' // Different password
      };
      
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send(userData)
        .expect(400);
      
      expect(res.body.status).to.equal('error');
      expect(res.body.message).to.include('password');
    });
  });
  
  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      });
    });
    
    it('should login a user with correct credentials', async () => {
      const loginData = {
        email: 'john.doe@example.com',
        password: 'password123'
      };
      
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);
      
      expect(res.body.status).to.equal('success');
      expect(res.body.data).to.have.property('user');
      expect(res.body.data.user.email).to.equal(loginData.email);
      expect(res.body).to.have.property('token');
    });
    
    it('should not login a user with incorrect email', async () => {
      const loginData = {
        email: 'wrong.email@example.com',
        password: 'password123'
      };
      
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);
      
      expect(res.body.status).to.equal('error');
      expect(res.body.message).to.include('Email ou mot de passe incorrect');
    });
    
    it('should not login a user with incorrect password', async () => {
      const loginData = {
        email: 'john.doe@example.com',
        password: 'wrongpassword'
      };
      
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);
      
      expect(res.body.status).to.equal('error');
      expect(res.body.message).to.include('Email ou mot de passe incorrect');
    });
  });
  
  describe('POST /api/v1/auth/forgot-password', () => {
    beforeEach(async () => {
      // Create a user for forgot password tests
      await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      });
    });
    
    it('should send a password reset token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'john.doe@example.com' })
        .expect(200);
      
      expect(res.body.status).to.equal('success');
      expect(res.body.message).to.include('Token envoyé');
      
      // Check if user has a reset token in database
      const user = await User.findOne({ email: 'john.doe@example.com' });
      expect(user.passwordResetToken).to.exist;
      expect(user.passwordResetExpires).to.exist;
    });
    
    it('should return an error for non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);
      
      expect(res.body.status).to.equal('error');
      expect(res.body.message).to.include('Aucun utilisateur');
    });
  });
  
  describe('POST /api/v1/auth/reset-password/:token', () => {
    let resetToken;
    let hashedToken;
    
    beforeEach(async () => {
      // Create a user for reset password tests
      const user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      });
      
      // Generate reset token
      resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });
    });
    
    it('should reset password with valid token', async () => {
      const res = await request(app)
        .post(`/api/v1/auth/reset-password/${resetToken}`)
        .send({
          password: 'newpassword123',
          passwordConfirm: 'newpassword123'
        })
        .expect(200);
      
      expect(res.body.status).to.equal('success');
      expect(res.body).to.have.property('token');
      
      // Check if password was updated
      const user = await User.findOne({ email: 'john.doe@example.com' }).select('+password');
      const isPasswordChanged = await user.correctPassword('newpassword123', user.password);
      expect(isPasswordChanged).to.be.true;
      
      // Reset token should be cleared
      expect(user.passwordResetToken).to.be.undefined;
      expect(user.passwordResetExpires).to.be.undefined;
    });
    
    it('should not reset password with invalid token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/reset-password/invalidtoken')
        .send({
          password: 'newpassword123',
          passwordConfirm: 'newpassword123'
        })
        .expect(400);
      
      expect(res.body.status).to.equal('error');
      expect(res.body.message).to.include('Token invalide ou expiré');
    });
    
    it('should not reset password with mismatched passwords', async () => {
      const res = await request(app)
        .post(`/api/v1/auth/reset-password/${resetToken}`)
        .send({
          password: 'newpassword123',
          passwordConfirm: 'differentpassword'
        })
        .expect(400);
      
      expect(res.body.status).to.equal('error');
      expect(res.body.message).to.include('password');
    });
  });
  
  describe('GET /api/v1/auth/logout', () => {
    it('should log out a user', async () => {
      const res = await request(app)
        .get('/api/v1/auth/logout')
        .expect(200);
      
      expect(res.body.status).to.equal('success');
      
      // Check if cookie is cleared
      const cookies = res.headers['set-cookie'];
      expect(cookies).to.exist;
      
      const jwtCookie = cookies.find(cookie => cookie.startsWith('jwt='));
      expect(jwtCookie).to.include('jwt=;');
    });
  });
});
