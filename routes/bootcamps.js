const express = require('express');
const {
    getBootcamp, 
    getBootcamps, 
    createBootcamp, 
    updateBootcamp, 
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp')
const advancedResults = require('../middlewares/advancedResult');

// Include other resource routers
const courseRouter = require('./courses')

const router = express.Router();

const {protect, authorize} = require('../middlewares/auth');

// Re-route into other resoure routers
router.use('/:bootcampId/courses', courseRouter);

router
.route('/')
.get(advancedResults(Bootcamp, 'courses'), getBootcamps)
.post(protect, authorize('publisher', 'admin'), createBootcamp);

router.route('/:id')
.get(getBootcamp)
.put(protect, authorize('publisher', 'admin'), updateBootcamp)
.delete(protect, authorize('publisher', 'admin'), deleteBootcamp);
 
// Bootcamps by distance (within the radius of a specific zipcode)
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload)

module.exports = router
