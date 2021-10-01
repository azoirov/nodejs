// Form qilish
// Ism va Tel

// JSON dan ism bo'yicha tekshirish
// Shunaqa ismli odam bazada bo'lsa error chiqaradi
// bo'lmasa bazaga yozib qo'yadi
const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const server = http.createServer(async (request, response) => {
    let url = request.url;
    let method = request.method;

    if (url === "/" && method === "GET") {
        response.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8",
        });
        let filePath = path.join(__dirname, "views", "index.html");
        let file = await fs.readFile(filePath, "utf-8");
        response.end(file);
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
                response.writeHead(201, {
                    "Content-Type": "text/json; charset=utf-8",
                });
                users.push({
                    name: body.name,
                    phone: body.phone,
                });

                await fs.writeFile(dbPath, JSON.stringify({ users }));

                response.end(JSON.stringify({ ok: true, users }));
            }
        });
    }
});

server.listen(80);
