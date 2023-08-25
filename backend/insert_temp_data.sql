INSERT INTO users VALUES
  ('user1', '1234', 'nick1', 'http://localhost:3001/images/logo.jpeg'),
  ('user2', '1234', 'nick2', 'http://localhost:3001/images/logo.jpeg'),
  ('user3', '1234', 'nick3', 'http://localhost:3001/images/logo.jpeg'),
  ('user4', '1234', 'nick4', 'http://localhost:3001/images/logo.jpeg'),
  ('user5', '1234', 'nick5', 'http://localhost:3001/images/logo.jpeg'),
  ('user6', '1234', 'nick6', 'http://localhost:3001/images/logo.jpeg'),
  ('user7', '1234', 'nick7', 'http://localhost:3001/images/logo.jpeg'),
  ('user8', '1234', 'nick8', 'http://localhost:3001/images/logo.jpeg'),
  ('user9', '1234', 'nick9', 'http://localhost:3001/images/logo.jpeg'),
  ('user10', '1234', 'nick10', 'http://localhost:3001/images/logo.jpeg'),
  ('user11', '1234', 'nick11', 'http://localhost:3001/images/logo.jpeg'),
  ('user12', '1234', 'nick12', 'http://localhost:3001/images/logo.jpeg');

INSERT INTO "chatRoom" (name, current_nums, max_nums, is_public, is_password) VALUES
  ('room1', 1, 4, true, false),
  ('room2', 1, 4, true, false),
  ('room3', 1, 4, true, false),
  ('room4', 1, 4, true, false);

-- permision user = 0, admin = 1, owner = 2;
INSERT INTO "chatMember" (permission, "chatroomId", "userId") VALUES
 (2, 1, 'user1'),
 (2, 2, 'user2'),
 (2, 3, 'user3'),
 (2, 4, 'user4');

 INSERT INTO "directMessage" ("userId", "someoneId", date, message) VALUES
  ('user1', 'user2', '2023-08-04', 'hi'),
  ('user2', 'user1', '2023-08-05', 'hello'),
  ('user1', 'user2', '2023-08-06', 'WRU?'),
  ('user2', 'user1', '2023-08-07', 'i am user2'),
  ('user1', 'user3', '2023-08-04', 'hi'),
  ('user3', 'user1', '2023-08-05', 'hello'),
  ('user1', 'user4', '2023-08-05', 'hi user4'),
  ('user5', 'user1', '2023-08-05', 'hi user1'),
  ('user1', 'user2', '2023-07-01', 'firestmessage');

INSERT INTO "friendList" VALUES
 ('user1', 'user2'),
 ('user1', 'user3'),
 ('user2', 'user1'),
 ('user2', 'user3');

-- INSERT INTO "chatBan" VALUES

-- SELECT * FROM "chatRoom" LEFT JOIN "chatMember" ON "chatRoom"."id" = "chatMember"."chatroomId";