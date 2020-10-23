const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeCommentsArray() {
    return [
        {
            id: 1,
            comment: 'This video rocks!!',
            uid: 1,
            vid_id: 3,
            date_posted: new Date('2020-01-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 2,
            comment: 'Such a good video!  Very interesting!',
            uid: 3,
            vid_id: 3,
            date_posted: new Date('2020-02-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 3,
            comment: 'Really important topic.  Good stuff',
            uid: 1,
            vid_id: 1,
            date_posted: new Date('2020-04-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 4,
            comment: 'This video rocks!!',
            uid: 2,
            vid_id: 1,
            date_posted: new Date('2020-01-28T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 5,
            comment: 'Mmmmm... beer',
            uid: 4,
            vid_id: 1,
            date_posted: new Date('2020-04-23T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 6,
            comment: 'This guy is onto something',
            uid: 3,
            vid_id: 5,
            date_posted: new Date('2020-05-08T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 7,
            comment: 'This video rocks!!',
            uid: 2,
            vid_id: 5,
            date_posted: new Date('2020-10-10T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 8,
            comment: 'Nice!',
            uid: 4,
            vid_id: 5,
            date_posted: new Date('2020-11-02T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 9,
            comment: 'This video rocks!!',
            uid: 2,
            vid_id: 7,
            date_posted: new Date('2020-07-28T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 10,
            comment: 'Really important topic.  Good stuff',
            uid: 3,
            vid_id: 7,
            date_posted: new Date('2020-06-19T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 11,
            comment: 'Mmmmm... beer',
            uid: 4,
            vid_id: 7,
            date_posted: new Date('2020-12-30T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 12,
            comment: 'This video rocks!!',
            uid: 1,
            vid_id: 8,
            date_posted: new Date('2020-11-01T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 13,
            comment: 'This video rocks!!',
            uid: 3,
            vid_id: 8,
            date_posted: new Date('2020-02-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 14,
            comment: 'This video rocks!!',
            uid: 2,
            vid_id: 8,
            date_posted: new Date('2020-03-25T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 15,
            comment: 'This video rocks!!',
            uid: 4,
            vid_id: 8,
            date_posted: new Date('2020-08-17T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        }
    ]
};

function makeMaliciousComment() {
    const maliciousComment = {
        id: 911,
        comment: 'Naughty naughty very naughty <script>alert("xss");</script>',
        uid: 2,
        vid_id: 2,
        date_posted: new Date('2020-08-17T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
    };
    const expectedComment = {
        ...maliciousComment,
        comment: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        uid: 2,
        vid_id: 2,
        date_posted: new Date('2020-08-17T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
    };
    return {
        maliciousComment,
        expectedComment
    };
};

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
      subject: user.name,
      algorithm: 'HS256',
    })
    return `Bearer ${token}`
;}

module.exports = {
    makeCommentsArray,
    makeMaliciousComment,
    makeAuthHeader
};