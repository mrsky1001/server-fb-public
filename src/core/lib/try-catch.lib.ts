/*
 * Copyright (©) 15.09.2021, 11:57. Kolyada Nikita Vladimirovich (nikita.nk16@yandex.ru)
 */
import { logError } from './log.lib'
import { Response } from 'express'

export interface IResponseAnswer {
    status: number
    success: boolean
    message: string
    data?: any
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const successResponse = (res: Response, msg: string, data?: any, status = 200): void => {
    res.status(status).send({ status: status, success: true, message: msg, data: data })
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const errorResponse = (res: Response, msg: string, err = msg, data?: any, status = 500): void => {
    msg === err ? logError(msg) : logError(msg, err)
    res.status(status).send({ status: status, success: false, message: msg, data: data })
}

export const tryCatch = (msg: string, res: Response, callback: () => any, data = null, status = 500): void => {
    try {
        callback()
    } catch (error) {
        const err = error as Error
        const message = err ? `${msg} / ${String(err)}` : msg

        !res.writableEnded && errorResponse(res, msg, data, status)
        logError(message, `Ошибка ${err.name}:`, err.message, err.stack)
    }
}
