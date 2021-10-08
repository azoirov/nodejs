const fs = require("fs/promises");
const path = require("path")
const slugify = require('slugify')

module.exports = class BookController {
    static async BooksGET(req, res) {
        let dbPath = path.join(__dirname, "..", "modules", "db.json");
        let db = await fs.readFile(dbPath, "utf-8");
        db = await JSON.parse(db);
        let books = db.books

        res.status(200).json({
            ok: true,
            books
        })
    }

    static async BookPOST(req, res) {
        const {name, year, author} = req.body;

        let dbPath = path.join(__dirname, "..", "modules", "db.json");
        let db = await fs.readFile(dbPath, "utf-8");
        db = await JSON.parse(db);

        let slug = slugify(name, { remove: /[*+~.()'"!:@]/g, lower: true})

        let book = db.books.find(el => el.slug === slug)
        
        if(book) {
            res.status(400).json({
                ok: false,
                message: "This book is already exists"
            })
            return 
        }

        book = {
            id: db.books.length + 1,
            name,
            year,
            author,
            slug
        };

        db.books.push(book);

        await fs.writeFile(dbPath, JSON.stringify(db));

        res.status(201).json({
            ok: true,
            message: "Created",
            book
        })
    }

    static async BookGET(req, res) {
        const {slug} = req.params;

        let dbPath = path.join(__dirname, "..", "modules", "db.json");
        let db = await fs.readFile(dbPath, "utf-8");
        db = await JSON.parse(db);

        let book = db.books.find(el => el.slug === slug);

        if(!book) {
            res.status(400).json({
                ok: false,
                message: "Invalid Book slug"
            })
            return
        }

        res.status(200).json({
            ok: true,
            book
        })
        
    }

    static async BookPATCH(req, res) {
        let dbPath = path.join(__dirname, "..", "modules", "db.json");
        let db = await fs.readFile(dbPath, "utf-8");
        db = await JSON.parse(db);

        let slug = slugify(req.params.slug, { remove: /[*+~.()'"!:@]/g, lower: true})

        let book = db.books.find(el => el.slug === slug)
        
        if(!book) {
            res.status(400).json({
                ok: false,
                message: "Invalid book"
            })
            return 
        }


        book = {...book, ...req.body}

        let bookIndex = db.books.findIndex(el => el.slug === book.slug);

        if(req.body.name) {
            book.slug = slugify(req.body.name, { remove: /[*+~.()'"!:@]/g, lower: true})
        }

        db.books[bookIndex] = book

        await fs.writeFile(dbPath, JSON.stringify(db));

        res.status(200).json({
            ok: true,
            message: "Updated",
            book
        })
    }

    static async BookDELETE(req, res) {
        let dbPath = path.join(__dirname, "..", "modules", "db.json");
        let db = await fs.readFile(dbPath, "utf-8");
        db = await JSON.parse(db);

        let slug = slugify(req.params.slug, { remove: /[*+~.()'"!:@]/g, lower: true})

        let book = db.books.find(el => el.slug === slug)
        
        if(!book) {
            res.status(400).json({
                ok: false,
                message: "Invalid book"
            })
            return 
        }

        let bookIndex = db.books.findIndex(el => el.slug === book.slug);

        db.books.splice(bookIndex, 1)

        await fs.writeFile(dbPath, JSON.stringify(db));

        res.status(200).json({
            ok: true,
            message: "Updated",
            books: db.books
        })
    }
}

// Number(typeof Number('dsadasdas'))
 
/*

    Online kurslar dokoni
    CRUD: CREATE READ UPDATE DELETE

    misol: /api/buy/:slug POST

    orders: [{ id, time, course_id }]

    req.headers["Authorization"]

*/