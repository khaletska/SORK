SELECT * FROM sessions;

SELECT * FROM users;

DELETE FROM messages WHERE id > 20;

UPDATE users 
SET avatar = "https://images.unsplash.com/photo-1611244419377-b0a760c19719?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80"
WHERE id = 13;

SELECT * FROM posts;
SELECT * FROM groups;
SELECT * FROM notifications;

SELECT * FROM likes;

INSERT INTO followers (follower_id, user_being_followed_id, is_accepted, is_follower_close_friend)
VALUES
    (1, 13, 1, 0),
    (13, 3, 1, 0),
    (3, 13, 1, 1),
    (13, 5, 1, 1);

SELECT * FROM followers;
SELECT * FROM comments;

SELECT * FROM group_members;
SELECT * FROM group_events;
SELECT * FROM event_participants;

SELECT * FROM private_chats;
SELECT * FROM messages;

INSERT INTO users (first_name, last_name, date_of_birth, email, password, nickname, about, is_profile_public)
VALUES
    ('Robert', 'Johnson', '1982-09-10', 'robert@example.com', 'robertpass', 'robbie', 'Musician and songwriter.', 1),
    ('Julia', 'Miller', '1998-06-21', 'julia@example.com', 'juliapass', 'jules', 'Exploring the world one city at a time.', 1),
    ('Daniel', 'Martinez', '1995-03-08', 'daniel@example.com', 'danielpass', 'dan', 'Tech enthusiast and coder.', 1),
    ('Sophia', 'Garcia', '1989-11-14', 'sophia@example.com', 'sophiapass', 'sophie', 'Passionate about fashion and design.', 1),
    ('William', 'Brown', '2000-08-02', 'william@example.com', 'williampass', 'will', 'Aspiring filmmaker and cinephile.', 1),
    ('Mia', 'Rodriguez', '1993-12-30', 'mia@example.com', 'miapass', 'mimi', 'Nature lover and outdoor enthusiast.', 1),
    ('Ethan', 'Lopez', '1987-07-17', 'ethan@example.com', 'ethanpass', 'ethie', 'Foodie and amateur chef.', 1),
    ('Isabella', 'Harris', '1991-04-25', 'isabella@example.com', 'isabellapass', 'izzy', 'Art and photography enthusiast.', 1),
    ('Michael', 'Clark', '1997-01-12', 'michael@example.com', 'michaelpass', 'mic', 'Fitness and health advocate.', 1),
    ('Ava', 'Young', '1984-10-07', 'ava@example.com', 'avapass', 'avie', 'Dog lover and animal rescuer.', 1);


INSERT INTO posts (title, content, author_id, creation_time, group_id, privacy_level)
VALUES
    ('Amazing Sunset Over the Mountains', 'I witnessed the most breathtaking sunset today while hiking in the mountains. The sky was painted in shades of orange and pink, and the view was absolutely mesmerizing.', 1, '2023-08-04', 2, 'public'),
    ('Exploring Hidden Waterfalls', 'Ventured deep into the forest and stumbled upon a hidden gem - a stunning waterfall surrounded by lush greenery. Nature never ceases to amaze me.', 3, '2023-08-03', NULL, 'public'),
    ('Delicious Homemade Pizza Recipe', 'Just tried a new pizza recipe at home and it turned out to be a mouthwatering masterpiece. Thin crust, fresh tomatoes, basil, and a blend of cheeses. Food heaven!', 2, '2023-08-02', NULL, 'public'),
    ('Jamming Session with Friends', 'Spent the evening jamming with some incredibly talented musicians. The music flowed seamlessly, and we created some unforgettable melodies. Can not wait for the next session!', 4, '2023-08-01', NULL, 'close_friends'),
    ('Adventures in a Faraway Land', 'Embarked on a solo journey to a distant land. Explored bustling markets, tried exotic foods, and met wonderful people with unique stories to tell.', 5, '2023-07-31', 1, 'public'),
    ('Gym Progress and Fitness Milestones', 'Celebrating a new fitness milestone! I deadlifted twice my body weight today at the gym. Hard work and dedication really do pay off.', 6, '2023-07-30', NULL, 'private'),
    ('Capturing the Night Sky', 'Spent hours photographing the stars and the Milky Way. Nights like these remind me of the vastness of the universe and our place in it.', 7, '2023-07-29', NULL, 'public'),
    ('Innovations in Augmented Reality', 'Attended an enlightening conference on AR technology. The future possibilities are mind-boggling. Exciting times ahead for tech enthusiasts!', 8, '2023-07-28', 3, 'public'),
    ('Exploring Ancient Ruins', 'Explored the ruins of an ancient civilization and marveled at the architectural wonders of the past. History has a way of connecting us to our roots.', 9, '2023-07-27', NULL, 'public'),
    ('Diving into Dystopian Literature', 'Started reading a captivating dystopian novel that raises thought-provoking questions about society and human nature. Can not put it down!', 10, '2023-07-26', NULL, 'public');


