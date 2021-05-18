const express = require('express');
const router = express.Router();
const _ = require('lodash');
const log = require('../lib/logger')();

const users = require('../init_data.json').data;
let curId = _.size(users);

/* GET users listing. */
router.get('/', (req, res) => {
    res.json(_.toArray(users));
});

/* Create a new user */
router.post('/', (req, res) => {
    const user = req.body;
    user.id = curId++;
    if (!user.state)
        user.state = 'pending';
    
    users[user.id] = user;
    log.info('Created user', user);
    res.json(user);
});

/* Get a specific user by id */
router.get('/:id', (req, res, next) => {
    const user = users[req.params.id];
    if (!user)
        return next();
    
    res.json(users[req.params.id]);
});

/* Delete a user by id */
router.delete('/:id', (req, res) => {
    const user = users[req.params.id];
    delete users[req.params.id];
    
    res.status(204);
    log.info('Deleted user', user);
    res.json(user);
});

/* Update a user by id */
router.put('/:id', (req, res, next) => {
    const user = req.body;
    if (user.id != req.params.id)
        return next(new Error('ID paramter does not match body'));
        
    users[user.id] = user;
    log.info('Updating user', user);
    res.json(user);
});


module.exports = router;
