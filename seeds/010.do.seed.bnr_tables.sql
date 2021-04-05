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

INSERT INTO users (name, email, password)
  VALUES
    ('Some Guy', 'testemail@gmail.com', '$2a$12$bwuDYT.gFDDKyZEEfateXOu91kHw7PkEh1Io0e1LPobTaD0rhxXgK'),
    ('John Doe', 'someemail@gmail.com', '$2a$12$tLaw6.LCTFPhPOok06s7Eu2vRJ/ocUdO86cyqnEpPaBp2XXpvKcWu'),
    ('Jane Doe', 'someemail@gmail.com', '$2a$12$cR/rZfYOHfQNrdrYfQVSRu1VDDq/uT511KwEaQupZtvATFJKS4M3G'),
    ('Joe Thornton', 'someemail@gmail.com', '$2a$12$0T1b6teoGy1sfCZkMHf70.rEp/6su.08ly2PeRq7M30EhnRFugvcq'),
    ('Brent Burns', 'someemail@gmail.com', '$2a$12$wSYt3vAoQcS1DiC.HwYUy.U1HvQ2jmSZGJIHGHeWAm3Hpwc3.vIza')
;

INSERT INTO tags (tag)
  VALUES
    ('Politics'),
    ('Economics'),
    ('History')
;

INSERT INTO videos (title, date_posted, description, youtube_id)
  VALUES
    ('The GameStop Craze', '2021-02-04', 'In one week, GameStop stock went from $30 to over $300.  What made it go up so fast?  What was the driving force?  Are there other stocks doing this?  Well this show will tell why GameStop stock went up and where to look to find others.', 'ozlNMSYiD18'),
    ('US Energy Program 1', '2021-01-28', 'What is the Green New Deal?  Are we headed for it?  Watch and see what the future holds.', '-kSw9jx3Oi8'),
    ('No toothpaste and Zoom meeting 2', '2021-01-20', 'If 9 out of 10 dentist recommend using toothpaste, who was that one dentist who doesn''t?  Well I found him and did an interview.', 'xu6FP7lg63Q'),
    ('Domestic Terrorist', '2021-01-14', 'Wow what happened at the capitol building?  How are we going to stop this?  This show explains how the Patriot Act will be a force against domestic terrorist.', 'xbR9bIRrrUw'),
    ('The Covid Dilemma', '2021-01-06', 'Why is there some much distrust about the covid vaccine and our institutions?  How did it get this way?  I''ll try to answer these questions and give some information about the covid vaccine.', 'ZPQ2rNj8DLU'),
    ('New Year''s Show 2021', '2021-01-01', 'Happy New Year everyone. Here are some highlights of my upcoming shows.', 'j6CRhz2zZ3A'),
    ('BNR Happy Holidays', '2020-11-23', 'Year end highlights of my shows with Christmas music in the background', '9Uv1c_OqAAk'),
    ('BNR Do this now!', '2020-11-09', 'Holidays are coming and your need to take precautions before someone hacks into your accounts.', 'jOFWEc0FH5Y'),
    ('BNR Bad Zoom Meeting', '2020-11-02', '', 'OQl9HvAQjRg'),
    ('BNR Thanksgiving dinner', '2020-10-26', 'Let the Lazy Man show you how to cook: Thanksgiving Dinner', 'Z49_WUlPVWM'),
    ('BNR Lazy Man Cooking Show', '2020-10-19', 'Here''s some cooking skits from a guy who can''t cook and doesn''t like to work.  Enjoy!', '87MRaT7QSuU'),
    ('BNR Origins of Slavery', '2020-10-09', 'How did slavery start?  What caused it?  Check out this video and the surprising ending.', 'SOFjPNFIE-k'),
    ('The K shaped recovery', '2020-10-01', 'What is a K-shaped recovery?  Learn about it in this short video.', 'W37yx-dHysQ'),
    ('What are Options?', '2020-09-23', 'Have you ever wondered what options are in the stock market?  This is a brief introduction to what they are and how they are used.', 'W9gfQC54QE4'),
    ('Recession 2021', '2020-09-17', 'Everyone is talking about a coming recession.  Where should I out my money if a recession hits.  This video discussions the options.', 'VUiwe-ZaXaU'),
    ('BNR interviews QNN', '2020-09-09', 'A friend of mine is starting a new show and I wanted to help.', '7e0B-_1-_DU'),
    ('BNR Dr Aubrey de Grey interview', '2020-09-03', 'The leading expert in anti-aging, I talk with Dr. Aubrey de Grey about what''s happening in extending our life spans.', 'KUc_9FBP1gA'),
    ('Kids Schools and Covid', '2020-08-27', 'Should we send our kids to school during the covid-19 pandemic?  Watch this show to get some clues.', '9I4iz_Br6Oc'),
    ('Life Extension part 2 - Consequences', '2020-08-19', 'This is a follow up to the first show of life extension.  It deals with the consequences, both positive and negative, of this technology.', 'hkgQqNReIgI'),
    ('BNR CreaTV Mashup', '2020-08-12', 'OK Viewers, you wanted to know when my show would be airing on CreaTV.  Well here''s the schedule and a little more.  Ha ha', 'IBM5r7Yf7R0'),
    ('BNR Bloopers and funny outtakes', '2020-08-05', 'CreaTV wants to add my show to their lineup on Friday nights.  They wanted me to make a short show with bloopers and funny outtakes.  So this is what I sent them.', 'KoqL7TtolTQ'),
    ('Life Extension part 1', '2020-07-31', 'Is it possible to live to 200 or 300 years old?  Check the research being done to extend our life. Aubrey De Grey''s Ted Talk on life extension', 'iTAy52dtJjE'),
    ('Monsoon Rains', '2020-07-22', 'Warning: This video contains scenes that might be considered disturbing. What''s the basic way to do research?  Something simple like the monsoon rains in Southeast Asia.  How do I get started?  Watch this video.', 'Cw754DWt44g'),
    ('Police Killings', '2020-07-16', 'President Trump says more white people are killed by police than black.  The Black Lives Matter Movement says more black people are being killed than whites.  So who is right?  Watch this video to find out.', 'sMeJuj3SLmo'),
    ('Why Covid 19 spreads so fast', '2020-06-30', 'Why is Covid-19 spreading so fast?  Why do we need to do so much testing?  This video shows the math behind the rapid Covid-19 growth and explains why we need to do more testing.', 'g_aNWYEJeyQ'),
    ('3 Things to secure a country''s future', '2020-09-09', 'Nervous about your country''s future.  What does each country need to make sure they are prepared for the future.  Check out this video and see.', 'lh_EwKBg_b0'),
    ('American Rebirth Part 2 Effects of Population', '2020-06-19', 'This is the second part of a series of shows on American Rebirth.  This show will focus on the effects of population.', '1Oqm6CA5TBs'),
    ('American Rebirth Part 1', '2020-06-12', 'Is America on the rise or falling by the wayside?  Check out this video to see what America is doing to keep itself in the game.', 'cywyb3Y6Qxg'),
    ('Neighborhood Association Meeting', '2020-06-03', 'This is a simple way to get involved with the local government and make your community a better place to live.', 'BsLamZD7I0o'),
    ('Good things from Covid-19', '2020-05-27', 'Not everything is bad, check out this video on the good things that have come from the covid pandemic.', 'wdfv28SlJU8'),
    ('Covid-19 Trivia Show 2', '2020-05-15', 'This is the second show on Covid-19 trivia.  The questions are harder and the answers more detailed.  I hope you like it.', 'd9qUKOvpynM'),
    ('Covid Trivia S1', '2020-05-06', 'Covid-19 is keeping us at home and looking for something to do.  Well here''s a trivia show about Covid-19 with a funny ending.  Here''s hoping you get all five trivia questions right.', 'vBJ6Yu18Wtg'),
    ('BNR Coconut Man', '2020-04-28', 'Check out the adventures of Coconut Man as he makes his way through my house and then off to Las Vegas.  This guy is always causing trouble.', 'ARBOZK7owfc'),
    ('Top 3 Conspiracy Theories', '2020-04-20', 'What happens when a bunch of drunk guys get together and ask, "What if?"  The results are three conspiracy theories that are too unbelievable to be real.  The topics are:', '6R-5PlUQQgI'),
    ('Winning the Lottery', '2020-04-14', 'What should you do if you win the lottery?  Take the lump sum payout or the 30-year payout.  What are the pros and cons of each.  Check this out.', 'zKm1BvdKTA4'),
    ('Covid 19', '2020-03-31', 'Stuck at home?  Check out the games recommended for the times we are in.  Also tips on saving money, data and graphs about the covid-19 pandemic and finally opportunities from a crisis.', '_AJEys4D6nI'),
    ('The Deutsche Bank Report', '2020-03-11', 'This show is based on the Deutsche Bank Research paper.  This think tank gave over a dozen ideas on how Europe can compete with the US and China in the 2030 decade.  I picked two of the ideas, but I recommend you download the report for yourself.', 'DtYhn5wcFns'),
    ('Rising Sea Levels show', '2020-03-04', 'Beer and News Report on Rising Sea Levels.  See how to use the NOAA app which shows the effects of rising sea levels up to 10 feet.  ', 'JtFjBkqMhrA'),
    ('Rising Sea Levels Appendix', '2020-02-28', 'I have calculated estimated sea level rise for three cities: Boston, Miami and New Orleans to the year 2100.  This video will be at the end of my show for reference.', 'fDEfLLhtfco'),
    ('Rising Sea Levels', '2020-02-27', 'This is a clip from my upcoming show on rising sea levels.  The show will be filmed at CreaTV on Monday, March 2 and out hopefully the next day.', '9_7Tvswwh48'),
    ('The Impeachment Conspiracy', '2020-02-04', 'Come and drink a beer with me as I tell you about the Impeachment Conspiracy Theory.', '5nYfQ6JZaVg')
