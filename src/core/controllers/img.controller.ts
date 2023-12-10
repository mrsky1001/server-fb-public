/*
 * Copyright (c) 22.11.2021, 18:35  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */
import { Request, Response } from 'express'
import { errorResponse, successResponse, tryCatch } from '../lib/try-catch.lib'
import msgs from '../../app/collections/messages'
import { getAuthorizedUser } from './auth.controller'
import { getAvatarPath, getPathToPostImgDir, imgCompressor } from '../services/imgs.services'
import config from '../../../config/config'
import { strToUrlFormat } from '../services/posts.service'
import { getFileNames, removeFile, renameFile } from '../lib/file.lib'
import { updateUser } from '../db.queries/user.queries'

export const getImg = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.GET_IMG_ERROR, res, func)

    tc(() => {
        const image = req.params[0]
        res.sendFile(`${config.paths.imgFolder}${image}`)
    })
}

export const uploadImg = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.UPLOAD_IMG_ERROR, res, func)

    tc(() => {
        const file = req.file

        imgCompressor(file.path, file.destination)
            .then((compressedFile: string) => {
                const urlFormatName = `${strToUrlFormat(req.file.filename)}.webp`
                const newImgFile = `${file.destination}/${urlFormatName}`
                const urlPath = `${file.destination.substr(config.paths.prodSite.length)}/${urlFormatName}`
                const imgUrl = `${config.server.fullHost}${urlPath}`

                renameFile(compressedFile, newImgFile)
                    .then(() => {
                        successResponse(res, msgs.IMG_SAVED, { imgUrl })
                    })
                    .catch((err) => {
                        errorResponse(res, msgs.IMG_NOT_SAVED, err.stack)
                    })
            })
            .catch((err) => {
                errorResponse(res, msgs.IMG_NOT_SAVED, err)
            })
    })
}

export const removeImg = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.DELETE_IMG_ERROR, res, func)

    tc(() => {
        const postId = req.body.postId
        const imgUrl: string = req.body.imgUrl

        const user = getAuthorizedUser(req.headers.authorization)
        const reg = new RegExp(/(?!\/)(?:.(?!\/))+$/g)
        const filename: string = reg.exec(imgUrl)[0]
        const folder = getPathToPostImgDir(postId, user)
        const img = `${folder}/${filename}`

        removeFile(img)
            .then(() => {
                successResponse(res, msgs.IMG_DELETED)
            })
            .catch((err) => {
                errorResponse(res, msgs.IMG_NOT_DELETED, err.stack)
            })
    })
}
export const removeAvatarImg = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.DELETE_AVATAR_IMG_ERROR, res, func)
    const avatarPath = getAvatarPath(req.headers.authorization)

    tc(() => {
        removeFile(avatarPath)
            .then(() => {
                const user = getAuthorizedUser(req.headers.authorization)
                const data = { avatar: '' }

                updateUser(user.id, data)
                    .then((updatedUser) => {
                        successResponse(res, msgs.IMG_DELETED, { user: updatedUser })
                    })
                    .catch((err) => {
                        errorResponse(res, msgs.IMG_NOT_DELETED, err, null, 400)
                    })
            })
            .catch((err) => {
                errorResponse(res, msgs.IMG_NOT_DELETED, err.stack)
            })
    })
}

export const getAllImages = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.GET_ALL_IMG_ERROR, res, func)

    tc(() => {
        const postId = req.params.postId
        const user = getAuthorizedUser(req.headers.authorization)
        const folder = getPathToPostImgDir(postId, user)
        const imgFormats = ['webp', 'jpg', 'png', 'jpeg', 'gif', 'bmp']

        const urls: string[] = []

        getFileNames(folder).forEach((filename) => {
            const format = filename.substring(filename.lastIndexOf('.') + 1)
            if (imgFormats.includes(format)) {
                const urlPath = `${filename.substring(config.paths.prodSite.length)}`
                urls.push(`${config.server.fullHost}${urlPath}`)
            }
        })

        successResponse(res, msgs.IMAGES_FOUND, { imgs: urls })
    })
}
