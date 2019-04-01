# express-api-server #

Un module pour rapidement créer des API en JSON bâti en utilisant [express.js](https://expressjs.com/)

## Démarrage ##

### Prérequis ###

* Node >= 8

### Installation ###

```
$ npm install express-api-server
```

### Exemple ###

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

Cette option spécifie le port à écouter pour les appels a l'API.

#### urlRoot ####

Type `String`

Cette option spécifie l'URL de base à utiliser pour créer des URLs complètement qualifiés (ex: pour la pagination).

Chaque route d'API donne accès a un `urlResolver` pour créer des URLs complètement qualifiés en utilisant l'URL de base fourni (ex:. `urlResolver.resolve('/people/2')`.

#### sentryDSN ####

Type: `String`

Cette option active l'enregistrement des erreurs de serveur de l'API vers une instance de[sentry](https://sentry.io/).

## License ##

Ce project est sous licence MIT - voir le fichier [LICENSE-fr.md](LICENSE-fr.md) pour plus de détails.
