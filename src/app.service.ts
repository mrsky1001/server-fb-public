/*
 * Copyright (c)  Kolyada Nikita Vladimirovich <nikita.nk16@yandex.ru> 12.09.2021, 15:37
 */

import * as http from 'http'
import * as https from 'https'
import * as fs from 'fs'
import * as express from 'express'
import * as cors from 'cors'
import * as morgan from 'morgan'
import * as cookieParser from 'cookie-parser'
import routerService from './app/router/router'
import * as mongoose from 'mongoose'
import * as bodyParser from 'body-parser'
import * as compression from 'compression'
import config from '../config/config'
import * as core from 'express-serve-static-core'
import { logError, logInfo } from './core/lib/log.lib'

export class AppService {
    public app: core.Express
    public server: http.Server

    constructor() {
        this.app = express()
        this._initApp()
        this._initDB()
    }

    private _initApp() {
        this.app.use(cors())
        this.app.use(bodyParser.json({ limit: config.app.limit }))
        this.app.use(bodyParser.urlencoded({ extended: true }))
        this.app.use(cookieParser())
        this.app.use(compression())
        this.app.use(morgan('combined'))
        this.app.use(routerService.router)

        return this.app
    }

    private _initDB() {
        mongoose
            .connect(config.db.url)
            .then(() => {
                logInfo('Successfully connected to MongoDB Database!')
            })
            .catch((err) => {
                logError('Database Connection Error: ', String(err), 'Reload MongoDB!')
                process.exit()
            })
    }

    private _initHTTPS() {
        const options = {
            key: fs.readFileSync(config.paths.privKey),
            cert: fs.readFileSync(config.paths.cert),
        }

        https.createServer(options, this.app).listen(config.server.port, config.server.host, () => {
            logInfo(`Server listens ${config.server.fullHost}`)
        })
    }

    private _initLocal() {
        this.server = this.app.listen(config.server.port, () => {
            logInfo(`Local-server start ${config.server.fullHost} ...`)
        })
    }

    start(): void {
        if (config.app.isProd) {
            this._initHTTPS()
        } else {
            this._initLocal()
        }
    }

    stop(): void {
        this.server.close()
    }
}

export default new AppService()
