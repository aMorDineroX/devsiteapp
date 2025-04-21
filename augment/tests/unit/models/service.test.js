const { expect } = require('chai');
const { Service, User } = require('../../../models');
const { connectDB, disconnectDB, clearDB } = require('../../config');

describe('Service Model', () => {
  let admin;
  
  before(async () => {
    await connectDB();
    
    // Créer un utilisateur admin pour les tests
    admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
      role: 'admin'
    });
  });
  
  after(async () => {
    await disconnectDB();
  });
  
  beforeEach(async () => {
    await clearDB();
    
    // Recréer l'utilisateur admin après chaque nettoyage
    admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
      role: 'admin'
    });
  });
  
  it('should create a new service successfully', async () => {
    const serviceData = {
      title: 'Développement Frontend',
      description: 'Service de développement frontend avec React',
      shortDescription: 'Développement frontend avec React',
      icon: 'fas fa-laptop-code',
      price: 1500,
      duration: {
        value: 2,
        unit: 'semaines'
      },
      features: ['Design responsive', 'Animations fluides', 'Performance optimisée'],
      category: 'frontend',
      createdBy: admin._id
    };
    
    const service = await Service.create(serviceData);
    
    expect(service).to.have.property('_id');
    expect(service.title).to.equal(serviceData.title);
    expect(service.description).to.equal(serviceData.description);
    expect(service.price).to.equal(serviceData.price);
    expect(service.category).to.equal(serviceData.category);
    expect(service.features).to.have.lengthOf(3);
    expect(service.isActive).to.equal(true); // Default active status
    expect(service.isPopular).to.equal(false); // Default popular status
    expect(service.slug).to.equal('developpement-frontend'); // Slugified title
  });
  
  it('should not create a service with invalid category', async () => {
    const serviceData = {
      title: 'Développement Frontend',
      description: 'Service de développement frontend avec React',
      shortDescription: 'Développement frontend avec React',
      icon: 'fas fa-laptop-code',
      price: 1500,
      duration: {
        value: 2,
        unit: 'semaines'
      },
      features: ['Design responsive', 'Animations fluides', 'Performance optimisée'],
      category: 'invalid-category', // Invalid category
      createdBy: admin._id
    };
    
    try {
      await Service.create(serviceData);
      // If we reach here, the test should fail
      expect.fail('Should not create a service with invalid category');
    } catch (error) {
      expect(error).to.exist;
      expect(error.errors.category).to.exist;
    }
  });
  
  it('should not create a service with negative price', async () => {
    const serviceData = {
      title: 'Développement Frontend',
      description: 'Service de développement frontend avec React',
      shortDescription: 'Développement frontend avec React',
      icon: 'fas fa-laptop-code',
      price: -100, // Negative price
      duration: {
        value: 2,
        unit: 'semaines'
      },
      features: ['Design responsive', 'Animations fluides', 'Performance optimisée'],
      category: 'frontend',
      createdBy: admin._id
    };
    
    try {
      await Service.create(serviceData);
      // If we reach here, the test should fail
      expect.fail('Should not create a service with negative price');
    } catch (error) {
      expect(error).to.exist;
      expect(error.errors.price).to.exist;
    }
  });
  
  it('should not create a service with price discount greater than price', async () => {
    const serviceData = {
      title: 'Développement Frontend',
      description: 'Service de développement frontend avec React',
      shortDescription: 'Développement frontend avec React',
      icon: 'fas fa-laptop-code',
      price: 1000,
      priceDiscount: 1500, // Greater than price
      duration: {
        value: 2,
        unit: 'semaines'
      },
      features: ['Design responsive', 'Animations fluides', 'Performance optimisée'],
      category: 'frontend',
      createdBy: admin._id
    };
    
    try {
      await Service.create(serviceData);
      // If we reach here, the test should fail
      expect.fail('Should not create a service with price discount greater than price');
    } catch (error) {
      expect(error).to.exist;
      expect(error.errors.priceDiscount).to.exist;
    }
  });
  
  it('should round ratings average to one decimal place', async () => {
    const serviceData = {
      title: 'Développement Frontend',
      description: 'Service de développement frontend avec React',
      shortDescription: 'Développement frontend avec React',
      icon: 'fas fa-laptop-code',
      price: 1500,
      duration: {
        value: 2,
        unit: 'semaines'
      },
      features: ['Design responsive', 'Animations fluides', 'Performance optimisée'],
      category: 'frontend',
      ratingsAverage: 4.666666, // Should be rounded to 4.7
      createdBy: admin._id
    };
    
    const service = await Service.create(serviceData);
    
    expect(service.ratingsAverage).to.equal(4.7);
  });
  
  it('should get duration text virtual property', async () => {
    const serviceData = {
      title: 'Développement Frontend',
      description: 'Service de développement frontend avec React',
      shortDescription: 'Développement frontend avec React',
      icon: 'fas fa-laptop-code',
      price: 1500,
      duration: {
        value: 2,
        unit: 'semaines'
      },
      features: ['Design responsive', 'Animations fluides', 'Performance optimisée'],
      category: 'frontend',
      createdBy: admin._id
    };
    
    const service = await Service.create(serviceData);
    
    expect(service.durationText).to.equal('2 semaines');
  });
  
  it('should filter out inactive services in find queries', async () => {
    // Create an active service
    await Service.create({
      title: 'Service Actif',
      description: 'Service actif',
      shortDescription: 'Service actif',
      icon: 'fas fa-check',
      price: 1000,
      duration: {
        value: 1,
        unit: 'semaines'
      },
      features: ['Feature 1'],
      category: 'frontend',
      isActive: true,
      createdBy: admin._id
    });
    
    // Create an inactive service
    await Service.create({
      title: 'Service Inactif',
      description: 'Service inactif',
      shortDescription: 'Service inactif',
      icon: 'fas fa-times',
      price: 1000,
      duration: {
        value: 1,
        unit: 'semaines'
      },
      features: ['Feature 1'],
      category: 'frontend',
      isActive: false,
      createdBy: admin._id
    });
    
    // Find all services
    const services = await Service.find();
    
    // Should only return active services
    expect(services).to.have.lengthOf(1);
    expect(services[0].title).to.equal('Service Actif');
  });
});
