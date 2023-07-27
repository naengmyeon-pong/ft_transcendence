INSERT INTO users VALUES 
  ('tester1', '12345678!Qw', 'nick1', '/images/logo.jpeg'),
  ('tester2', '12345678!Qw', 'nick2', '/images/logo.jpeg'),
  ('tester3', '12345678!Qw', 'nick3', '/images/logo.jpeg'),
  ('tester4', '12345678!Qw', 'nick4', '/images/logo.jpeg'),
  ('tester5', '12345678!Qw', 'nick5', '/images/logo.jpeg'),
  ('tester6', '12345678!Qw', 'nick6', '/images/logo.jpeg'),
  ('tester7', '12345678!Qw', 'nick7', '/images/logo.jpeg'),
  ('tester8', '12345678!Qw', 'nick8', '/images/logo.jpeg');

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

-- INSERT INTO "chatBan" VALUES

-- SELECT * FROM "chatRoom" LEFT JOIN "chatMember" ON "chatRoom"."id" = "chatMember"."chatroomId";