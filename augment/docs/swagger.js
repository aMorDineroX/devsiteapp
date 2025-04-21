const swaggerJSDoc = require('swagger-jsdoc');
const config = require('../config');

// Options de base pour Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DevCraft API',
      version: '1.0.0',
      description: 'API pour la plateforme DevCraft de services de développement web',
      contact: {
        name: 'DevCraft Support',
        email: 'support@devcraft.com',
        url: config.server.appUrl
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: `${config.server.appUrl}/api/v1`,
        description: 'Serveur principal'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwt'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique de l\'utilisateur'
            },
            firstName: {
              type: 'string',
              description: 'Prénom de l\'utilisateur'
            },
            lastName: {
              type: 'string',
              description: 'Nom de l\'utilisateur'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Adresse email de l\'utilisateur'
            },
            role: {
              type: 'string',
              enum: ['client', 'admin'],
              description: 'Rôle de l\'utilisateur'
            },
            company: {
              type: 'string',
              description: 'Entreprise de l\'utilisateur (optionnel)'
            },
            phoneNumber: {
              type: 'string',
              description: 'Numéro de téléphone de l\'utilisateur (optionnel)'
            },
            profileImage: {
              type: 'string',
              description: 'Chemin de l\'image de profil de l\'utilisateur (optionnel)'
            },
            active: {
              type: 'boolean',
              description: 'Indique si le compte de l\'utilisateur est actif'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création du compte'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière mise à jour du compte'
            }
          }
        },
        Service: {
          type: 'object',
          required: ['title', 'description', 'shortDescription', 'price', 'category'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique du service'
            },
            title: {
              type: 'string',
              description: 'Titre du service'
            },
            slug: {
              type: 'string',
              description: 'Slug du service pour les URL'
            },
            description: {
              type: 'string',
              description: 'Description complète du service'
            },
            shortDescription: {
              type: 'string',
              description: 'Description courte du service'
            },
            icon: {
              type: 'string',
              description: 'Icône du service (classe Font Awesome)'
            },
            image: {
              type: 'string',
              description: 'Image du service (chemin du fichier)'
            },
            price: {
              type: 'number',
              description: 'Prix du service'
            },
            priceDiscount: {
              type: 'number',
              description: 'Prix réduit du service (optionnel)'
            },
            duration: {
              type: 'object',
              properties: {
                value: {
                  type: 'number',
                  description: 'Valeur de la durée'
                },
                unit: {
                  type: 'string',
                  description: 'Unité de la durée (jours, semaines, mois)'
                }
              }
            },
            features: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Fonctionnalités incluses dans le service'
            },
            category: {
              type: 'string',
              enum: ['frontend', 'backend', 'fullstack', 'mobile', 'design', 'seo', 'other'],
              description: 'Catégorie du service'
            },
            isActive: {
              type: 'boolean',
              description: 'Indique si le service est actif'
            },
            isPopular: {
              type: 'boolean',
              description: 'Indique si le service est populaire'
            },
            ratingsAverage: {
              type: 'number',
              description: 'Note moyenne du service'
            },
            ratingsQuantity: {
              type: 'number',
              description: 'Nombre de notes du service'
            },
            createdBy: {
              type: 'string',
              description: 'ID de l\'utilisateur qui a créé le service'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création du service'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière mise à jour du service'
            }
          }
        },
        Project: {
          type: 'object',
          required: ['name', 'client'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique du projet'
            },
            name: {
              type: 'string',
              description: 'Nom du projet'
            },
            description: {
              type: 'string',
              description: 'Description du projet'
            },
            client: {
              type: 'string',
              description: 'ID du client associé au projet'
            },
            status: {
              type: 'string',
              enum: ['nouveau', 'en cours', 'en revue', 'terminé', 'annulé'],
              description: 'Statut du projet'
            },
            progress: {
              type: 'number',
              description: 'Progression du projet en pourcentage'
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date de début du projet'
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date de fin du projet'
            },
            totalAmount: {
              type: 'number',
              description: 'Montant total du projet'
            },
            paidAmount: {
              type: 'number',
              description: 'Montant payé pour le projet'
            },
            tasks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    description: 'Titre de la tâche'
                  },
                  description: {
                    type: 'string',
                    description: 'Description de la tâche'
                  },
                  status: {
                    type: 'string',
                    enum: ['à faire', 'en cours', 'en revue', 'terminée'],
                    description: 'Statut de la tâche'
                  },
                  priority: {
                    type: 'string',
                    enum: ['basse', 'moyenne', 'haute', 'urgente'],
                    description: 'Priorité de la tâche'
                  },
                  dueDate: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Date d\'échéance de la tâche'
                  },
                  completedAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Date de complétion de la tâche'
                  },
                  assignedTo: {
                    type: 'string',
                    description: 'ID de l\'utilisateur assigné à la tâche'
                  }
                }
              }
            },
            documents: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Nom du document'
                  },
                  path: {
                    type: 'string',
                    description: 'Chemin du document'
                  },
                  uploadedBy: {
                    type: 'string',
                    description: 'ID de l\'utilisateur qui a téléchargé le document'
                  },
                  uploadedAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Date de téléchargement du document'
                  }
                }
              }
            },
            createdBy: {
              type: 'string',
              description: 'ID de l\'utilisateur qui a créé le projet'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création du projet'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière mise à jour du projet'
            }
          }
        },
        Order: {
          type: 'object',
          required: ['user', 'services', 'totalAmount'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique de la commande'
            },
            invoiceNumber: {
              type: 'string',
              description: 'Numéro de facture'
            },
            user: {
              type: 'string',
              description: 'ID de l\'utilisateur qui a passé la commande'
            },
            services: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  service: {
                    type: 'string',
                    description: 'ID du service commandé'
                  },
                  quantity: {
                    type: 'number',
                    description: 'Quantité commandée'
                  },
                  price: {
                    type: 'number',
                    description: 'Prix unitaire au moment de la commande'
                  }
                }
              }
            },
            project: {
              type: 'string',
              description: 'ID du projet associé à la commande (optionnel)'
            },
            status: {
              type: 'string',
              enum: ['en attente', 'payée', 'livrée', 'annulée'],
              description: 'Statut de la commande'
            },
            totalAmount: {
              type: 'number',
              description: 'Montant total de la commande'
            },
            paymentMethod: {
              type: 'string',
              enum: ['carte', 'virement', 'paypal'],
              description: 'Méthode de paiement'
            },
            paymentId: {
              type: 'string',
              description: 'ID de la transaction de paiement'
            },
            paymentDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date du paiement'
            },
            billingAddress: {
              type: 'object',
              properties: {
                firstName: {
                  type: 'string',
                  description: 'Prénom de facturation'
                },
                lastName: {
                  type: 'string',
                  description: 'Nom de facturation'
                },
                company: {
                  type: 'string',
                  description: 'Entreprise de facturation'
                },
                address: {
                  type: 'string',
                  description: 'Adresse de facturation'
                },
                city: {
                  type: 'string',
                  description: 'Ville de facturation'
                },
                zipCode: {
                  type: 'string',
                  description: 'Code postal de facturation'
                },
                country: {
                  type: 'string',
                  description: 'Pays de facturation'
                },
                email: {
                  type: 'string',
                  description: 'Email de facturation'
                },
                phoneNumber: {
                  type: 'string',
                  description: 'Numéro de téléphone de facturation'
                }
              }
            },
            invoiceUrl: {
              type: 'string',
              description: 'URL de la facture'
            },
            notes: {
              type: 'string',
              description: 'Notes sur la commande'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création de la commande'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière mise à jour de la commande'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string',
              example: 'Une erreur est survenue'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Accès refusé. Authentification requise.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'error',
                message: 'Veuillez vous connecter pour accéder à cette ressource'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Accès interdit. Permissions insuffisantes.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'error',
                message: 'Vous n\'avez pas la permission d\'effectuer cette action'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Ressource non trouvée.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'error',
                message: 'Ressource non trouvée'
              }
            }
          }
        },
        ValidationError: {
          description: 'Erreur de validation des données.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'error',
                message: 'Données invalides'
              }
            }
          }
        },
        ServerError: {
          description: 'Erreur serveur interne.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'error',
                message: 'Une erreur est survenue sur le serveur'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      },
      {
        cookieAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './docs/routes/*.js'
  ]
};

// Initialiser Swagger
const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec;
