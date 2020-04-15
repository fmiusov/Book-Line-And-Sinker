drop database if exists goodreadsDb;
create database goodreadsDb;
use goodreadsDb;
create table books (
  bookId int not null,
  title varchar(255),
  authors varchar(255),
  averageRating int,
  isbn varchar(16),
  isbn13 varchar(16),
  languageCode varchar(16),
  numPages int,
  ratingsCount int,
  textReviewsCount int,
  publicationDate date,
  publisher varchar(255),
  primary key(bookId)
);
