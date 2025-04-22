const express = require('express');
const router = express.Router();

// Liste des services
router.get('/', (req, res) => {
  // Données factices pour les services
  const services = [
    {
      id: 1,
      title: 'Développement Frontend',
      description: 'Interfaces utilisateur réactives et intuitives avec React, Vue.js ou Angular pour une expérience utilisateur exceptionnelle.',
      icon: 'laptop-code',
      price: 'À partir de 2500€',
      features: ['Design responsive', 'Animations fluides', 'Optimisation SEO']
    },
    {
      id: 2,
      title: 'Développement Backend',
      description: 'Architectures backend robustes et sécurisées avec Node.js, Django ou Laravel pour des performances optimales.',
      icon: 'server',
      price: 'À partir de 3200€',
      features: ['API RESTful', 'Bases de données', 'Authentification']
    },
    {
      id: 3,
      title: 'Applications Mobiles',
      description: 'Applications cross-platform avec React Native ou Flutter pour toucher vos utilisateurs sur tous les appareils.',
      icon: 'mobile-alt',
      price: 'À partir de 4500€',
      features: ['iOS et Android', 'Performances natives', 'Publication sur stores']
    }
  ];
  
  res.render('services/index', { 
    title: 'Nos Services', 
    services
  });
});

// Détails d'un service
router.get('/:id', (req, res) => {
  // Dans un cas réel, on récupérerait le service depuis la base de données
  const serviceId = parseInt(req.params.id);
  
  // Service factice
  const service = {
    id: serviceId,
    title: 'Développement Frontend',
    description: 'Interfaces utilisateur réactives et intuitives avec React, Vue.js ou Angular pour une expérience utilisateur exceptionnelle.',
    longDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl. Nullam euismod, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl.',
    icon: 'laptop-code',
    price: 'À partir de 2500€',
    features: ['Design responsive', 'Animations fluides', 'Optimisation SEO'],
    technologies: ['React', 'Vue.js', 'Angular', 'TailwindCSS'],
    process: [
      {step: 1, title: 'Analyse des besoins', description: 'Nous analysons vos besoins et définissons ensemble les objectifs du projet.'},
      {step: 2, title: 'Design & Prototypage', description: 'Nous créons des maquettes et prototypes pour valider l\'interface utilisateur.'},
      {step: 3, title: 'Développement', description: 'Notre équipe développe votre interface avec les technologies adaptées.'},
      {step: 4, title: 'Tests & Déploiement', description: 'Nous testons rigoureusement et déployons votre interface.'}
    ]
  };
  
  if (serviceId > 0 && serviceId < 4) {
    res.render('services/details', { 
      title: `Service: ${service.title}`, 
      service
    });
  } else {
    res.status(404).render('404', { title: 'Service non trouvé' });
  }
});

module.exports = router;