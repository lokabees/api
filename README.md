🐝🐝🐝🐝 🚀🚀🚀🚀 

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]


<!-- PROJECT LOGO -->
<br />
<p align="center">
  <h3 align="center">Lokabees Backend</h3>

  <p align="center">
    Lokabees RESTful API. 

  <br />
  <a href="https://github.com/lokabees/api"><strong>Explore the docs »</strong></a>
  <br />
  <br />
  <a href="https://github.com/lokabees/api">View Demo</a>
  ·
  <a href="https://github.com/lokabees/api/issues">Report Bug</a>
  ·
  <a href="https://github.com/lokabees/api/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
  * [Built With](#built-with)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
* [Deployment](#usage)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)
* [Acknowledgements](#acknowledgements)



<!-- ABOUT THE PROJECT -->
## About The Project



### Built With
* [NodeJS](https://nodejs.org)
* [Babel](https://babeljs.io)
* [ExpressJS](https://expressjs.com)
* [MongoDB](https://mongodb.com)


<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps. 

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* [yarn](https://classic.yarnpkg.com/en/docs/install/#debian-stable)
* [mongoDB](https://docs.mongodb.com/manual/installation/)

The easiest way to install mongoDB is with docker: 
```sh
docker pull mongo
```

### Installation

2. Clone the repo
```sh
git clone git@github.com:lokabees/api.git
```
3. Install dependencies
```sh
yarn
```
4. Enter your variables in `.env.example` and rename the file to `.env`


<!-- USAGE EXAMPLES -->
## Usage

Start the server with:
```sh
yarn run dev
```
If it succesfully started, the output should look like this:
[![yarn run dev screenshot][yarn-run-dev-screenshot]](http://0.0.0.0:8080)


You should now be able to see the [Documentation](http://0.0.0.0:8080/docs)


You can run tests with:
```sh
yarn run test
```
or
```sh
yarn run test:coverage
```
to check the code coverage

## Adding routes / plugins / services

### Mongoose plugins

0. Read about [Mongoose Plugins](https://mongoosejs.com/docs/plugins.html)
1. Create your new plugin in `src/services/mongoose/plugins`
2. Make sure to export it in `src/services/mongoose/index.js`
3. Access the plugin in your model like this:
```js
import { yourPlugin } from 's/mongoose'
```

### Adding routes

```sh
yarn run generate
```
Enter your resource name

=> All required files should now be generated and you can start writing code!

1. Define ACL in /api/resource-name/acl.js
2. Define model in /api/resource-name/model.js
3. Write tests in /tests/api/resoure-name.test.js
4. Add middleware in /api/resource-name/index.js
5. Implement controllers in /api/resource-name/controller.js


### Services
1. Create your new service in a separate folder in `src/services`
2. Import it when necessary with `s/yourservice`

<!-- Deployment -->
## Deployment

### Heroku + MongoDB Atlas = 👁👄👁

1. Create a new heroku app
2. Enter the needed environment variables:
```
MASTER_KEY=
JWT_SECRET=
MONGODB_URI=
SENDGRID_KEY=
```
You can get a free mongoDB database from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and a free [SendGrid](https://sendgrid.com/) account for testing

3. `heroku git:remote -a <your-app-name>`
4. `git push heroku master`
5. Your API should now be online and accessible under: https://\<your-app-name>.herokuapp.com/ 🥳

### Docker

If you are using Atlas MongoDB:

`docker build -t restexpress .`

`docker run -p 8080:8080 --env-file .env restexpress:latest`

If you want to use docker-compose for your mongoDB Instance:

`docker-compose up`

<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/tguelcan/restexpress/issues) for a list of proposed features (and known issues)

Or take a look at the currently empty [project board](https://github.com/tguelcan/restexpress/projects/1)


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.


<!-- CONTACT -->
## Contact

Jonas Scholz - [@jscholz42](https://twitter.com/jscholz42)

Tayfun Gülcan - [@Tayfuuu](https://twitter.com/Tayfuuu) 


<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements
* [Img Shields](https://shields.io)
* [README Template](https://github.com/othneildrew/Best-README-Template)
* [Mongoose](https://github.com/Automattic/mongoose)
* [JWT](https://jwt.io/)
* [Swagger](https://swagger.io)
* [bodymen](https://github.com/diegohaz/bodymen)
* [querymen](https://github.com/diegohaz/querymen)
* [Jest](https://jestjs.io)
* [Sendgrid](https://sendgrid.com/)


[contributors-shield]: https://img.shields.io/github/contributors/tguelcan/restexpress.svg?style=flat-square
[contributors-url]: https://github.com/tguelcan/restexpress/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/tguelcan/restexpress.svg?style=flat-square
[forks-url]: https://github.com/tguelcan/restexpress/network/members
[stars-shield]: https://img.shields.io/github/stars/tguelcan/restexpress.svg?style=flat-square
[stars-url]: https://github.com/tguelcan/restexpress/stargazers
[issues-shield]: https://img.shields.io/github/issues/tguelcan/restexpress.svg?style=flat-square
[issues-url]: https://github.com/tguelcan/restexpress/issues
[license-shield]: https://img.shields.io/github/license/tguelcan/restexpress.svg?style=flat-square
[license-url]: https://github.com/tguelcan/restexpress/blob/master/LICENSE.md
[yarn-run-dev-screenshot]: images/yarn-run-dev-screenshot.png