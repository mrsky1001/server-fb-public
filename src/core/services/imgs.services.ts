/*
 * Copyright (c)  Kolyada Nikita Vladimirovich <nikita.nk16@yandex.ru> 12.09.2021, 21:59
 */
import config from '../../../config/config'
import { IUser } from '../models/schemes/user.schema'
import { createDir, createFile, removeDir, removeFile } from '../lib/file.lib'
import * as fs from 'fs'
import * as compressImages from 'compress-images'
import { getAuthorizedUser } from '../controllers/auth.controller'

export const getPathToUserImgDir = (user: IUser): string => {
    return `${String(config.paths.imgFolder)}${user.username}_${user.id}`
}

export const getPathToPostImgDir = (postId: string, user: IUser): string => {
    return `${getPathToUserImgDir(user)}/${postId}`
}

export const createImgsDir = (pathToFolder: string, description: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        const pathToFile = `${pathToFolder}/img_folder_description.txt`
        const data = `${description}\n${new Date().toISOString()}`

        createDir(pathToFolder)
            .then(() => {
                createFile(pathToFile, data)
                    .then(() => {
                        resolve()
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const deletePostImgsDir = (postTitle: string, postId: string, user: IUser): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        const pathToFolder = `${String(config.paths.imgFolder)}${user.username}_${user.id}/${postId}`

        removeDir(pathToFolder)
            .then(() => {
                resolve()
            })
            .catch((err) => {
                reject(err)
            })
    })
}
// export const decodeBase64Image = (dataString: string): IImgFile => {
//     const matches = /^data:([A-Za-z-+/]+);base64,(.+)$/.exec(dataString)
//     const response: IImgFile = { type: '', data: null }
//
//     if (matches.length !== 3) {
//         new Error('Invalid input string')
//     }
//
//     response.type = matches[1]
//     response.data = new Buffer(matches[2], 'base64')
//
//     return response
// }
export const imgCompressor = (imgPath: string, saveFolder: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const sizeImg = fs.statSync(imgPath).size / (1024 * 1024)
        let quality = ['-q', '1']

        if (sizeImg < 1) {
            quality = ['-q', '100']
        } else if (sizeImg < 5) {
            quality = ['-q', '50']
        } else if (sizeImg < 10) {
            quality = ['-q', '30']
        } else if (sizeImg < 20) {
            quality = ['-q', '20']
        }

        const saveFolder2 = saveFolder.endsWith('/') ? saveFolder : saveFolder + '/'
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        compressImages(
            imgPath,
            saveFolder2,
            { compress_force: false, statistic: true, autoupdate: false },
            false,
            { jpg: { engine: 'webp', command: quality } },
            { png: { engine: 'webp', command: quality } },
            { svg: { engine: 'svgo', command: false } },
            { gif: { engine: false, command: false } },
            (error, completed, statistic) => {
                if (!error) {
                    if (statistic) {
                        removeFile(statistic.input)
                            .then(() => {
                                resolve(statistic.path_out_new)
                            })
                            .catch((error) => {
                                reject(error)
                            })
                    } else {
                        resolve(imgPath)
                    }
                } else {
                    reject(error)
                }
            }
        )
    })
}

export const avatarImgFilePattern = (username: string): string => `${'avatar__' + username}`

export const getAvatarPath = (authorization: string): string => {
    const user = getAuthorizedUser(authorization)
    const folder = getPathToUserImgDir(user)
    const name = avatarImgFilePattern(user.username)
    return `${folder}/${name}.webp`
}
