function makeVidTagsArray() {
    return [
      {
        id: 1,
        vid_id: 1,
        tag_id: 1
      },
      {
        id: 2,
        vid_id: 2,
        tag_id: 1
      },
      {
        id: 3,
        vid_id: 2,
        tag_id: 2
      },
      {
        id: 4,
        vid_id: 3,
        tag_id: 1
      },
      {
        id: 5,
        vid_id: 3,
        tag_id: 3
      },
      {
        id: 6,
        vid_id: 4,
        tag_id: 3
      },
      {
        id: 7,
        vid_id: 5,
        tag_id: 2
      },
      {
        id: 8,
        vid_id: 5,
        tag_id: 2
      },
      {
        id: 9,
        vid_id: 6,
        tag_id: 2
      },
      {
        id: 10,
        vid_id: 7,
        tag_id: 1
      },
      {
        id: 11,
        vid_id: 7,
        tag_id: 2
      },
      {
        id: 12,
        vid_id: 7,
        tag_id: 3
      },
      {
        id: 13,
        vid_id: 8,
        tag_id: 1
      },
      {
        id: 14,
        vid_id: 8,
        tag_id: 2
      },
    ]
};

function makeMaliciousVidTag() {
  const maliciousVidTag = {
    id: 911,
    vid_id: 'Naughty naughty very naughty <script>alert("xss");</script>',
    tag_id: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
  };
  const expectedVidTag = {
    ...maliciousVidTag,
    vid_id: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    tag_id: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  };
  return {
    maliciousVidTag,
    expectedVidTag,
  };
};
  
  module.exports = {
    makeVidTagsArray,
    makeMaliciousVidTag
  };