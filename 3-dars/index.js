// HTTP
const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const server = http.createServer(async (request, response) => {
    let url = request.url;
    let method = request.method;

    if (url === "/") {
        response.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8",
        });

        let html = await fs.readFile(
            path.join(__dirname, "views", "index.html"),
            "utf8"
        );

        response.write(html);
        response.end();
    } else if (url === "/sign") {
        if (method === "GET") {
            response.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8",
            });

            let html = await fs.readFile(
                path.join(__dirname, "views", "about.html"),
                "utf8"
            );

            response.write(html);
            response.end();
        } else if (method === "POST") {
            let body = [];

            request.on("data", (data) => {
                body.push(data);
            });

            let requestBody = {};

            request.on("end", () => {
                body = body.map((data) => Buffer.from(data).toString());
                body = body[0].split("&");
                body.forEach((el) => {
                    let key = el.split("=")[0];
                    let value = el.split("=")[1];
                    requestBody[`${key}`] = value;
                });

                response.end(`${JSON.stringify(requestBody)}`);
            });
        }
    }
});

server.listen(8080);
