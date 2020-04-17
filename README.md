# Book-Line-And-Sinker

## GET: /api/books/title/search/:title
returns all books with 'title' in the name

## GET: /api/books/author/search/:author
returns all books by the author

## GET: /api/bookshelf
returns all books for the authenticated user

## POST: /api/bookshelf/add
accepts JSON: `{ "bookId": <book.id> }`
returns JSON: `{ "success": <true/false>, "msg": <message>, "data": <inserted record> }`

## GET: /api/review/:bookId
returns success/fail object with the review in the `data` field

## POST: /api/rating
accepts JSON: `{ "bookId": <book.id>, "rating": <1 - 5> }`
returns success/fail object with the review in the `data` field

## POST: /api/review
accepts JSON: `{ "bookId": <book.id>, "rating": <1 - 5>, review: <text> }`
returns success/fail object with the review in the `data` field

## GET: /api/reviews
returns all reviews by the authenticated user

