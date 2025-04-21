/**
 * @swagger
 * tags:
 *   name: Services
 *   description: API de gestion des services
 */

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Récupérer tous les services
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [frontend, backend, fullstack, mobile, design, seo, other]
 *         description: Filtrer par catégorie
 *       - in: query
 *         name: isPopular
 *         schema:
 *           type: boolean
 *         description: Filtrer les services populaires
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Inclure les services inactifs (admin uniquement)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page à afficher
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Champ de tri (préfixé par - pour ordre décroissant)
 *     responses:
 *       200:
 *         description: Liste des services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   description: Nombre de services retournés
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Nombre total de services
 *                     page:
 *                       type: integer
 *                       description: Page actuelle
 *                     pages:
 *                       type: integer
 *                       description: Nombre total de pages
 *                     limit:
 *                       type: integer
 *                       description: Nombre d'éléments par page
 *                 data:
 *                   type: object
 *                   properties:
 *                     services:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Service'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     summary: Créer un nouveau service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - shortDescription
 *               - price
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 description: Titre du service
 *               description:
 *                 type: string
 *                 description: Description complète du service
 *               shortDescription:
 *                 type: string
 *                 description: Description courte du service
 *               icon:
 *                 type: string
 *                 description: Icône du service (classe Font Awesome)
 *               image:
 *                 type: string
 *                 description: Image du service (chemin du fichier)
 *               price:
 *                 type: number
 *                 description: Prix du service
 *               priceDiscount:
 *                 type: number
 *                 description: Prix réduit du service (optionnel)
 *               duration:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: number
 *                     description: Valeur de la durée
 *                   unit:
 *                     type: string
 *                     description: Unité de la durée (jours, semaines, mois)
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Fonctionnalités incluses dans le service
 *               category:
 *                 type: string
 *                 enum: [frontend, backend, fullstack, mobile, design, seo, other]
 *                 description: Catégorie du service
 *               isActive:
 *                 type: boolean
 *                 description: Indique si le service est actif
 *               isPopular:
 *                 type: boolean
 *                 description: Indique si le service est populaire
 *     responses:
 *       201:
 *         description: Service créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     service:
 *                       $ref: '#/components/schemas/Service'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Récupérer un service par son ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du service
 *     responses:
 *       200:
 *         description: Service trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     service:
 *                       $ref: '#/components/schemas/Service'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   patch:
 *     summary: Mettre à jour un service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Titre du service
 *               description:
 *                 type: string
 *                 description: Description complète du service
 *               shortDescription:
 *                 type: string
 *                 description: Description courte du service
 *               icon:
 *                 type: string
 *                 description: Icône du service (classe Font Awesome)
 *               image:
 *                 type: string
 *                 description: Image du service (chemin du fichier)
 *               price:
 *                 type: number
 *                 description: Prix du service
 *               priceDiscount:
 *                 type: number
 *                 description: Prix réduit du service (optionnel)
 *               duration:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: number
 *                     description: Valeur de la durée
 *                   unit:
 *                     type: string
 *                     description: Unité de la durée (jours, semaines, mois)
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Fonctionnalités incluses dans le service
 *               category:
 *                 type: string
 *                 enum: [frontend, backend, fullstack, mobile, design, seo, other]
 *                 description: Catégorie du service
 *               isActive:
 *                 type: boolean
 *                 description: Indique si le service est actif
 *               isPopular:
 *                 type: boolean
 *                 description: Indique si le service est populaire
 *     responses:
 *       200:
 *         description: Service mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     service:
 *                       $ref: '#/components/schemas/Service'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   delete:
 *     summary: Supprimer un service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du service
 *     responses:
 *       204:
 *         description: Service supprimé avec succès
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /services/stats:
 *   get:
 *     summary: Obtenir les statistiques des services
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Statistiques des services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Catégorie
 *                           numServices:
 *                             type: integer
 *                             description: Nombre de services
 *                           avgRating:
 *                             type: number
 *                             description: Note moyenne
 *                           avgPrice:
 *                             type: number
 *                             description: Prix moyen
 *                           minPrice:
 *                             type: number
 *                             description: Prix minimum
 *                           maxPrice:
 *                             type: number
 *                             description: Prix maximum
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /services/{id}/toggle-active:
 *   patch:
 *     summary: Activer/désactiver un service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du service
 *     responses:
 *       200:
 *         description: Statut du service modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     service:
 *                       $ref: '#/components/schemas/Service'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /services/{id}/toggle-popular:
 *   patch:
 *     summary: Marquer/démarquer un service comme populaire
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du service
 *     responses:
 *       200:
 *         description: Statut populaire du service modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     service:
 *                       $ref: '#/components/schemas/Service'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
