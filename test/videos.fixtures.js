function makeVideosArray() {
    return [
        {
            id: 1,
            title: 'Political Video 1',
            description: 'A video discussing politcal issues.',
            embed_code: '<iframe width="560" height="315" src="https://www.youtube.com/embed/cywyb3Y6Qxg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
            date_posted: new Date('2020-01-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 2,
            title: 'Political Video 2',
            description: 'A video discussing politcal issues and economics.',
            embed_code: '<iframe width="560" height="315" src="https://www.youtube.com/embed/cywyb3Y6Qxg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
            date_posted: new Date('2020-03-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 3,
            title: 'Political Video 3',
            description: 'A video discussing politcal issues and history.',
            embed_code: '<iframe width="560" height="315" src="https://www.youtube.com/embed/cywyb3Y6Qxg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
            date_posted: new Date('2020-06-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 4,
            title: 'Historical Video 1',
            description: 'A video discussing interesting historical stuff.',
            embed_code: '<iframe width="560" height="315" src="https://www.youtube.com/embed/cywyb3Y6Qxg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
            date_posted: new Date('2020-02-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 5,
            title: 'Historical Video 2',
            description: 'A video discussing interesting historical and economic stuff.',
            embed_code: '<iframe width="560" height="315" src="https://www.youtube.com/embed/cywyb3Y6Qxg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
            date_posted: new Date('2020-01-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 6,
            title: 'Economics Video 1',
            description: 'A video discussing matters of economics.',
            embed_code: '<iframe width="560" height="315" src="https://www.youtube.com/embed/cywyb3Y6Qxg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
            date_posted: new Date('2020-07-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 7,
            title: 'Economics Video 2',
            description: 'A video discussing matters of economics and politics and history.',
            embed_code: '<iframe width="560" height="315" src="https://www.youtube.com/embed/cywyb3Y6Qxg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
            date_posted: new Date('2020-08-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
        {
            id: 8,
            title: 'Economics Video 3',
            description: 'A video discussing matters of economics and politics.',
            embed_code: '<iframe width="560" height="315" src="https://www.youtube.com/embed/cywyb3Y6Qxg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
            date_posted: new Date('2020-04-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        },
    ];
};

function makeMaliciousVideo() {
    const maliciousVideo = {
        id: 911,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        embed_code: 'some embed code',
        date_posted: new Date('2020-04-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
    };
    const expectedVideo = {
        ...maliciousVideo,
        title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
        embed_code: 'some embed code',
        date_posted: new Date('2020-04-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
    };
    return {
        maliciousVideo,
        expectedVideo
    };
};

module.exports = {
    makeVideosArray,
    makeMaliciousVideo
};