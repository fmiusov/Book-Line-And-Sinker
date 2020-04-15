drop database if exists goodreads_db;
create database goodreads_db;
use goodreads_db;
create table books (
  bookID int not null,
  title varchar(255),
  authors varchar(255),
  average_rating decimal,
  isbn varchar(16),
  isbn13 varchar(16),
  language_code varchar(16),
  num_pages int,
  ratings_count int,
  text_reviews_count int,
  publication_date date,
  publisher varchar(255),
  primary key(bookID)
);
