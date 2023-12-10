/*
 * Copyright (c) 22.11.2021, 18:35  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import config from '../../../config/config'
import msgs from '../../app/collections/messages'
import { Request, Response } from 'express'
import UserModel, { IUser } from '../models/schemes/user.schema'
import roles from '../collections/roles'
import { createUser, findOneUser, updateUser } from '../db.queries/user.queries'
import { errorResponse, successResponse, tryCatch } from '../lib/try-catch.lib'
import { check, Result, ValidationError, validationResult } from 'express-validator'

const genUserData = (user: IUser): IUser => {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        lastLoginDate: user.lastLoginDate,
        lastRecaptchaDate: user.lastRecaptchaDate,
        registrationDate: user.registrationDate,
    }
}

const genAccessToken = (user: IUser) => {
    const payload = genUserData(user)
    return jwt.sign(payload, config.server.secret, { expiresIn: '24h' })
}

export const validationRegProps = (req: Request): Result<ValidationError> => {
    const usernameRestrict = { min: 3, max: 20 }

    check('username', msgs.INCORRECT_USERNAME_LENGTH).isLength(usernameRestrict)
    check('email', msgs.INCORRECT_EMAIL).isEmail()

    return validationResult(req)
}

export const login = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.LOGIN_ERROR, res, func)

    tc(() => {
        const login: string = req.body.login
        const password: string = req.body.password
        const filter = { $or: [{ username: login }, { email: login }] }

        findOneUser(filter, {})
            .then((user) => {
                const validPass = user && bcrypt.compareSync(password, user.password)

                if (validPass) {
                    const token = genAccessToken(user)
                    const data = Object.assign({ token, isAuthorized: true }, genUserData(user))

                    updateUser(user.id, { lastLoginDate: new Date() })
                        .then(() => {
                            successResponse(res, msgs.USER_HAS_AUTHORIZED, { user: data })
                        })
                        .catch((err) => {
                            errorResponse(res, msgs.UPDATE_USER_ERROR, err, null, 400)
                        })
                } else {
                    errorResponse(res, msgs.INCORRECT_LOGIN_PARAMS)
                }
            })
            .catch((err) => {
                errorResponse(res, msgs.LOGIN_ERROR, err)
            })
    })
}

export const registration = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.REGISTRATION_ERROR, res, func)

    tc(() => {
        const errors = validationRegProps(req)

        if (errors.isEmpty()) {
            const regProps: IUser = req.body
            const filter = { $or: [{ username: regProps.username }, { email: regProps.email }] }

            findOneUser(filter)
                .then((candidate) => {
                    if (candidate) {
                        errorResponse(res, msgs.ERROR_USERNAME_IS_EXISTING)
                    } else if (regProps.agreeConditions && regProps.agreeAgreement) {
                        const hashPassword = bcrypt.hashSync(regProps.password, 7)

                        const user = new UserModel({
                            username: regProps.username,
                            password: hashPassword,
                            email: regProps.email,
                            lastLoginDate: new Date(),
                            lastRecaptchaDate: new Date(),
                            registrationDate: new Date(),
                            role: roles.USER.value,
                        })

                        createUser(user)
                            .then((createdUser) => {
                                successResponse(res, msgs.USER_HAS_REGISTERED, { user: createdUser })
                            })
                            .catch((err) => {
                                if (String(err).includes('duplicate key')) {
                                    errorResponse(res, msgs.ERROR_USERNAME_IS_EXISTING, err, null, 400)
                                } else {
                                    errorResponse(res, msgs.REGISTRATION_ERROR, err, null, 400)
                                }
                            })
                    } else {
                        errorResponse(res, msgs.USER_NOT_AGREEMENT)
                    }
                })
                .catch((err) => {
                    if (String(err).includes('duplicate key')) {
                        errorResponse(res, msgs.ERROR_USERNAME_IS_EXISTING, err, null, 400)
                    } else {
                        errorResponse(res, msgs.REGISTRATION_ERROR, err, null, 400)
                    }
                })
        } else {
            errorResponse(res, msgs.REGISTRATION_ERROR, null, errors, 400)
        }
    })
}

export const logout = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.LOGOUT_ERROR, res, func)

    tc(() => {
        const token = req.headers.authorization.split(' ')[1]
        if (token) {
            successResponse(res, msgs.USER_LOGOUT, {})
        } else {
            errorResponse(res, msgs.LOGOUT_ERROR)
        }
    })
}

export const isAuthorized = (req: Request, res?: Response): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
        const notSuccess = () => {
            res && res.status(403).send({ status: 403, success: false, message: msgs.USER_NOT_AUTHORIZED })
            resolve(false)
        }

        if (req.headers.authorization && req.headers.authorization.split(' ')[1]) {
            try {
                const token = req.headers.authorization.split(' ')[1]
                const data = jwt.verify(token, config.server.secret) as IUser
                const filter = { $or: [{ username: data.username }, { email: data.email }] }

                if (data) {
                    findOneUser(filter, {})
                        .then((foundedUser) => {
                            const user = Object.assign({ token, isAuthorized: true }, genUserData(foundedUser))
                            res && successResponse(res, msgs.CHECK_AUTH, { user })
                            resolve(true)
                        })
                        .catch(notSuccess)
                    resolve(true)
                } else {
                    notSuccess()
                }
            } catch (e) {
                notSuccess()
            }
        } else {
            notSuccess()
        }
    })
}

export const getAuthorizedUser = (authorization: string): IUser => {
    if (!authorization) return undefined

    const token = authorization.split(' ')[1]
    if (!token) return undefined

    try {
        return jwt.verify(token, config.server.secret) as IUser
    } catch (e) {
        return undefined
    }
}
