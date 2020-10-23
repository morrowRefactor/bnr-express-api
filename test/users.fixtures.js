function makeUsersArray() {
    return [
        {
            id: 1,
            name: 'John Doe',
            password: 'Mypassword64!',
            joined_date: new Date('2020-01-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 2,
            name: 'Jane Doe',
            password: '$2a$12$tLaw6.LCTFPhPOok06s7Eu2vRJ/ocUdO86cyqnEpPaBp2XXpvKcWu',
            joined_date: new Date('2020-01-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 3,
            name: 'Joe Thornton',
            password: '$2a$12$tLaw6.LCTFPhPOok06s7Eu2vRJ/ocUdO86cyqnEpPaBp2XXpvKcWu',
            joined_date: new Date('2020-01-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 4,
            name: 'Brent Burns',
            password: '$2a$12$tLaw6.LCTFPhPOok06s7Eu2vRJ/ocUdO86cyqnEpPaBp2XXpvKcWu',
            joined_date: new Date('2020-01-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        }
    ];
};

function makeMaliciousUser() {
    const maliciousUser = {
        id: 911,
        name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        password: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
    };
    const expectedUser = {
        ...maliciousUser,
        name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        password: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    };
    return {
        maliciousUser,
        expectedUser
    };
};

module.exports = {
    makeUsersArray,
    makeMaliciousUser
};