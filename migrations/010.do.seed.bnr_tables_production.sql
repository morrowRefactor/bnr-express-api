BEGIN;

TRUNCATE
  site_text,
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
    ('Art Maurice', 'amaurice@yahoo.com', '$2a$12$bwuDYT.gFDDKyZEEfateXOu91kHw7PkEh1Io0e1LPobTaD0rhxXgK')
;

INSERT INTO tags (tag)
  VALUES
    ('Politics/Policy'),
    ('Economy/Economics'),
    ('History'),
    ('COVID-19'),
    ('Skit/Humor'),
    ('Educational'),
    ('Interactive'),
    ('Conspiracy'),
    ('Interview'),
    ('Holidays'),
    ('Promo')
;

INSERT INTO videos (title, date_posted, description, youtube_id)
  VALUES
    ('AI is Winning', '2021-03-31', 'How can Artificial Intelligence (AI) be affecting me?  I don''t see any terminators around.  To see how AI is affecting your thought process and decision making, watch this show.', 'iHurvjD3ItQ'),
    ('The Sarcastic News', '2021-03-24', 'Cutting through the fluff and pointing out what others are keeping quiet about.  Pat McGroin tells you like it is.', 'HKXcvCDnSe4'),
    ('Pick-up lines skit', '2021-03-17', 'Time to get ready for summer.  Watch this show to get some hilarious pick-up lines.', '2q4nntgD0WM'),
    ('Highlight show', '2021-03-10', 'The next five shows are highlighted in this show.  After watching all five, please send me your vote as to which show you want to see first.  I will tally up the votes and make the shows in the order of the most votes.', '15nvoCQk5aQ'),
    ('QAnon', '2021-03-03', 'Who is QAnon?  What is QAnon?  This show talks about QAnon and what it is all about.', '7Z3LyvOauRQ'),
    ('iMovie tricks', '2021-02-24', 'This is for my friends at CreaTV who do shows of their own.  I was asked how I did my tricks and special effects in the Stinky and friends skit.  This show explains how I did it.', 'Q6Xk_LoNe58'),
    ('Stinky and friends', '2021-02-18', 'What are you going to do when your stuffed animals attack you and try to steal your YouTube channel?  Well...here''s what I did.', 'LVUWDxiKNOQ'),
    ('US Energy Program 2', '2021-02-11', 'Why should homeowners install solar panels and battery storage systems?  Besides a constant supply of electricity, what else does this system bring to the homeowner?  What and see what the future holds for home energy systems.', 'c_8bs2vuH64'),
    ('The GameStop Craze', '2021-02-04', 'In one week, GameStop stock went from $30 to over $300.  What made it go up so fast?  What was the driving force?  Are there other stocks doing this?  Well this show will tell why GameStop stock went up and where to look to find others.', 'ozlNMSYiD18'),
    ('10 10 US Energy Program 1', '2021-01-28', 'What is the Green New Deal?  Are we headed for it?  Watch and see what the future holds.', '-kSw9jx3Oi8'),
    ('No toothpaste and Zoom meeting 2', '2021-01-20', 'If 9 out of 10 dentist recommend using toothpaste, who was that one dentist who doesn''t?  Well I found him and did an interview.', 'xu6FP7lg63Q'),
    ('Domestic Terrorist', '2021-01-14', 'Wow what happened at the capitol building?  How are we going to stop this?  This show explains how the Patriot Act will be a force against domestic terrorist.', 'xbR9bIRrrUw'),
    ('The Covid Dilemma', '2021-01-06', 'Why is there some much distrust about the covid vaccine and our institutions?  How did it get this way?  I''ll try to answer these questions and give some information about the covid vaccine.', 'ZPQ2rNj8DLU'),
    ('New Year''s Show 2021', '2021-01-01', 'Happy New Year everyone.  Here are some highlights of my upcoming shows.', 'j6CRhz2zZ3A'),
    ('BNR Happy Holidays', '2020-11-23', 'Year end highlights of my shows with Christmas music in the background', '9Uv1c_OqAAk'),
    ('BNR Do this now!', '2020-11-09', 'Holidays are coming and your need to take precautions before someone hacks into your accounts.', 'jOFWEc0FH5Y'),
    ('BNR Bad Zoom Meeting', '2020-11-02', '', 'OQl9HvAQjRg'),
    ('BNR Thanksgiving dinner', '2020-10-26', 'Let the Lazy Man show you how to cook: Thanksgiving Dinner', 'Z49_WUlPVWM'),
    ('BNR Lazy Man Cooking Show', '2020-10-19', 'Here''s some cooking skits from a guy who can''t cook and doesn''t like to work.  Enjoy!', '87MRaT7QSuU'),
    ('20 20 BNR Origins of Slavery', '2020-10-09', 'How did slavery start?  What caused it?  Check out this video and the surprising ending.', 'SOFjPNFIE-k'),
    ('BNR The K shaped recovery', '2020-10-01', 'What is a K-shaped recovery?  Learn about it in this short video.', 'W37yx-dHysQ'),
    ('BNR What are Options?', '2020-09-23', 'Have you ever wondered what options are in the stock market?  This is a brief introduction to what they are and how they are used.', 'W9gfQC54QE4'),
    ('BNR Recession 2021', '2020-09-17', 'Everyone is talking about a coming recession.  Where should I out my money if a recession hits.  This video discussions the options.', 'VUiwe-ZaXaU'),
    ('BNR interviews QNN', '2020-09-09', 'A friend of mine is starting a new show and I wanted to help.', '7e0B-_1-_DU'),
    ('BNR Dr Aubrey de Grey interview', '2020-09-03', 'The leading expert in anti-aging, I talk with Dr. Aubrey de Grey about what''s happening in extending our life spans.', 'KUc_9FBP1gA'),
    ('BNR Kids Schools and Covid', '2020-08-27', 'Should we send our kids to school during the covid-19 pandemic?  Watch this show to get some clues.', '9I4iz_Br6Oc'),
    ('BNR Life Extension part 2 - Consequences', '2020-08-19', 'This is a follow up to the first show of life extension.  It deals with the consequences, both positive and negative, of this technology.', 'hkgQqNReIgI'),
    ('BNR CreaTV Mashup', '2020-08-12', 'OK Viewers, you wanted to know when my show would be airing on CreaTV.  Well here''s the schedule and a little more.  Ha ha', 'IBM5r7Yf7R0'),
    ('BNR Bloopers and funny outtakes', '2020-08-05', 'CreaTV wants to add my show to their lineup on Friday nights.  They wanted me to make a short show with bloopers and funny outtakes.  So this is what I sent them.', 'KoqL7TtolTQ'),
    ('30 30 BNR Life Extension part 1', '2020-07-31', 'Is it possible to live to 200 or 300 years old?  Check the research being done to extend our life.', 'iTAy52dtJjE'),
    ('BNR Monsoon Rains', '2020-07-22', 'Warning: This video contains scenes that might be considered disturbing. What''s the basic way to do research?  Something simple like the monsoon rains in Southeast Asia.  How do I get started?  Watch this video.', 'Cw754DWt44g'),
    ('BNR Police Killings', '2020-07-16', 'President Trump says more white people are killed by police than black.  The Black Lives Matter Movement says more black people are being killed than whites.  So who is right?  Watch this video to find out.', 'sMeJuj3SLmo'),
    ('BNR Why Covid 19 spreads so fast', '2020-07-10', 'Why is Covid-19 spreading so fast?  Why do we need to do so much testing?  This video shows the math behind the rapid Covid-19 growth and explains why we need to do more testing.', 'g_aNWYEJeyQ'),
    ('BNR 3 Things to secure a country''s future', '2020-06-30', 'Nervous about your country''s future.  What does each country need to make sure they are prepared for the future.  Check out this video and see.', 'lh_EwKBg_b0'),
    ('BNR American Rebirth Part 2 Effects of Population', '2020-06-19', 'This is the second part of a series of shows on American Rebirth.  This show will focus on the effects of population.', '1Oqm6CA5TBs'),
    ('BNR American Rebirth Part 1', '2020-06-12', 'Is America on the rise or falling by the wayside?  Check out this video to see what America is doing to keep itself in the game.', 'cywyb3Y6Qxg'),
    ('BNR Good things from Covid-19', '2020-05-27', 'Not everything is bad, check out this video on the good things that have come from the covid pandemic.', 'wdfv28SlJU8'),
    ('Covid-19 Trivia Show 2', '2020-05-15', 'This is the second show on Covid-19 trivia.  The questions are harder and the answers more detailed.  I hope you like it.', 'd9qUKOvpynM'),
    ('BNR Covid Trivia S1', '2020-05-06', 'Covid-19 is keeping us at home and looking for something to do.  Well here''s a trivia show about Covid-19 with a funny ending.  Here''s hoping you get all five trivia questions right.', 'vBJ6Yu18Wtg'),
    ('40 40 BNR Coconut Man', '2020-04-28', 'Check out the adventures of Coconut Man as he makes his way through my house and then off to Las Vegas.  This guy is always causing trouble.', 'ARBOZK7owfc'),
    ('BNR Top 3 Conspiracy Theories', '2020-04-20', 'What happens when a bunch of drunk guys get together and ask, "What if?"  The results are three conspiracy theories that are too unbelievable to be real.  The topics are:  The Cannabis Conspiracy Theory  The Abortion Conspiracy Theory  The Coronavirus Conspiracy Theory  There is no proof of these theories and was mainly done for fun.', '6R-5PlUQQgI'),
    ('BNR Winning the Lottery', '2020-04-14', 'What should you do if you win the lottery?  Take the lump sum payout or the 30-year payout.  What are the pros and cons of each.  Check this out.', 'zKm1BvdKTA4'),
    ('BNR Covid 19', '2020-03-31', 'Stuck at home?  Check out the games recommended for the times we are in.  Also tips on saving money, data and graphs about the covid-19 pandemic and finally opportunities from a crisis.', '_AJEys4D6nI'),
    ('The Deutsche Bank Report', '2020-03-11', 'This show is based on the Deutsche Bank Research paper.  This think tank gave over a dozen ideas on how Europe can compete with the US and China in the 2030 decade.  I picked two of the ideas, but I recommend you download the report for yourself.  This show will focus on plastic money (credit and debit cards) going away and the effects of blockchain on cryptocurrency in the 2030 decade.  Please enjoy.', 'DtYhn5wcFns'),
    ('Beer and News Report - Rising Sea Levels show', '2020-03-04', 'Beer and News Report on Rising Sea Levels.  See how to use the NOAA app which shows the effects of rising sea levels up to 10 feet.', 'JtFjBkqMhrA'),
    ('Rising Sea Levels Appendix', '2020-02-28', 'I have calculated estimated sea level rise for three cities: Boston, Miami and New Orleans to the year 2100.  This video will be at the end of my show for reference.', 'fDEfLLhtfco'),
    ('Rising Sea Levels', '2020-02-27', 'This is a clip from my upcoming show on rising sea levels.  The show will be filmed at CreaTV on Monday, March 2 and out hopefully the next day.', '9_7Tvswwh48'),
    ('Beer & News Report - The Impeachment Conspiracy', '2020-02-04', 'Come and drink a beer with me as I tell you about the Impeachment Conspiracy Theory.', '5nYfQ6JZaVg')
