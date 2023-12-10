/*
 * Copyright (©) 09.07.2021, 17:13. Kolyada Nikita Vladimirovich (nikita.nk16@yandex.ru)
 */

import * as fs from 'fs'
import { logError, logInfo } from './log.lib'

export function createFile(filename: string, content: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        if (!fs.existsSync(filename)) {
            fs.writeFile(filename, content, (err) => {
                if (!err) {
                    logInfo(`File [${filename}] is created.`)
                    resolve()
                } else {
                    logError(`Error, file [${filename}] is not created.`, err.stack)
                    reject(err)
                }
            })
        } else {
            logInfo(`File [${filename}] exist.`)
            resolve()
        }
    })
}

export function createDir(path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        if (!fs.existsSync(path) || (fs.existsSync(path) && !fs.lstatSync(path).isDirectory())) {
            fs.mkdir(path, { recursive: true }, (err) => {
                if (!err) {
                    logInfo(`Directory [${path}] is created.`)
                    resolve()
                } else {
                    logError(`Error, directory [${path}] is not created.`, err.stack)
                    reject(err)
                }
            })
        } else {
            logInfo(`Directory [${path}] exist.`)
            resolve()
        }
    })
}

export function getFileNames(fullPath: string): string[] {
    const recursive = (path: string): string[] => {
        const folder = path.endsWith('/') ? path : path + '/'
        const files = fs.readdirSync(folder)
        let fileNames = []

        for (const filename of files) {
            const stat = fs.statSync(folder + filename)

            if (stat.isFile()) {
                fileNames.push(folder + filename)
            } else {
                const pathToFile = `${folder + filename}/`
                fileNames = [...fileNames, ...recursive(pathToFile)]
            }
        }

        return fileNames
    }

    return recursive(fullPath)
}

export function renameFile(oldName: string, newName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.rename(oldName, newName, (err) => {
            if (!err) {
                logInfo(`[${oldName}] renamed to [${newName}] successfully.`)
                resolve()
            } else {
                logError(`Error, [${oldName}] don't  renamed  to [${newName}]!`, err.stack)
                reject(err)
            }
        })
    })
}

export function removeDir(path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.rmdir(path, { recursive: true }, (err) => {
            if (!err) {
                logInfo(`[${path}] removed successfully.`)
                resolve()
            } else {
                logError(`Error, [${path}] don't removed!`, err.stack)
                reject(err)
            }
        })
    })
}

export function removeFile(path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.rm(path, (err) => {
            if (!err) {
                logInfo(`[${path}] removed successfully.`)
                resolve()
            } else {
                logError(`Warning, [${path}] don't removed!`, err.stack)

                if (err.stack?.includes('no such file')) {
                    resolve()
                } else {
                    reject(err)
                }
            }
        })
    })
}

interface IOptions {
    encoding: BufferEncoding
}

export function readLinesFile(path: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        const options: IOptions = { encoding: 'utf-8' }

        fs.readFile(path, options, (err, res) => {
            if (!err) {
                const lines = res.split(/\r?\n/)
                resolve(lines)
            } else {
                reject(err)
            }
        })
    })
}
