drop table if exists user_movies cascade;
drop table if exists users cascade;


-- user table
create table users (
  id serial primary key,
  username varchar(50),
  email varchar(300) unique not null,
  password varchar(300) not null,
  bio text
);

-- user's movie table
create table user_movies ();
