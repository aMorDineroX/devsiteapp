const { AppError } = require('../middleware/error.middleware');

/**
 * Filtre les champs autorisés pour la mise à jour
 * @param {Object} obj - Objet à filtrer
 * @param {Array} allowedFields - Champs autorisés
 * @returns {Object} - Objet filtré
 */
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/**
 * Obtenir tous les utilisateurs (admin)
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    // Note: Cette partie sera implémentée quand le modèle User sera disponible
    // const users = await User.find();
    
    // Simuler des utilisateurs pour le moment
    const users = [
      {
        _id: '123456789',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'client'
      },
      {
        _id: '987654321',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        role: 'admin'
      }
    ];
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir un utilisateur par ID
 */
exports.getUser = async (req, res, next) => {
  try {
    // Note: Cette partie sera implémentée quand le modèle User sera disponible
    // const user = await User.findById(req.params.id);
    // if (!user) {
    //   return next(new AppError('Aucun utilisateur trouvé avec cet ID', 404));
    // }
    
    // Simuler un utilisateur pour le moment
    const user = {
      _id: req.params.id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'client'
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un nouvel utilisateur (admin)
 */
exports.createUser = async (req, res, next) => {
  try {
    // Note: Cette partie sera implémentée quand le modèle User sera disponible
    // const newUser = await User.create(req.body);
    
    // Simuler un utilisateur pour le moment
    const newUser = {
      _id: '123456789',
      ...req.body
    };
    
    res.status(201).json({
      status: 'success',
      data: {
        user: newUser
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un utilisateur (admin)
 */
exports.updateUser = async (req, res, next) => {
  try {
    // Note: Cette partie sera implémentée quand le modèle User sera disponible
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true
    // });
    // if (!user) {
    //   return next(new AppError('Aucun utilisateur trouvé avec cet ID', 404));
    // }
    
    // Simuler un utilisateur pour le moment
    const user = {
      _id: req.params.id,
      firstName: req.body.firstName || 'John',
      lastName: req.body.lastName || 'Doe',
      email: req.body.email || 'john@example.com',
      role: req.body.role || 'client'
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un utilisateur (admin)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    // Note: Cette partie sera implémentée quand le modèle User sera disponible
    // const user = await User.findByIdAndDelete(req.params.id);
    // if (!user) {
    //   return next(new AppError('Aucun utilisateur trouvé avec cet ID', 404));
    // }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir le profil de l'utilisateur connecté
 */
exports.getMe = (req, res, next) => {
  req.params.id = req.userId;
  next();
};

/**
 * Mettre à jour le profil de l'utilisateur connecté
 */
exports.updateMe = async (req, res, next) => {
  try {
    // 1) Créer une erreur si l'utilisateur essaie de mettre à jour son mot de passe
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'Cette route n\'est pas pour les mises à jour de mot de passe. Veuillez utiliser /update-password.',
          400
        )
      );
    }
    
    // 2) Filtrer les champs non autorisés
    const filteredBody = filterObj(
      req.body,
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'company',
      'address'
    );
    
    // 3) Mettre à jour le document utilisateur
    // Note: Cette partie sera implémentée quand le modèle User sera disponible
    // const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    //   new: true,
    //   runValidators: true
    // });
    
    // Simuler un utilisateur pour le moment
    const updatedUser = {
      _id: req.userId,
      ...filteredBody
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Désactiver le compte de l'utilisateur connecté
 */
exports.deleteMe = async (req, res, next) => {
  try {
    // Note: Cette partie sera implémentée quand le modèle User sera disponible
    // await User.findByIdAndUpdate(req.user.id, { active: false });
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
