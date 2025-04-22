const express = require('express');
const router = express.Router();

// Liste des projets
router.get('/', (req, res) => {
  // Données factices pour les projets
  const projects = [
    {
      id: 1,
      name: 'Boutique en ligne "FashionHub"',
      type: 'e-commerce',
      image: 'shopping-bag',
      description: 'Plateforme e-commerce avec système de recommandation IA et paiements sécurisés.',
      technologies: ['React', 'Node.js', 'MongoDB'],
      color: 'purple'
    },
    {
      id: 2,
      name: 'Dashboard Analytics "DataVision"',
      type: 'dashboard',
      image: 'chart-line',
      description: 'Solution de business intelligence avec visualisation de données en temps réel.',
      technologies: ['Vue.js', 'Django', 'PostgreSQL'],
      color: 'blue'
    },
    {
      id: 3,
      name: 'App Mobile "FitTrack"',
      type: 'application mobile',
      image: 'mobile-alt',
      description: 'Application de suivi d\'activité physique avec synchronisation wearables.',
      technologies: ['Flutter', 'Firebase', 'Google Fit API'],
      color: 'green'
    }
  ];
  
  res.render('projects/index', { 
    title: 'Nos Réalisations', 
    projects
  });
});

// Détails d'un projet
router.get('/:id', (req, res) => {
  const projectId = parseInt(req.params.id);
  
  // Projet factice
  const project = {
    id: projectId,
    name: 'Boutique en ligne "FashionHub"',
    type: 'e-commerce',
    image: 'shopping-bag',
    description: 'Plateforme e-commerce avec système de recommandation IA et paiements sécurisés.',
    longDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl.',
    technologies: ['React', 'Node.js', 'MongoDB'],
    features: [
      'Système de recommandation basé sur l\'IA',
      'Paiements sécurisés multi-devises',
      'Interface d\'administration complète',
      'Optimisation SEO avancée',
      'Design responsive et adaptatif'
    ],
    client: 'FashionHub SAS',
    duration: '4 mois',
    date: 'Janvier 2023',
    results: [
      'Augmentation des ventes de 40%',
      'Réduction du taux de rebond de 25%',
      'Amélioration du taux de conversion de 15%'
    ],
    color: 'purple',
    testimonial: {
      content: 'L\'équipe de DevCraft a transformé notre présence en ligne. Leur application mobile a augmenté nos ventes de 40% en seulement 3 mois.',
      author: 'Sophie Martin',
      position: 'CEO, FashionHub'
    }
  };
  
  if (projectId > 0 && projectId < 4) {
    res.render('projects/details', { 
      title: `Projet: ${project.name}`, 
      project
    });
  } else {
    res.status(404).render('404', { title: 'Projet non trouvé' });
  }
});

module.exports = router;