const crypto = require("crypto");
const key = crypto.randomBytes(32).toString("hex").slice(0, 32);
console.log(key);