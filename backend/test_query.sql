INSERT INTO users (user_id, user_pw, user_nickname, user_image, is_2fa_enabled, rank_score)
VALUES 
  ('user1', '1234', 'nick1', '/images/logo.jpeg', false, 1000),
  ('user2', '1234', 'nick2', '/images/logo.jpeg', false, 1000),
  ('user3', '1234', 'nick3', '/images/logo.jpeg', false, 1000),
  ('user4', '1234', 'nick4', '/images/logo.jpeg', false, 1000);

INSERT INTO game_type (id, type)
VALUES 
  (1, '일반'),
  (2, '랭크');

INSERT INTO game_mode (id, mode)
VALUES 
  (1, '일반'),
  (2, '가속');