drop table if exists users cascade;
drop table if exists movies cascade;
drop table if exists user_movies cascade;
drop table if exists user_reviews cascade;

-- user table
create table users (
  id serial primary key,
  firstname varchar(20),
  lastname varchar(20),
  username varchar(25),
  email varchar(50) unique not null,
  profile_picture varchar(500) default '/images/default.jpg', 
  password varchar(300) not null
);

-- movies table 
create table movies (
  id serial primary key,
  tmdb_id integer not null,
  title varchar(500) not null,
  poster_path varchar(500),
  release_date date,
  vote_average decimal(3,1),
  media_type varchar(20) check (media_type in ('movie', 'tv')),
  created_at timestamp default current_timestamp,
  unique(tmdb_id, media_type)
);

-- user watchlist table
create table user_movies (
  id serial primary key,
  user_id integer references users(id) on delete cascade,
  movie_id integer references movies(id) on delete cascade,
  added_at timestamp default current_timestamp,
  unique(user_id, movie_id)
);

-- user review table
create table user_reviews (
  id serial primary key,
  user_id integer references users(id) on delete cascade,
  movie_id integer references movies(id) on delete cascade,
  media_type varchar(10) not null,
  rating integer check (rating between 1 and 10),
  review_text text,
  added_at timestamp default current_timestamp,
  unique(user_id, movie_id)
);

select * from users;

