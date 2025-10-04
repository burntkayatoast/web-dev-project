drop table if exists user_movies cascade;
drop table if exists movies cascade;
drop table if exists users cascade;


-- user table
create table users (
  id serial primary key,
  username varchar(50),
  email varchar(300) unique not null,
  password varchar(300) not null,
  bio text
);

-- movie api table
create table movies (
  id serial primary key,
  title varchar(30) not null,
  year varchar(20),
  genre varchar(500),
  rating varchar(50),
  cast text,
  crew text,
  director varchar(500)
  released date,
  synopsis text,
  country varchar(500),
  rotten_tomatoes varchar(100),
  length integer
);

-- user's movie table
create table user_movies ();
