const express = require('express');
const multer = require('multer');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const prizeService = require('./prize.service');

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const isValid = MIME_TYPE_MAP[file.mimetype];
      let error = new Error('Invalid format image');
      if(isValid) {
        error = null;
      }
      cb(error, '../assets/prizes');
    },
    filename: (req, file, cb) => {
      const name = file.originalname.toLowerCase().split(' ').join('-');
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, name);
    }
});

// routes
router.post('/store', storeSchema, store);
router.post('/image', multer({storage: storage}).single("image"), uploadImage);
router.get('/', authorize(), getAll);
router.get('/id/:name&:user', authorize(), getByNameAndUser);
router.get('/user/:user', authorize(), getByUser);
router.get('/category/:category', authorize(), getByCategory);
router.get('/timeleft/:user', authorize(), getByTimeLeft);
router.put('/:name&:user', authorize(), updateSchema, update);
router.delete('/:name&:user', authorize(), _delete);

module.exports = router;

function storeSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().required(),
        cost: Joi.number().required(),
        category: Joi.number().required(),
        picture: Joi.any(),
        time_end: Joi.date(),
        countdown_time: Joi.number(),
        user: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function store(req, res, next) {
    prizeService.create(req.body)
        .then(() => res.json({ message: 'Prize stored successfully' }))
        .catch(next);
}

function getAll(req, res, next) {
    prizeService.getAll()
        .then(prizes => res.json(prizes))
        .catch(next);
}

function getByNameAndUser(req, res, next) {
    prizeService.getById(req.params.name, req.params.user)
        .then(prize => res.json(prize))
        .catch(next);
}

function getByUser(req, res, next) {
    prizeService.getByUser(req.params.user)
        .then(prize => res.json(prize))
        .catch(next);
}

function getByCategory(req, res, next) {
    prizeService.getByCategory(req.params.category)
        .then(prize => res.json(prize))
        .catch(next);
}

function getByTimeLeft(req, res, next) {
    prizeService.getByTimeLeft(req.params.user)
        .then(prize => res.json(prize))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().required(),
        cost: Joi.number().required(),
        category: Joi.number().required(),
        picture: Joi.any(),
        already_won: Joi.boolean(),
        won_date: Joi.any(),
        time_end: Joi.date(),
        countdown_time: Joi.number(),
        user: Joi.string()
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    prizeService.update(req.params.name, req.params.user, req.body)
        .then(user => res.json(user))
        .catch(next);
}

function _delete(req, res, next) {
    prizeService.delete(req.params.name, req.params.user)
        .then(() => res.json({ message: 'Prize deleted successfully' }))
        .catch(next);
}

function uploadImage(req, res, next) {
    return res.send({ 
        success: true,
        message: 'Picture uploaded successfully!'});
}