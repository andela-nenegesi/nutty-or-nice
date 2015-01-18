var env_variables = {
  firebase: {
    serverUID: process.env.FB_SERVER_UID || "7bdbf437-c36c-48c8-9580-83f03dba8e6c",
    secretKey: process.env.FB_SECRET_KEY || "Peub7uKM1PfathecsfrZ0RB5vfW32Ph0lD1BErYn"
  },
  mailgun: {
    api_key: "key-20ad6adde44bd2d8f46903d7f268ba3e",
    email: "nad@nuttyornice.com"
  }
};

var config = {
  development: env_variables,
  production: env_variables
};
module.exports = config;