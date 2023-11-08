CREATE DATABASE services;

CREATE TABLE users (
  user_id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

COMMENT ON TABLE users IS 'Пользователи';
COMMENT ON COLUMN users.user_id IS 'Идентификатор пользователя';
COMMENT ON COLUMN users.name IS 'Имя пользователя';
COMMENT ON COLUMN users.email IS 'Email пользователя';

CREATE TABLE action_types (
  action_type_id SMALLSERIAL PRIMARY KEY,
  action_name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL
);

COMMENT ON TABLE action_types IS 'Типы действий с пользователями';
COMMENT ON COLUMN action_types.action_type_id IS 'Идентификатор типа действия';
COMMENT ON COLUMN action_types.action_name IS 'Название действия';
COMMENT ON COLUMN action_types.description IS 'Описание действия';

INSERT INTO
    action_types (action_name, description)
VALUES
    ('create', 'Создание пользователя'),
    ('update', 'Изменение информации о пользователе');

CREATE TABLE users_actions (
    user_action_id BIGSERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id)
        ON UPDATE CASCADE,
    action_type_id SMALLINT NOT NULL REFERENCES action_types
        ON UPDATE CASCADE,
    action_description TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

DROP TABLE users_actions;

CREATE UNIQUE INDEX users_actions_user_id ON users_actions(user_id);

COMMENT ON TABLE users_actions IS 'История действий с пользователями';
COMMENT ON COLUMN users_actions.user_action_id IS 'Идентификатор записи';
COMMENT ON COLUMN users_actions.user_id IS 'Идентификатор пользователя';
COMMENT ON COLUMN users_actions.action_type_id IS 'Идентификатор типа действия с пользователями';
COMMENT ON COLUMN users_actions.action_description IS 'Информация действиях  с пользователем';
COMMENT ON COLUMN users_actions.timestamp IS 'Время создания записи';
