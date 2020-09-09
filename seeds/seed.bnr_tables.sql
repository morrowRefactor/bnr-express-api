BEGIN;

TRUNCATE
  comments,
  vid_resources,
  vid_tags,
  videos,
  tags,
  users
    RESTART IDENTITY CASCADE
;

INSERT INTO users (name, password)
  VALUES
    ('John Doe', '$2a$12$tLaw6.LCTFPhPOok06s7Eu2vRJ/ocUdO86cyqnEpPaBp2XXpvKcWu'),
    ('Jane Doe', '$2a$12$cR/rZfYOHfQNrdrYfQVSRu1VDDq/uT511KwEaQupZtvATFJKS4M3G'),
    ('Joe Thornton', '$2a$12$0T1b6teoGy1sfCZkMHf70.rEp/6su.08ly2PeRq7M30EhnRFugvcq'),
    ('Brent Burns', '$2a$12$wSYt3vAoQcS1DiC.HwYUy.U1HvQ2jmSZGJIHGHeWAm3Hpwc3.vIza')
;

INSERT INTO tags (tag)
  VALUES
    ('Politics'),
    ('Economics'),
    ('History')
;

INSERT INTO videos (title, date_posted, description, embed_code)
  VALUES
    ('Political Video 1', '2020-08-25', 'A video discussing politcal issues.', '<iframe width="560" height="315" src="https://www.youtube.com/embed/cywyb3Y6Qxg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'),
    ('Political Video 2', '2020-07-12', 'A video discussing politcal issues and economics.', '<iframe width="560" height="315" src="https://www.youtube.com/embed/cywyb3Y6Qxg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'),
    ('Political Video 3', '2020-04-23', 'A video discussing politcal issues and history.', '<iframe width="560" height="315" src="https://www.youtube.com/embed/cywyb3Y6Qxg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'),
    ('Historical Video 1', '2020-09-02', 'A video discussing interesting historical stuff', '<iframe width="560" height="315" src="https://www.youtube.com/embed/cywyb3Y6Qxg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'),
    ('Historical Video 2', '2020-05-08', 'A video discussing interesting historical stuff and economic stuff', '<iframe width="560" height="315" src="https://www.youtube.com/embed/cywyb3Y6Qxg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'),
    ('Economics Video 1', '2020-06-02', 'A video discussing matters of economics', '<iframe width="560" height="315" src="https://www.youtube.com/embed/cywyb3Y6Qxg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'),
    ('Economics Video 2', '2020-02-22', 'A video discussing matters of economics and politics and history', '<iframe width="560" height="315" src="https://www.youtube.com/embed/cywyb3Y6Qxg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'),
    ('Economics Video 3', '2020-03-27', 'A video discussing matters of economics and politics', '<iframe width="560" height="315" src="https://www.youtube.com/embed/cywyb3Y6Qxg" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>')
;

INSERT INTO vid_tags (vid, tag_id)
  VALUES
    (1, 1),
    (2, 1),
    (2, 2),
    (3, 1),
    (3, 3),
    (4, 3),
    (5, 2),
    (5, 2),
    (6, 2),
    (7, 1),
    (7, 2),
    (7, 3),
    (8, 1),
    (8, 2)
;

INSERT INTO vid_resources (description, link, vid)
  VALUES
    ('This link was really useful', 'https://www.google.com/', 1),
    ('This link was also super insightful', 'https://www.google.com/', 1),
    ('Be sure to check this out for extra reading', 'https://www.google.com/', 1),
    ('This link was really useful', 'https://www.google.com/', 2),
    ('This link was also super insightful', 'https://www.google.com/', 2),
    ('This link was really useful', 'https://www.google.com/', 3),
    ('This link was also super insightful', 'https://www.google.com/', 3),
    ('This link was really useful', 'https://www.google.com/', 5),
    ('This link was also super insightful', 'https://www.google.com/', 5),
    ('Be sure to check this out for extra reading', 'https://www.google.com/', 5),
    ('This link was really useful', 'https://www.google.com/', 7),
    ('This link was also super insightful', 'https://www.google.com/', 8),
    ('Be sure to check this out for extra reading', 'https://www.google.com/', 8)
;

INSERT INTO comments (comment, date_posted, uid, vid)
  VALUES
    ('This video rocks!!', '2020-08-01', 1, 3),
    ('Such a good video!  Very interesting!', '2020-09-01', 3, 3),
    ('Really important topic.  Good stuff', '2020-08-30', 1, 1),
    ('This video rocks!!', '2020-09-01', 2, 1),
    ('Mmmmm... beer', '2020-09-02', 4, 1),
    ('This guy is onto something', '2020-05-20', 3, 5),
    ('This video rocks!!', '2020-06-03', 2, 5),
    ('Nice!', '2020-06-21', 4, 5),
    ('This video rocks!!', '2020-03-04', 2, 7),
    ('Really important topic.  Good stuff', '2020-03-04', 3, 7),
    ('Mmmmm... beer', '2020-04-01', 4, 7),
    ('This video rocks!!', '2020-04-06', 1, 8),
    ('This video rocks!!', '2020-04-11', 3, 8),
    ('This video rocks!!', '2020-04-13', 2, 8),
    ('This video rocks!!', '2020-05-16', 4, 8)
;

COMMIT;