;

INSERT INTO vid_tags (vid_id, tag_id)
  VALUES
    (1, 6),
    (2, 1),
    (2, 5),
    (3, 5),
    (4, 7),
    (4, 11),
    (5, 1),
    (5, 6),
    (5, 8),
    (6, 6),
    (6, 7),
    (7, 5),
    (8, 1),
    (8, 6),
    (9, 2),
    (10, 1),
    (10, 6),
    (11, 5),
    (12, 1),
    (13, 1),
    (13, 4),
    (14, 10),
    (15, 10),
    (16, 2),
    (16, 6),
    (16, 7),
    (17, 5),
    (18, 5),
    (18, 6),
    (18, 10),
    (19, 5),
    (19, 6),
    (20, 3),
    (20, 6),
    (21, 2),
    (21, 4),
    (21, 6),
    (22, 2),
    (22, 6),
    (23, 2),
    (23, 6),
    (24, 6),
    (24, 9),
    (25, 6),
    (25, 9),
    (26, 4),
    (26, 6),
    (27, 1),
    (27, 6),
    (28, 5),
    (29, 5),
    (30, 6),
    (31, 6),
    (32, 1),
    (32, 6),
    (33, 4),
    (33, 6),
    (34, 1),
    (34, 6),
    (35, 1),
    (35, 3),
    (35, 6),
    (36, 1),
    (36, 3),
    (36, 6),
    (37, 4),
    (37, 6),
    (38, 4),
    (38, 6),
    (38, 7),
    (39, 4),
    (39, 6),
    (39, 7),
    (40, 5),
    (41, 4),
    (41, 8),
    (42, 2),
    (42, 6),
    (43, 4),
    (43, 6),
    (44, 2),
    (44, 6),
    (45, 1),
    (45, 6),
    (46, 1),
    (47, 11),
    (48, 1),
    (48, 6),
    (48, 8)