;

INSERT INTO vid_tags (vid_id, tag_id)
  VALUES
    (1, 1),
    (2, 1),
    (2, 2),
    (3, 1),
    (3, 3),
    (4, 3),
    (5, 2),
    (5, 3),
    (6, 2),
    (7, 1),
    (7, 2),
    (7, 3),
    (8, 1),
    (8, 2)
;

INSERT INTO vid_resources (description, link, vid_id)
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

INSERT INTO comments (comment, date_posted, uid, vid_id)
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

INSERT INTO site_text (field, body)
  VALUES
    ('homepage', 'We believe that the world has become too serious and we need to have a beer and a couple laughs.

      See the news from a different aspect.'),
    ('about_intro', 'We believe that the world has become too serious and we need to have a beer and a couple laughs. If you agree, please email me and let me know. If not, have a beer anyway.'),
    ('about_mission', 'To take a news topic and try to find the underlying effects that might not have been considered. I will be drinking a beer to make the discussion more relaxed and comical.'),
    ('about_company', 'All the shows produced here were mainly done at the CreaTV studios in San Jose, CA. This is a public access studio so all the actors, including myself, were not paid. It is truly working for the joy of it...and of course beer.'),
    ('about_disclaimer', 'All the topics I talk about are either my opinion or obvious parody. I do not claim to be an expert on anything and that includes beer drinking. Any discussion or argument that uses my news as its basis is doomed to failure for which I am not responsible for.')
;

COMMIT;