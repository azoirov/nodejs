require("dotenv").config();

const {env} = process;

module.exports = {
    PORT: env.PORT
}