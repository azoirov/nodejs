const express = require("express");
const JWT = require("jsonwebtoken");
const path = require("path");
const server = express();
const CookieParser = require("cookie-parser");
const fs = require("fs").promises;
const { PORT, SECRET_WORD } = require("./config");

// settings
server.set("view engine", "ejs");
server.set("views", path.join(__dirname, "ejs"));

server.use(CookieParser());

server.use(express.urlencoded({ extended: true }));
server.use(express.json());

server.get("/", async (req, res) => {
    let token = req.cookies.token;

    if (!token) {
        res.redirect("/login");
        return
    }

    token = jwtVerify(token);

    if (!token) {
        res.redirect("/login");
        return
    }

    let db = await fs.readFile(path.join(__dirname, "database.json"), "utf-8");
    db = await JSON.parse(db);

    delete db.users[token.id - 1]

    res.render("index", {
        title: "CHAT",
        users: db.users
    });
});

server.get("/login", (req, res) => {
    res.render("login", {
        title: "LOGIN",
    });
});

server.post("/login", async (req, res) => {
    const { name } = req.body;
    let db = await fs.readFile(path.join(__dirname, "database.json"), "utf-8");
    db = await JSON.parse(db);
    let { users, messages } = db;

    let user = users.find(
        (user) => user.name.toLowerCase() === name.toLowerCase()
    );

    if (!user) {
        user = {
            id: users.length + 1,
            name: name,
        };
        db.users.push(user);
    }
    
    await fs.writeFile(path.join(__dirname, "database.json"), JSON.stringify(db))

    let token = JWT.sign(user, SECRET_WORD);

    res.cookie("token", token).redirect("/");
});

server.get("/chat/:id", async (req, res) => {
    let token = req.cookies.token;

    if (!token) {
        res.redirect("/login");
        return
    }

    token = jwtVerify(token);

    if (!token) {
        res.redirect("/login");
        return
    }
    const { id: userId } = req.params
    let me = jwtVerify(req.cookies.token)
    let db = await fs.readFile(path.join(__dirname, "database.json"), "utf-8");
    db = await JSON.parse(db);
    console.log(db)
    let user = db.users[userId - 1];

    let messages = db.messages.filter(message => {
        return (message.from == me.id && message.to == userId) || ( message.to == me.id && message.from == userId)
    })

    res.render("chat", {
        messages: messages,
        user: user,
        title: `Chat | ${user.name}`
    })

})

server.post("/chat/:id", async (req, res) => {
    const {text} = req.body

    let me = jwtVerify(req.cookies.token);

    if(me) {
        if(text) {
            let message = {
                from: me.id,
                to: Number(req.params.id),
                text
            }
            let db = await fs.readFile(path.join(__dirname, "database.json"), "utf-8");
            db = await JSON.parse(db);
            db.messages.push(message);

            await fs.writeFile(path.join(__dirname, "database.json"), JSON.stringify(db))

            res.redirect(req.url)
        }
    }
})

server.listen(PORT, () => console.log(`SERVER READY AT PORT ${PORT}`));

// SSR - server side rendering - EJS (embedded javascript)
// Rest API - SPA
// SEO - search engine optimization

// Destruction
// const obj = {
//     x: 1,
//     y: 2,
// };

// let { x: num } = obj;

// // console.log(num);
// Middleware

function jwtVerify(token) {
    try {
        token = JWT.verify(token, SECRET_WORD);
        return token;
    } catch (e) {
        return false;
    }
}
