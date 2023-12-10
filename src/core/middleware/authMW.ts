/*
 * Copyright (c)  Kolyada Nikita Vladimirovich <nikita.nk16@yandex.ru> 27.09.2021, 22:08
 */

import { Request, Response } from 'express'
import { getAuthorizedUser } from '../controllers/auth.controller'
import { errorResponse } from '../lib/try-catch.lib'
import msgs from '../../app/collections/messages'
import { NextFunction } from 'express-serve-static-core'
import { IRole } from '../models/schemes/role.schema'
import config from '../../../config/config'
import * as fetch from 'isomorphic-fetch'
import { findOneUser, updateUser } from '../db.queries/user.queries'
import { dateCompareToMlSc } from '../lib/date.lib'

export const authMW = (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'OPTIONS') {
        next()
    }

    try {
        const user = getAuthorizedUser(req.headers.authorization)

        if (user) {
            next()
        } else {
            errorResponse(res, msgs.USER_NOT_AUTHORIZED, undefined, null, 403)
        }
    } catch (e) {
        errorResponse(res, msgs.USER_NOT_AUTHORIZED)
    }
}

/**
 * @param timePass in milliseconds
 */

export const recaptchaMW = (timePass = 0) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const checkRecaptcha = () => {
            try {
                const responseKey: string = req.body.responseKey
                const url = `https://www.google.com/recaptcha/api/siteverify?secret=${config.server.recaptchaKey}&response=${responseKey}`

                fetch(url, {
                    method: 'post',
                })
                    .then((response) => response.json())
                    .then((googleResponse: { success: boolean }) => {
                        if (googleResponse.success) {
                            if (user && user.id) {
                                updateUser(user.id, { lastRecaptchaDate: new Date() })
                                    .then(() => {
                                        return next()
                                    })
                                    .catch((err) => {
                                        return errorResponse(res, msgs.UPDATE_USER_ERROR, err, null, 400)
                                    })
                            } else {
                                return next()
                            }
                        } else {
                            return errorResponse(res, msgs.RECAPTCHA_NOT_PASS, undefined, null, 403)
                        }
                    })
                    .catch((err) => {
                        return errorResponse(res, msgs.RECAPTCHA_CHECKING_ERROR, err)
                    })
            } catch (err) {
                return errorResponse(res, msgs.RECAPTCHA_CHECKING_ERROR, err)
            }
        }

        if (req.method === 'OPTIONS') {
            next()
        }

        const user = getAuthorizedUser(req.headers.authorization)

        if (timePass && user) {
            findOneUser({ _id: user.id })
                .then((foundedUser) => {
                    if (foundedUser.lastRecaptchaDate && dateCompareToMlSc(foundedUser.lastRecaptchaDate) < timePass) {
                        return next()
                    } else {
                        checkRecaptcha()
                    }
                })
                .catch(() => {
                    return errorResponse(res, msgs.USER_NOT_FOUND, undefined, null, 404)
                })
        } else {
            checkRecaptcha()
        }
    }
}
export const roleMW = (role: IRole) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (req.method === 'OPTIONS') {
            next()
        }

        try {
            const user = getAuthorizedUser(req.headers.authorization)

            if (user) {
                if (user.role <= role.value) {
                    next()
                } else {
                    errorResponse(res, msgs.NOT_ALLOWED, undefined, null, 405)
                }
            } else {
                errorResponse(res, msgs.USER_NOT_AUTHORIZED, undefined, null, 403)
            }
        } catch (e) {
            errorResponse(res, msgs.NOT_ALLOWED)
        }
    }
}
