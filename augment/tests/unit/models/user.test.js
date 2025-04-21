const { expect } = require('chai');
const bcrypt = require('bcryptjs');
const { User } = require('../../../models');
const { connectDB, disconnectDB, clearDB } = require('../../config');

describe('User Model', () => {
  before(async () => {
    await connectDB();
  });
  
  after(async () => {
    await disconnectDB();
  });
  
  beforeEach(async () => {
    await clearDB();
  });
  
  it('should create a new user successfully', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      passwordConfirm: 'password123'
    };
    
    const user = await User.create(userData);
    
    expect(user).to.have.property('_id');
    expect(user.firstName).to.equal(userData.firstName);
    expect(user.lastName).to.equal(userData.lastName);
    expect(user.email).to.equal(userData.email);
    expect(user.role).to.equal('client'); // Default role
    expect(user.active).to.equal(true); // Default active status
  });
  
  it('should hash the password before saving', async () => {
    const userData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      password: 'password123',
      passwordConfirm: 'password123'
    };
    
    const user = await User.create(userData);
    
    // Password should be hashed
    expect(user.password).to.not.equal(userData.password);
    
    // passwordConfirm should be undefined
    expect(user.passwordConfirm).to.be.undefined;
    
    // Verify that the password is correctly hashed
    const isMatch = await bcrypt.compare(userData.password, user.password);
    expect(isMatch).to.be.true;
  });
  
  it('should not create a user with duplicate email', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'duplicate@example.com',
      password: 'password123',
      passwordConfirm: 'password123'
    };
    
    await User.create(userData);
    
    try {
      await User.create(userData);
      // If we reach here, the test should fail
      expect.fail('Should not create a user with duplicate email');
    } catch (error) {
      expect(error).to.exist;
      expect(error.code).to.equal(11000); // MongoDB duplicate key error code
    }
  });
  
  it('should not create a user with mismatched passwords', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      passwordConfirm: 'password456'
    };
    
    try {
      await User.create(userData);
      // If we reach here, the test should fail
      expect.fail('Should not create a user with mismatched passwords');
    } catch (error) {
      expect(error).to.exist;
      expect(error.errors.passwordConfirm).to.exist;
    }
  });
  
  it('should not create a user with invalid email', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid-email',
      password: 'password123',
      passwordConfirm: 'password123'
    };
    
    try {
      await User.create(userData);
      // If we reach here, the test should fail
      expect.fail('Should not create a user with invalid email');
    } catch (error) {
      expect(error).to.exist;
      expect(error.errors.email).to.exist;
    }
  });
  
  it('should correctly check if password is valid', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      passwordConfirm: 'password123'
    };
    
    const user = await User.create(userData);
    
    // Test correctPassword method
    const isCorrect = await user.correctPassword('password123', user.password);
    expect(isCorrect).to.be.true;
    
    const isIncorrect = await user.correctPassword('wrongpassword', user.password);
    expect(isIncorrect).to.be.false;
  });
  
  it('should create a password reset token', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      passwordConfirm: 'password123'
    };
    
    const user = await User.create(userData);
    
    const resetToken = user.createPasswordResetToken();
    
    expect(resetToken).to.be.a('string');
    expect(user.passwordResetToken).to.exist;
    expect(user.passwordResetExpires).to.exist;
    
    // Token should expire in 10 minutes
    const expectedExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const tokenExpiry = new Date(user.passwordResetExpires);
    
    // Allow for a small difference in time (1 second)
    expect(Math.abs(tokenExpiry - expectedExpiry)).to.be.lessThan(1000);
  });
  
  it('should check if password was changed after token was issued', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      passwordConfirm: 'password123'
    };
    
    const user = await User.create(userData);
    
    // Token issued now
    const tokenIssuedAt = Date.now() / 1000;
    
    // Password not changed yet
    expect(user.changedPasswordAfter(tokenIssuedAt)).to.be.false;
    
    // Change password
    user.password = 'newpassword123';
    user.passwordConfirm = 'newpassword123';
    await user.save();
    
    // Password changed after token was issued
    expect(user.changedPasswordAfter(tokenIssuedAt)).to.be.true;
    
    // Token issued after password change
    const newTokenIssuedAt = Date.now() / 1000;
    expect(user.changedPasswordAfter(newTokenIssuedAt)).to.be.false;
  });
  
  it('should get full name virtual property', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      passwordConfirm: 'password123'
    };
    
    const user = await User.create(userData);
    
    expect(user.fullName).to.equal('John Doe');
  });
});
