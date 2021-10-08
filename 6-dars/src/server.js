const express = require("express");
const path = require("path");
const { PORT } = require("../config");
const http = require("http");
const fs = require("fs").promises;
const axios = require("axios");
const server = express();

let app = http.createServer(server);

// settings -key value
server.set("view engine", "ejs");
server.set("views", path.join(__dirname, "views"));

// middleware
server.use("/", express.static(path.join(__dirname, "public")));
server.use(async (req, res, next) => {
    let count = await fs.readFile(path.join(__dirname, "count.txt"), "utf-8");

    count = Number(count);

    count++;

    await fs.writeFile(path.join(__dirname, "count.txt"), `${count}`);

    req.count = count;

    next();
});

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.get("/", async (req, res) => {
    res.render("index", {});
});

server.post("/", (req, res) => {
    console.log(req.body);

    res.send(req.body.num);
    res.send("dsda");
});

// EJS - embedded javascript

// SSR - server side rendering
// SPA - rest api

// request - so'rov;
// response - javob;

// GET - malumot olish
// POST - malumot yuborish
// PUT - update
// PATCH - update
// DELETE - o'chirish

app.listen(PORT, () => {
    console.log(`SERVER READY AT PORT ${PORT}`);
});

// html
/* pug
    p   
        dsdas
        b 
         dsdas
*/