INSERT INTO groups (name, description, creator_id)
VALUES
    ('Adventure Explorers', 'A group for adrenaline junkies and adventure seekers.', 2),
    ('Culinary Delights', 'Exploring the world of gastronomy and culinary arts.', 5),
    ('Melody Makers', 'For musicians and music enthusiasts of all genres.', 3),
    ('Wanderlust Club', 'Travel enthusiasts sharing their journeys and experiences.', 4),
    ('Fit and Fabulous', 'Focusing on fitness, workouts, and healthy living.', 6),
    ("Nature's Lens", 'Capturing the beauty of nature through photography.', 7),
    ('Tech Titans', 'Discussions about the latest tech trends and innovations.', 8),
    ('Artistic Expressions', 'A space for artists to showcase and discuss their creations.', 9),
    ('Sports Fanatics', 'All things sports – from basketball to soccer and more.', 10),
    ('Literary Haven', 'For book lovers to discuss literature and share recommendations.', 1);


INSERT INTO likes (post_id, liked_user_id)
VALUES
    (1, 3),
    (1, 6),
    (1, 9),
    (2, 4),
    (2, 7),
    (2, 10),
    (3, 1),
    (3, 5),
    (3, 8),
    (4, 2),
    (4, 6),
    (4, 9),
    (5, 3),
    (5, 7),
    (5, 10),
    (6, 1),
    (6, 5),
    (6, 8),
    (7, 2),
    (7, 6),
    (7, 9),
    (8, 3),
    (8, 7),
    (8, 10),
    (9, 1),
    (9, 5),
    (9, 8),
    (10, 2),
    (10, 6),
    (10, 9);


INSERT INTO followers (follower_id, user_being_followed_id, is_accepted, is_follower_close_friend)
VALUES
    (1, 2, 1, 0),
    (2, 3, 1, 0),
    (3, 4, 0, 1),
    (4, 5, 1, 1),
    (5, 6, 0, 0),
    (6, 7, 1, 0),
    (7, 8, 1, 1),
    (8, 9, 0, 0),
    (9, 10, 1, 1),
    (10, 1, 0, 1);

-- Generate random comments for the given users and posts
INSERT INTO comments (post_id, author_id, content, created_at)
VALUES
    (1, 2, 'Great post!', '2023-08-04'),
    (3, 5, 'This is so interesting!', '2023-08-04'),
    (2, 7, 'I completely agree with you.', '2023-08-04'),
    (4, 1, 'Nice work!', '2023-08-04'),
    (1, 9, 'Thanks for sharing!', '2023-08-04'),
    (3, 4, 'I learned something new from this.', '2023-08-04'),
    (2, 8, 'Keep up the good work.', '2023-08-04'),
    (4, 6, 'You have a unique perspective.', '2023-08-04'),
    (1, 3, 'Impressive!', '2023-08-04'),
    (3, 10, "I'm inspired by your post.", '2023-08-04');

-- Generate random group members relations
INSERT INTO group_members (group_id, member_id, approval_status)
VALUES
    (1, 2, 'approved'),
    (1, 4, 'approved'),
    (2, 3, 'approved'),
    (3, 1, 'pending'),
    (4, 5, 'approved'),
    (5, 7, 'approved'),
    (6, 9, 'approved'),
    (7, 8, 'pending'),
    (8, 6, 'approved'),
    (9, 10, 'approved');

