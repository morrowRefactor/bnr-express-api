function makeVidResourcesArray() {
    return [
        {
            id: 1,
            description: 'This link was really useful',
            link: 'https://www.google.com/',
            vid_id: 1
        },
        {
            id: 2,
            description: 'This link was also super insightful',
            link: 'https://www.google.com/',
            vid_id: 1
        },
        {
            id: 3,
            description: 'Be sure to check this out for extra reading',
            link: 'https://www.google.com/',
            vid_id: 1
        },
        {
            id: 4,
            description: 'This link was really useful',
            link: 'https://www.google.com/',
            vid_id: 2
        },
        {
            id: 5,
            description: 'This link was also super insightful',
            link: 'https://www.google.com/',
            vid_id: 2
        },
        {
            id: 6,
            description: 'This link was really useful',
            link: 'https://www.google.com/',
            vid_id: 3
        },
        {
            id: 7,
            description: 'This link was also super insightful',
            link: 'https://www.google.com/',
            vid_id: 3
        },
        {
            id: 8,
            description: 'This link was really useful',
            link: 'https://www.google.com/',
            vid_id: 5
        },
        {
            id: 9,
            description: 'This link was also super insightful',
            link: 'https://www.google.com/',
            vid_id: 5
        },
        {
            id: 10,
            description: 'Be sure to check this out for extra reading',
            link: 'https://www.google.com/',
            vid_id: 5
        },
        {
            id: 11,
            description: 'This link was really useful',
            link: 'https://www.google.com/',
            vid_id: 7
        },
        {
            id: 12,
            description: 'This link was also super insightful',
            link: 'https://www.google.com/',
            vid_id: 8
        },
        {
            id: 13,
            description: 'Be sure to check this out for extra reading',
            link: 'https://www.google.com/',
            vid_id: 8
        }
    ]
};

function makeMaliciousVidResource() {
    const maliciousVidResource = [{
        id: 911,
        description: 'Naughty naughty very naughty <script>alert("xss");</script>',
        link: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        vid_id: 2
    }];
    const expectedVidResource = [{
        ...maliciousVidResource,
        id: 911,
        description: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        link: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
        vid_id: 2
    }];
    return {
        maliciousVidResource,
        expectedVidResource
    };
};

module.exports = {
    makeVidResourcesArray,
    makeMaliciousVidResource
};