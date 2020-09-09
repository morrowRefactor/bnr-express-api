function makeTagsArray() {
    return [
        {
            id: 1,
            tag: 'Politics'
        },
        {
            id: 2,
            tag: 'Economics'
        },
        {
            id: 3,
            tag: 'History'
        }
    ];
};

function makeMaliciousTag() {
    const maliciousTag = {
        id: 911,
        tag: 'Naughty naughty very naughty <script>alert("xss");</script>'
    };
    const expectedTag = {
        ...maliciousTag,
        tag: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
    };
    return {
        maliciousTag,
        expectedTag
    };
};

module.exports = {
    makeTagsArray,
    makeMaliciousTag
};