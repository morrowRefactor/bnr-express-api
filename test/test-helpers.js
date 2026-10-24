const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 6)
    }));

    return db.into('users').insert(preppedUsers)
        .then(() =>
        // update the auto sequence to stay in sync
            db.raw(
                `SELECT setval('users_id_seq', ?)`,
                [users[users.length - 1].id],
            )
    );
};

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ id: user.id }, secret, {
        subject: user.email,
        algorithm: 'HS256',
    });
    return `Bearer ${token}`;
};

module.exports = {
    seedUsers,
    makeAuthHeader
};