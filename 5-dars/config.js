require("dotenv").config();

// Destruction
const { env } = process;

module.exports = {
    PORT: env.PORT,
    SECRET_WORD: env.SECRET_WORD
};
