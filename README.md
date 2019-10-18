# express-api-server #

[![Build Status](https://travis-ci.org/StatCan/express-api-server.svg?branch=master)](https://travis-ci.org/StatCan/express-api-server)

A module for quickly creating JSON APIs built on [express.js](https://expressjs.com/)

## Getting Started ##

### Prerequisites ###

* Node >= 8

### Installing ###

```
$ npm install express-api-server
```

### Example ###

```javascript
// index.js

const server = require('express-api-server');
const endpoints = {
  'people': require('./people');
};
const settings = {
  port: 8000
};

server.getServer(endpoints, settings).start();
console.log('Started');
```

```javascript
// people.js

module.exports = {
  "/": (route, urlResolver) => {
    // /people
    route.get((req, res, next) => {
      res.locals.json = [
        {
          id: 1,
          name: "John Doe"
        },
        {
          id: 2,
          name: "Jane Doe"
        }
      ];
      next();
    });
  },
  "/:person_id": (route, urlResolver) => {
    // /people/2
    route.get((req, res, next) => {
      const personId = req.params.person_id;
      res.locals.json = {
        id: 2,
        name: "Jane Doe"
      };
      next();
    });
  }
}
```

### Options ###

#### port ####

Type: `Integer`

This option specifies on which port to listen for API calls.

#### urlRoot ####

Type `String`

This option specifies the root URL to use when creating fully qualified URLs (for pagination for example).

Each API route provide access to a `urlResolver` for creating fully qualified URLs using the provided root (e.g. `urlResolver.resolve('/people/2')`.

#### sentryDSN ####

Type: `String`

This option enables logging server errors in the API to a [sentry](https://sentry.io/) instance.

## License ##

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
