const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const { emit } = require("process");

const server = http.createServer(async (request, response) => {
    let url = request.url;
    let method = request.method;

    if (url === "/" && method === "GET") {
        if (request.headers.cookie.split("=")[0] === "name") {
            response.writeHead(200, {
                Location: "http://localhost/chat",
            });
            response.end();
        } else {
            response.writeHead(300, {
                "Content-Type": "text/html; charset=utf-8",
            });
            let filePath = path.join(__dirname, "views", "index.html");
            let file = await fs.readFile(filePath, "utf-8");
            response.end(file);
        }
    } else if (url === "/" && method === "POST") {
        let body = {};

        request.on("data", (data) => {
            let reqBody = Buffer.from(data).toString();
            reqBody = reqBody.split("&");
            reqBody.forEach((el) => {
                el = el.split("=");
                body[el[0]] = el[1];
            });
        });

        request.on("end", async () => {
            let dbPath = path.join(__dirname, "database.json");

            let database = await fs.readFile(dbPath, "utf-8");
            database = await JSON.parse(database);
            let users = database.users;
            let error = users.find(
                (user) => user.name.toLowerCase() === body.name.toLowerCase()
            );
            if (error) {
                // error
                response.writeHead(404, {
                    "Content-Type": "text/json",
                });

                response.end(
                    JSON.stringify({
                        ok: false,
                        message: "User already exists",
                    })
                );
            } else {
                let user = {
                    name: body.name,
                    phone: body.phone,
                };

                users.push(user);

                await fs.writeFile(dbPath, JSON.stringify({ users }));

                response.writeHead(201, {
                    "Set-Cookie": `name=${body.name}`,
                    "Content-Type": "text/html; charset=utf-8",
                });

                let me = request.headers.cookie.split("=")[1];
                console.log(me);

                let messages = await fs.readFile(
                    path.join(__dirname, "chat.json"),
                    "utf-8"
                );
                messages = await JSON.parse(messages);
                messages = messages.messages;

                response.end(`<!DOCTYPE html>
            <html lang="en">
                <head>
                    <!-- Required meta tags -->
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
            
                    <!-- Bootstrap CSS -->
                    <link
                        href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
                        rel="stylesheet"
                        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
                        crossorigin="anonymous"
                    />
            
                    <title>Chat Page</title>
                </head>
                <body>
                    <div class="container vh-100">
                        <div class="row vh-100">
                            <div class="col-4 border border-right">
                                <h1 class="my-3">Users</h1>
                                <ul class="list-group">
                                    ${users.map(
                                        (user) =>
                                            `<li class="${
                                                user.name.toLowerCase() ===
                                                me.toLowerCase()
                                                    ? "bg-primary text-light"
                                                    : ""
                                            } list-group-item">${
                                                user.name
                                            }</li>`
                                    )}
                                </ul>
                            </div>
                            <div
                                class="col-8 vh-100"
                                style="display: flex; flex-direction: column"
                            >
                                <div
                                    class="chat overflow-auto border border-primary"
                                    style="flex: 1"
                                >
                                    <ul
                                        class="p-5 list-group overflow-auto"
                                        style="height: 80%"
                                    >
                                        ${messages.map(
                                            (
                                                message
                                            ) => `<li class="w-100 list-group-item">
                                        <h5>${message.name}</h5>
                                        <hr />
                                        ${message.message}
                                    </li>`
                                        )}
    
                                        
                                    </ul>
                                </div>
                                <form
                                    action="/chat"
                                    style="
                                        height: 60px;
                                        align-items: center;
                                        display: flex;
                                        justify-content: space-between;
                                        padding: 0px 15px;
                                        border: 1px solid #ccc;
                                    "
                                    method="POST"
                                >
                                    <input
                                        type="text"
                                        name="message"
                                        placeholder="Type message...."
                                        class="form-control"
                                    />
                                    <button type="submit" class="btn btn-primary">
                                        Send
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
            
                    <!-- Optional JavaScript; choose one of the two! -->
            
                    <!-- Option 1: Bootstrap Bundle with Popper -->
                    <script
                        src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
                        integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
                        crossorigin="anonymous"
                    ></script>
            
                    <!-- Option 2: Separate Popper and Bootstrap JS -->
                    <!--
                <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js" integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous"></script>
                --></body>
            </html>
            `);
            }
        });
    } else if (url === "/chat" && method === "GET") {
        response.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8",
        });

        let users = await fs.readFile(
            path.join(__dirname, "database.json"),
            "utf-8"
        );
        users = await JSON.parse(users);
        users = users.users;

        let me = request.headers.cookie.split("=")[1];

        let messages = await fs.readFile(
            path.join(__dirname, "chat.json"),
            "utf-8"
        );
        messages = await JSON.parse(messages);
        messages = messages.messages;

        response.end(`<!DOCTYPE html>
        <html lang="en">
            <head>
                <!-- Required meta tags -->
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
        
                <!-- Bootstrap CSS -->
                <link
                    href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
                    rel="stylesheet"
                    integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
                    crossorigin="anonymous"
                />
        
                <title>Chat Page</title>
            </head>
            <body>
                <div class="container vh-100">
                    <div class="row vh-100">
                        <div class="col-4 border border-right">
                            <h1 class="my-3">Users</h1>
                            <ul class="list-group">
                                ${users.map(
                                    (user) =>
                                        `<li class="${
                                            user.name.toLowerCase() ===
                                            me.toLowerCase()
                                                ? "bg-primary text-light"
                                                : ""
                                        } list-group-item">${user.name}</li>`
                                )}
                            </ul>
                        </div>
                        <div
                            class="col-8 vh-100"
                            style="display: flex; flex-direction: column"
                        >
                            <div
                                class="chat overflow-auto border border-primary"
                                style="flex: 1"
                            >
                                <ul
                                    class="p-5 list-group overflow-auto"
                                    style="height: 80%"
                                >
                                    ${messages.map(
                                        (
                                            message
                                        ) => `<li class="w-100 list-group-item">
                                    <h5>${message.name}</h5>
                                    <hr />
                                    ${message.message}
                                </li>`
                                    )}

                                    
                                </ul>
                            </div>
                            <form
                                action="/chat"
                                style="
                                    height: 60px;
                                    align-items: center;
                                    display: flex;
                                    justify-content: space-between;
                                    padding: 0px 15px;
                                    border: 1px solid #ccc;
                                "
                                method="POST"
                            >
                                <input
                                    type="text"
                                    name="message"
                                    placeholder="Type message...."
                                    class="form-control"
                                />
                                <button type="submit" class="btn btn-primary">
                                    Send
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
        
                <!-- Optional JavaScript; choose one of the two! -->
        
                <!-- Option 1: Bootstrap Bundle with Popper -->
                <script
                    src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
                    integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
                    crossorigin="anonymous"
                ></script>
        
                <!-- Option 2: Separate Popper and Bootstrap JS -->
                <!--
            <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js" integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous"></script>
            --></body>
        </html>
        `);
    } else if (url === "/chat" && method === "POST") {
        let body = {};

        request.on("data", (data) => {
            data = Buffer.from(data).toString();
            console.log(data);
            body[data.split("=")[0]] = data.split("=")[1].replaceAll("+", " ");
        });

        request.on("end", async () => {
            let name = request.headers.cookie.split("=");
            body.name = name[1];
            console.log(body);
            let chatPath = path.join(__dirname, "chat.json");
            let chat = await fs.readFile(chatPath, "utf-8");
            chat = await JSON.parse(chat);
            chat.messages.push(body);
            await fs.writeFile(chatPath, JSON.stringify(chat));

            response.writeHead(201, {
                Location: "http://localhost:80/chat",
            });
            let users = await fs.readFile(
                path.join(__dirname, "database.json"),
                "utf-8"
            );
            users = await JSON.parse(users);
            users = users.users;

            let me = request.headers.cookie.split("=")[1];

            let messages = await fs.readFile(
                path.join(__dirname, "chat.json"),
                "utf-8"
            );
            messages = await JSON.parse(messages);
            messages = messages.messages;

            response.end(`<!DOCTYPE html>
            <html lang="en">
                <head>
                    <!-- Required meta tags -->
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
            
                    <!-- Bootstrap CSS -->
                    <link
                        href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
                        rel="stylesheet"
                        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
                        crossorigin="anonymous"
                    />
            
                    <title>Chat Page</title>
                </head>
                <body>
                    <div class="container vh-100">
                        <div class="row vh-100">
                            <div class="col-4 border border-right">
                                <h1 class="my-3">Users</h1>
                                <ul class="list-group">
                                    ${users.map(
                                        (user) =>
                                            `<li class="${
                                                user.name.toLowerCase() ===
                                                me.toLowerCase()
                                                    ? "bg-primary text-light"
                                                    : ""
                                            } list-group-item">${
                                                user.name
                                            }</li>`
                                    )}
                                </ul>
                            </div>
                            <div
                                class="col-8 vh-100"
                                style="display: flex; flex-direction: column"
                            >
                                <div
                                    class="chat overflow-auto border border-primary"
                                    style="flex: 1"
                                >
                                    <ul
                                        class="p-5 list-group overflow-auto"
                                        style="height: 80%"
                                    >
                                        ${messages.map(
                                            (
                                                message
                                            ) => `<li class="w-100 list-group-item">
                                        <h5>${message.name}</h5>
                                        <hr />
                                        ${message.message}
                                    </li>`
                                        )}
    
                                        
                                    </ul>
                                </div>
                                <form
                                    action="/chat"
                                    style="
                                        height: 60px;
                                        align-items: center;
                                        display: flex;
                                        justify-content: space-between;
                                        padding: 0px 15px;
                                        border: 1px solid #ccc;
                                    "
                                    method="POST"
                                >
                                    <input
                                        type="text"
                                        name="message"
                                        placeholder="Type message...."
                                        class="form-control"
                                    />
                                    <button type="submit" class="btn btn-primary">
                                        Send
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
            
                    <!-- Optional JavaScript; choose one of the two! -->
            
                    <!-- Option 1: Bootstrap Bundle with Popper -->
                    <script
                        src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
                        integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
                        crossorigin="anonymous"
                    ></script>
            
                    <!-- Option 2: Separate Popper and Bootstrap JS -->
                    <!--
                <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js" integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous"></script>
                --></body>
            </html>
            `);
        });
    }
});

server.listen(80);

/*

    1- Login
    2- Logindan login qilgan userni ozini qaytaramiz
    3- Front js dan cookieStorage ga userni saqlaymiz
    4- chat ochiladi

*/
