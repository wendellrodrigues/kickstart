const routes = require("next-routes")(); //Module returns function, so invoke using ()

//If a
routes
  .add("/campaigns/new", "/campaigns/new")
  .add("/campaigns/:address", "/campaigns/show");

module.exports = routes;