INSERT INTO group_events (group_id, author_id, title, description, happening_at)
VALUES
    (1, 2, 'Cooking Workshop', 'Join us for a hands-on cooking workshop where we explore various cuisines.', '2023-08-15 14:22:00'),
    (2, 4, 'Hiking Adventure', 'Embark on a thrilling hiking adventure to conquer a challenging trail.', '2023-09-02 12:48:00'),
    (3, 1, 'Live Music Performance', 'Enjoy an evening of live music performances by local artists.', '2023-08-25 19:00:00'),
    (4, 3, 'Photography Exhibition', 'A showcase of stunning photographs capturing the beauty of nature and landscapes.', '2023-09-10 12:48:00'),
    (5, 5, 'Fitness Bootcamp', 'Get ready for an intense fitness bootcamp to push your limits and achieve your fitness goals.', '2023-08-20 06:22:00'),
    (1, 8, 'Art Painting Workshop', 'Unleash your creativity in a guided art painting workshop for all skill levels.', '2023-09-05 22:10:00'),
    (2, 6, 'Wildlife Photography Tour', 'Capture breathtaking shots of wildlife in their natural habitats during this photography tour.', '2023-08-28 05:25:00'),
    (3, 10, 'Book Discussion', 'Engage in a thought-provoking discussion on the latest bestseller in the world of literature.', '2023-09-15 15:51:00'),
    (4, 7, 'Tech Talk', 'Stay updated on the latest tech trends and innovations in this informative tech talk session.', '2023-08-22 11:00:00'),
    (5, 9, 'Football Watch Party', 'Cheer for your favorite football team with fellow fans during this exciting match watch party.', '2023-09-01 21:05:00');

INSERT INTO event_participants (event_id, member_id, is_going)
VALUES
    (1, 2, 1),
    (1, 3, 1),
    (1, 5, 0),
    (2, 4, 1),
    (2, 7, 1),
    (3, 3, 0),
    (3, 6, 1),
    (3, 8, 1),
    (4, 1, 1),
    (4, 5, 1),
    (5, 4, 1),
    (6, 3, 0),
    (6, 5, 1),
    (7, 6, 1),
    (8, 2, 1),
    (8, 4, 1),
    (8, 7, 1),
    (9, 5, 1),
    (9, 8, 0),
    (10, 6, 1),
    (10, 10, 1);

-- Insert data into private_chats table
INSERT INTO private_chats (user1_id, user2_id)
VALUES
    (13, 14),
    (3, 7),
    (1, 8),
    (6, 4),
    (10, 9),
    (9, 3),
    (5, 1),
    (5, 6),
    (8, 2),
    (8, 10);

-- Insert data into messages table
INSERT INTO messages (chat_id, chat_type, sender_id, message_content, timestamp)
VALUES
    (11, 'private', 13, 'Hey, hows it going?', '2023-08-30 14:22:00'),
    (11, 'private', 5, 'Hey! Im doing well, thanks for asking.', '2023-08-30 14:25:00'),
    (11, 'private', 13, 'Did you see the latest tech news?', '2023-08-30 15:10:00'),
    (2, 'private', 7, 'Yes, the new gadgets are amazing!', '2023-08-30 15:12:00'),
    (3, 'private', 1, 'Your latest artwork is stunning!', '2023-08-30 16:05:00'),
    (7, 'group', 8, 'Thank you so much! I put a lot of effort into it.', '2023-08-30 16:08:00'),
    (4, 'private', 6, 'I tried that new recipe you shared. It was delicious!', '2023-08-30 17:30:00'),
    (4, 'group', 5, 'Im glad you liked it! Cooking is my passion.', '2023-08-30 17:32:00'),
    (5, 'private', 10, 'Just finished my morning jog. Feeling great!', '2023-08-30 18:40:00'),
    (5, 'private', 9, 'Keep up the good work! Exercise is key.', '2023-08-30 18:42:00'),
    (6, 'private', 9, 'I found a beautiful hiking trail for our next adventure.', '2023-08-30 20:15:00'),
    (6, 'private', 3, 'Sounds exciting! Im in for sure.', '2023-08-30 20:18:00'),
    (7, 'private', 5, 'Do you want to catch up for coffee next week?', '2023-08-30 21:00:00'),
    (8, 'group', 6, 'Absolutely! Lets do Wednesday afternoon.', '2023-08-30 21:03:00'),
    (9, 'group', 10, 'Im thinking of starting a photography blog.', '2023-08-30 22:30:00'),
    (8, 'private', 6, 'Thats a fantastic idea! Your photos are incredible.', '2023-08-30 22:33:00'),
    (9, 'private', 8, 'Visited the new art gallery downtown. So inspiring!', '2023-08-31 10:15:00'),
    (9, 'private', 2, 'I need to check it out. Art always lifts my mood.', '2023-08-31 10:18:00'),
    (6, 'group', 9, 'Found a stray puppy near the park. Brought it home.', '2023-08-31 12:45:00'),
    (10, 'private', 10, 'Youre amazing! Lets find it a forever home.', '2023-08-31 12:48:00');
