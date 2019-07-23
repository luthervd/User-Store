"use-strict";
const UserStoreApp = require("./app/userStore");

module.exports = {
    default : () => new UserStoreApp(),
    withConfig: (config) => new UserStoreApp(config)
}