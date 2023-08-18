INSERT INTO users VALUES 
  ('tester1', '12345678!Qw', 'nick1', 'http://localhost:3001/images/logo.jpeg'),
  ('tester2', '12345678!Qw', 'nick2', 'http://localhost:3001/images/logo.jpeg'),
  ('tester3', '12345678!Qw', 'nick3', 'http://localhost:3001/images/logo.jpeg'),
  ('tester4', '12345678!Qw', 'nick4', 'http://localhost:3001/images/logo.jpeg'),
  ('tester5', '12345678!Qw', 'nick5', 'http://localhost:3001/images/logo.jpeg'),
  ('tester6', '12345678!Qw', 'nick6', 'http://localhost:3001/images/logo.jpeg'),
  ('tester7', '12345678!Qw', 'nick7', 'http://localhost:3001/images/logo.jpeg'),
  ('tester8', '12345678!Qw', 'nick8', 'http://localhost:3001/images/logo.jpeg');

INSERT INTO "chatRoom" (name, current_nums, max_nums, is_public, is_password) VALUES
  ('room1', 1, 4, true, false),
  ('room2', 1, 4, true, false),
  ('room3', 1, 4, true, false),
  ('room4', 1, 4, true, false);

-- permision user = 0, admin = 1, owner = 2;
INSERT INTO "chatMember" (permission, "chatroomId", "userId") VALUES
 (2, 1, 'tester1'),
 (2, 2, 'tester2'),
 (2, 3, 'tester3'),
 (2, 4, 'tester4');

 INSERT INTO "directMessage" ("userId", "someoneId", date, message) VALUES
  ('tester1', 'tester2', '2023-08-04', 'hi'),
  ('tester2', 'tester1', '2023-08-05', 'hello'),
  ('tester1', 'tester2', '2023-08-06', 'WRU?'),
  ('tester2', 'tester1', '2023-08-07', 'i am tester2'),
  ('tester1', 'tester3', '2023-08-04', 'hi'),
  ('tester3', 'tester1', '2023-08-05', 'hello'),
  ('tester1', 'tester4', '2023-08-05', 'hi tester4'),
  ('tester5', 'tester1', '2023-08-05', 'hi tester1'),
  ('tester1', 'tester2', '2023-07-01', 'firestmessage');

INSERT INTO "friendList" VALUES
 ('tester1', 'tester2'),
 ('tester1', 'tester3'),
 ('tester2', 'tester1'),
 ('tester2', 'tester3');

-- INSERT INTO "chatBan" VALUES

-- SELECT * FROM "chatRoom" LEFT JOIN "chatMember" ON "chatRoom"."id" = "chatMember"."chatroomId";