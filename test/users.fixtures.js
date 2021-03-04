const bcrypt = require('bcryptjs');

function makeUsersArray() {
    return [
        {
            id: 1,
            name: 'John Doe',
            email: 'someemail@gmail.com',
            password: 'Something12!',
            about: '',
            joined_date: new Date('2020-01-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 2,
            name: 'Jane Doe',
            email: 'someemail@gmail.com',
            password: 'Something12!',
            about: '',
            joined_date: new Date('2020-01-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 3,
            name: 'Joe Thornton',
            email: 'someemail@gmail.com',
            password: 'Something12!',
            about: '',
            joined_date: new Date('2020-01-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 4,
            name: 'Brent Burns',
            email: 'someemail@gmail.com',
            password: 'Something12!',
            about: '',
            joined_date: new Date('2020-01-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        }
    ];
};

function usersSansPassword() {
    return [
        {
            id: 1,
            name: 'John Doe',
            email: 'someemail@gmail.com',
            about: '',
            joined_date: new Date('2020-01-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 2,
            name: 'Jane Doe',
            email: 'someemail@gmail.com',
            about: '',
            joined_date: new Date('2020-01-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 3,
            name: 'Joe Thornton',
            email: 'someemail@gmail.com',
            about: '',
            joined_date: new Date('2020-01-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 4,
            name: 'Brent Burns',
            email: 'someemail@gmail.com',
            about: '',
            joined_date: new Date('2020-01-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        }
    ];
};

function makeMaliciousUser() {
    const maliciousUser = {
        id: 911,
        name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        email: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        password: 'Something12!'
    };
    const expectedUser = {
        ...maliciousUser,
        name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        email: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    };
    return {
        maliciousUser,
        expectedUser
    };
};

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('users').insert(preppedUsers)
      .then(() =>
        // update the auto sequence to stay in sync
        db.raw(
          `SELECT setval('users_id_seq', ?)`,
          [users[users.length - 1].id],
        )
      )
};

module.exports = {
    makeUsersArray,
    usersSansPassword,
    makeMaliciousUser,
    seedUsers
};