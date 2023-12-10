import config from '../../../config/config'
import { getAuthorizedUser } from '../controllers/auth.controller'
import { avatarImgFilePattern, createImgsDir, getPathToPostImgDir, getPathToUserImgDir } from '../services/imgs.services'
import { logError } from './log.lib'
import * as multer from 'multer'
import { Request } from 'express'

interface FileFilterCallback {
    (error: Error): void

    (error: null, acceptFile: boolean): void
}

const getFileFilter = (req, file: Express.Multer.File, callback: FileFilterCallback): void => {
    if (config.server.fileFilters.includes(file.mimetype)) {
        callback(null, true)
    } else {
        callback(null, false)
    }
}

const getPostMulterStorage = () => {
    return multer.diskStorage({
        destination: (req: Request, file, callback) => {
            const user = getAuthorizedUser(req.headers.authorization)
            const description = req.body.description
            const postId = req.body.postId
            const pathToImgs = getPathToPostImgDir(postId, user)

            createImgsDir(pathToImgs, description)
                .then(() => {
                    callback(null, pathToImgs)
                })
                .catch((err) => {
                    logError('multer.diskStorage', err)
                })
        },
        filename: (req, file, callback) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const type = String(file.mimetype.split('/')[1])
            const filename = `${new Date().toISOString()}__${String(req.body.originalName)}.${type}`
            callback(null, filename)
        },
    })
}

export const postMulter = multer({
    storage: getPostMulterStorage(),
    limits: config.server.limits,
    fileFilter: getFileFilter,
})

const getUserMulterStorage = () => {
    return multer.diskStorage({
        destination: (req: Request, file, callback) => {
            const user = getAuthorizedUser(req.headers.authorization)
            const description = req.body.description
            const pathToImgs = getPathToUserImgDir(user)

            createImgsDir(pathToImgs, description)
                .then(() => {
                    callback(null, pathToImgs)
                })
                .catch((err) => {
                    logError('multer.diskStorage', err)
                })
        },
        filename: (req, file, callback) => {
            const user = getAuthorizedUser(req.headers.authorization)
            // const filename = `${new Date().toISOString()}_avatar__${user.username}`
            const filename = avatarImgFilePattern(user.username)

            callback(null, filename)
        },
    })
}

export const userMulter = multer({
    storage: getUserMulterStorage(),
    limits: config.server.limits,
    fileFilter: getFileFilter,
})