;

INSERT INTO vid_resources (description, link, vid_id)
  VALUES
    ('Aubrey De Grey''s Ted Talk on life extension', 'https://www.youtube.com/watch?v=AvWtSUdOWVI&t=861s', 29),
    ('Agamator''s Chess Talk - Game 6 - Fischer vs Spassky', 'https://www.youtube.com/watch?v=dv52uwNfFZg', 41),
    ('Chess Talk with Jeetendra Advani', 'https://www.youtube.com/watch?v=E4F77emUnqQ', 41),
    ('Online Chess & Solitary games', 'https://cardgames.io', 41),
    ('John Hopkins University', 'https://www.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6', 42),
    ('Santa Clara County', 'https://www.sccgov.org/sites/covid19/Pages/dashboard.aspx', 42),
    ('IHME', 'https://covid19.healthdata.org/global', 42),
    ('Deutsche Bank Research Paper', 'https://www.dbresearch.com/PROD/RPS_EN-PROD/PROD0000000000503196/Imagine_2030.pdf', 43),
    ('NOAA app', 'https://coast.noaa.gov/slr/#/layer/slr/10/-8940465.855981056/2971135.6453884477/11/satellite/none/0.8/2050/interHigh/midAccretion', 44),
    ('Link to State of California Sea Level Rise Guidance 2018', 'https://www.documentcloud.org/documents/6779781-State-of-California-Sea-Level-Rise-Guidance-2018.html', 44)
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