const express = require("express");
const fs = require("fs");
const path = require("path");
const CookieParser = require("cookie-parser")
const morgan = require("morgan");
const slugify = require("slugify");

const { PORT } = require("../config");

const app = express();

app.listen(PORT, _ => {
    console.log(`SERVER READY AT http://localhost:${PORT}`)
})

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(CookieParser())
app.use(morgan("tiny"))

// Routes
fs.readdir(path.join(__dirname, "routes"), (err, files) => {
    if(!err) {
        files.forEach(file => {
            let routePath = path.join(__dirname, "routes", file);
            const Route = require(routePath);

            if(Route.path && Route.router) app.use(Route.path, Route.router)
        })
    }
})

// helmet morgan

// routes - contollers

// api
// GET /books - hamma kitoblarchi jsonda chiqaradi - done
// GET /books/nodejs - 1-kitobni chiqaradi - done
// POST /books - kitob bazaga saqlanadi - done
// PATCH /books/1 - kitobni o'zgartirish
// DELETE /books/1 - kitobni o'chiradi