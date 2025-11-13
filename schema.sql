drop table if exists users cascade;

-- user table
create table users (
  id serial primary key,
  firstname varchar(20),
  lastname varchar(20),
  username varchar(25),
  email varchar(50) unique not null,
  password varchar(20) not null
);

select * from users;

