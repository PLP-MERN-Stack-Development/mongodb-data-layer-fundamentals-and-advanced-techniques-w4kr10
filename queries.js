use('plp_bookstore');
// ===========================================================
// TASK 2: BASIC CRUD OPERATIONS
// ===========================================================
// Finding a book by genre
db.books.find(
    {genre: "Science Fiction"}
)
// Finding books by a specific author
db.books.find(
    {author: "Herman Melville"}
)
// Finding books published after a certain year
db.books.find(
    {published_year: {$gte: 2000}}
)
//Updating a book's price
db.books.updateOne(
    {title: "The Alchemist"}, 
    {$set: {price: 9.99}}
)

// ===========================================================
// TASK 3: ADVANCED QUERIES
// ===========================================================

// 3.1 Find books that are both in stock and published after 2010
// Return only title, author, and price fields (projection)
db.books.find(
    { 
        in_stock: true, 
        published_year: { $gt: 2010 } 
    },
    { 
        title: 1, 
        author: 1, 
        price: 1, 
        _id: 0 
    }
);

// 3.2 Sort books by price - Ascending (lowest to highest)
db.books.find(
    { 
        in_stock: true,  
    },
    { 
        title: 1, 
        author: 1, 
        price: 1, 
        _id: 0 
    }
).sort({ price: 1 });

// 3.3 Sort books by price - Descending (highest to lowest)
db.books.find(
    { 
        in_stock: true,  
    },
    { 
        title: 1, 
        author: 1, 
        price: 1, 
        _id: 0 
    }
).sort({ price: -1 });

// 3.4 Pagination - Page 1 (first 5 books)
db.books.find(
    { 
        in_stock: true,  
    },
    { 
        title: 1, 
        author: 1, 
        price: 1, 
        _id: 0 
    }
).sort({ price: 1 }).limit(5).skip(0);

// 3.5 Pagination - Page 2 (next 5 books)
db.books.find(
    { 
        in_stock: true,  
    },
    { 
        title: 1, 
        author: 1, 
        price: 1, 
        _id: 0 
    }
).sort({ price: 1 }).limit(5).skip(5);


// ===========================================================
// TASK 4: AGGREGATION PIPELINE
// ===========================================================

// 4.1 Calculate average price of books by genre
// Groups books by genre, calculates average price, and sorts by average price descending
db.books.aggregate([
    {
        $group:{
        _id: "$genre",
        averagePrice: { $avg: "$price" },
        bookCount: { $sum: 1 }}
    },
    {
    $project: {
      genre: "$_id",
      averagePrice: { $round: ["$averagePrice", 2] },
      bookCount: 1,
      _id: 0}
    },
    {
    $sort: { averagePrice: -1 }
    }
]);

// 4.2 Find the author with the most books in the collection
// Groups by author, counts books, sorts by count descending, and returns top author
db.books.aggregate([
    {
        $group: {
        _id: "$author",
        bookCount: { $sum: 1 }
        }
    },
    {
        $sort: { bookCount: -1 }
    },
    {
        $limit: 1
    },
    {
        $project: {
        author: "$_id",
        bookCount: 1,
        _id: 0
        }
    }
]);

// 4.3 Group books by publication decade and count them
// Calculates decade from publication year, groups by decade, and counts books
db.books.aggregate([
    {
        $addFields: {
        decade: {
            $multiply: [
            { $floor: { $divide: ["$published_year", 10] } },
            10
            ]
        }
        }
    },
    {
        $group: {
        _id: "$decade",
        bookCount: { $sum: 1 }
        }
    },
    {
        $project: {
        decade: "$_id",
        bookCount: 1,
        _id: 0
        }
    },
    {
        $sort: { decade: 1 }
    }
]);

// ===========================================================
// TASK 5: INDEXING
// ===========================================================

// 5.1 Create an index on the title field for faster searches

db.books.createIndex({ title: 1 });

// 5.2 Create a compound index on author and publicationYear
// Compound index for queries filtering by both author and publication year
db.books.createIndex({ author: 1, published_year: 1 });

// Verify indexes were created successfully
db.books.getIndexes();


// 5.3 Demonstrate performance improvement with explain() - AFTER indexes

db.books.find({ title: "The Hobbit" }).explain("executionStats");
db.books.find({ 
  author: "J.R.R. Tolkien", 
  publicationYear: { $gt: 1930 } 
}).explain("executionStats");