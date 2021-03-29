const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const { Op, Sequelize } = require('sequelize')

module.exports = {
    getAll,
    getByNameAndUser,
    getByUser,
    getByCategory,
    getByTimeLeft,
    create,
    update,
    delete: _delete
};

async function getAll() {
    return await db.Prize.findAll();
}

async function getByUser(username) {
    return await db.Prize.findAll({ where: { user: username}});
}

async function getByCategory(category) {
    return await db.Prize.findAll({ where: { category: category}});
}

async function getByTimeLeft(username) {
    return await db.Prize.findAll({ 
        where: { user: username }
    });
}

async function getByNameAndUser(name, user) {
    return await getPrize(name, user);
}

async function create(params) {
    // validate
    if (await getPrize(params.name, params.user)) {
        throw 'Prize "' + params.name + '" already exists';
    }

    // save prize
    await db.Prize.create(params);
}

async function update(name, user, params) {
    const prize = await getPrize(name, user);
    // validate
    if (!prize) throw 'Prize not found';
    if ((prize.name !== params.name || prize.user !== params.user) && await getPrize(params.name, params.user)) {
        throw 'Name "' + params.name + '" is already taken';
    }

    // copy params to prize and save
    Object.assign(prize, params);
    await prize.save();

    return prize.get();
}

async function _delete(name, user) {
    const prize = await getPrize(name, user);
    await prize.destroy();
}

// helper functions

async function getPrize(name, user) {
    const prize = await db.Prize.findOne({
        where: {
          name: name,
          user: user, 
        },
      });
    return prize;
}