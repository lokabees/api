/* eslint-disable no-unused-vars */
import 'dotenv/config'
import { extractToken } from 's/auth/utils'

const requireProcessEnv = name => {
    if (!process.env[name]) {
        throw new Error('You must set the ' + name + ' environment variable')
    }
    return process.env[name]
}

const config = {
    all: {
        env: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 9000,
        ip: process.env.IP || '0.0.0.0',
        apiRoot: process.env.API_ROOT || '/api',
        masterKey: requireProcessEnv('MASTER_KEY'),
        maxSessionCount: 10,
        jwtConfig: {
            secret: requireProcessEnv('JWT_SECRET'),
            credentialsRequired: false,
            getToken: req => extractToken(req),
            expiresIn: '8d',
            algorithms: ['HS256']
        },
        mailchimpConfig: {
            secret: requireProcessEnv('MAILCHIMP_API'),
            list: requireProcessEnv('MAILCHIMP_LIST'),
            prefix: requireProcessEnv('MAILCHIMP_PREFIX')
        },
        fileUploadConfig: {
            limits: {
                fileSize: 10 * 1024 * 1024,
                files: 1 // This apparently does not abort the process, it just cuts off files over the limit?
            },
            safeFileNames: true,
            useTempFiles : true,
            abortOnLimit: true,
            tempFileDir : '/tmp/'
        },
        rateLimiter: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        },
        postmark: {
            apiKey: requireProcessEnv('POSTMARK_KEY'),
            emailTemplates: {
                welcome: 'd-e348a8a8a2f04a2e871e6fc6c26a5cfb',
                forgot: 'd-ac2e091839ab4112b1be2ff7d9d2d6d3'
            },
            defaultEmail: 'no-reply@lokabees.com'
        },
        mapbox: {
            accessToken: requireProcessEnv('MAPBOX_KEY')
        },
        cloudinaryConfig: {
            cloud_name: requireProcessEnv('CLOUDINARY_CLOUD_NAME'),
            api_key: requireProcessEnv('CLOUDINARY_API_KEY'),
            api_secret: requireProcessEnv('CLOUDINARY_API_SECRET')
        },
        swagger: {
            url: '/docs',
            swaggerDefinition: {
                openapi: '3.0.0',
                info: {
                    title: 'RESTexpress',
                    version: '1.0.0',
                    description:
                    'RESTexpress is a highly customizable REST backend and API generator',
                    license: {
                        name: 'MIT',
                        url: 'https://github.com/tguelcan/restexpress/blob/master/LICENSE'
                    },
                    contact: {
                        name: 'RESTexpress team',
                        url: 'https://your-website.com',
                        email: 'your-email@your-website.com'
                    }
                },
                servers: [
                    {
                        url: `http://localhost:${process.env.PORT || 9000}`
                    }
                ]
            },
            apis: ['src/**/*.js'],
            definitions: {}
        },
        i18nConfig: {
            locales: ['en', 'de'],
            directory: __dirname + '/../locales'
        }
    },
    test: {
        mongo: {
            uri: 'mongodb://localhost/testgenerator-test',
            options: {
                debug: false,
                useCreateIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            }
        }
    },
    development: {
        mongo: {
            uri: process.env.MONGODB_URI,
            options: {
                debug: true,
                useCreateIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            }
        }
    },
    production: {
        ip: process.env.IP || undefined,
        port: process.env.PORT || 8080,
        mongo: {
            uri: process.env.MONGODB_URI || 'mongodb://localhost/testgenerator',
            options: {
                debug: true,
                useCreateIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            }
        }
    },
    staging: {
        ip: process.env.IP || undefined,
        port: process.env.PORT || 8080,
        mongo: {
            uri: process.env.MONGODB_URI || 'mongodb://localhost/testgenerator',
            options: {
                debug: true,
                useCreateIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            }
        }
    }
}

module.exports = Object.assign(config.all, config[config.all.env])
export default module.exports
