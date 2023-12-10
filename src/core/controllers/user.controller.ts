/*
 * Copyright (c) 22.11.2021, 18:35  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */
import * as bcrypt from 'bcrypt'
import msgs from '../../app/collections/messages'
import { Request, Response } from 'express'
import UserModel, { IUser } from '../models/schemes/user.schema'
import { createUser, deleteUser, findOneUser, findUsers, updateUser } from '../db.queries/user.queries'
import { errorResponse, successResponse, tryCatch } from '../lib/try-catch.lib'
import { getAuthorizedUser, validationRegProps } from './auth.controller'
import roles from '../collections/roles'

export const getUser = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.GET_USER_ERROR, res, func)

    tc(() => {
        const user: IUser = getAuthorizedUser(req.headers.authorization)
        const filter = { _id: user.id }

        findOneUser(filter)
            .then((foundedUser) => {
                successResponse(res, msgs.USER_HAS_FOUND, { user: foundedUser })
            })
            .catch((err) => {
                errorResponse(res, msgs.GET_USER_ERROR, err, null, 404)
            })
    })
}

export const getUserById = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.GET_USER_ERROR, res, func)

    tc(() => {
        const filter = { _id: req.params.userId }

        findOneUser(filter)
            .then((foundedUser) => {
                if (foundedUser) {
                    successResponse(res, msgs.USER_HAS_FOUND, { user: foundedUser })
                } else {
                    successResponse(res, msgs.USER_NOT_FOUND)
                }
            })
            .catch((err) => {
                errorResponse(res, msgs.GET_USER_ERROR, err, null, 404)
            })
    })
}

export const getUsers = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.GET_USERS_ERROR, res, func)

    tc(() => {
        findUsers({})
            .then((users) => {
                if (users) {
                    successResponse(res, msgs.USERS_HAS_FOUND, { users })
                } else {
                    successResponse(res, msgs.USERS_NOT_FOUND)
                }
            })
            .catch((err) => {
                errorResponse(res, msgs.GET_USERS_ERROR, err, null, 404)
            })
    })
}

export const addUser = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.UPDATE_USER_ERROR, res, func)

    tc(() => {
        const errors = validationRegProps(req)

        if (errors.isEmpty()) {
            const regProps: IUser = req.body
            const filter = { $or: [{ username: regProps.username }, { email: regProps.email }] }

            findOneUser(filter)
                .then((candidate) => {
                    if (candidate) {
                        errorResponse(res, msgs.ERROR_USERNAME_IS_EXISTING, `${candidate.username} / ${candidate.email}`)
                    } else {
                        const hashPassword = bcrypt.hashSync(regProps.password, 7)

                        const user = new UserModel({
                            username: regProps.username,
                            password: hashPassword,
                            email: regProps.email,
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

export const changeUser = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.UPDATE_USER_ERROR, res, func)

    tc(() => {
        const errors = validationRegProps(req)

        if (errors.isEmpty()) {
            const regProps: IUser = req.body
            const user = getAuthorizedUser(req.headers.authorization)

            findOneUser({ _id: user.id })
                .then((candidate) => {
                    if (candidate) {
                        const hashPassword = regProps.password ? bcrypt.hashSync(regProps.password, 7) : null

                        const user = {
                            username: regProps.username ?? candidate.username,
                            password: hashPassword ?? candidate.password,
                            email: regProps.email ?? candidate.email,
                            avatar: regProps.avatar ?? candidate.avatar,
                        }

                        updateUser(candidate.id, user)
                            .then((updatedUser) => {
                                successResponse(res, msgs.USER_HAS_UPDATED, { user: updatedUser })
                            })
                            .catch((err) => {
                                if (String(err).includes('duplicate key')) {
                                    errorResponse(res, msgs.ERROR_USERNAME_IS_EXISTING, err, null, 400)
                                } else {
                                    errorResponse(res, msgs.UPDATE_USER_ERROR, err, null, 400)
                                }
                            })
                    } else {
                        const err = `${candidate.username} / ${candidate.email}`
                        errorResponse(res, msgs.ERROR_USERNAME_IS_EXISTING, err)
                    }
                })
                .catch((err) => {
                    if (String(err).includes('duplicate key')) {
                        errorResponse(res, msgs.ERROR_USERNAME_IS_EXISTING, err, null, 400)
                    } else {
                        errorResponse(res, msgs.UPDATE_USER_ERROR, err, null, 400)
                    }
                })
        } else {
            errorResponse(res, msgs.UPDATE_USER_ERROR, null, errors, 400)
        }
    })
}

export const changeUserById = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.UPDATE_USER_ERROR, res, func)

    tc(() => {
        const errors = validationRegProps(req)

        if (errors.isEmpty()) {
            const userId: string = req.params.userId
            const regProps: IUser = req.body
            const filter = { _id: userId }

            findOneUser(filter)
                .then((candidate) => {
                    if (candidate) {
                        const hashPassword = regProps.password ? bcrypt.hashSync(regProps.password, 7) : null

                        const user = {
                            username: regProps.username ?? candidate.username,
                            password: hashPassword ?? candidate.password,
                            email: regProps.email ?? candidate.email,
                            role: regProps.role ?? candidate.role,
                        }

                        updateUser(candidate.id, user)
                            .then((updatedUser) => {
                                successResponse(res, msgs.USER_HAS_UPDATED, { user: updatedUser })
                            })
                            .catch((err) => {
                                if (String(err).includes('duplicate key')) {
                                    errorResponse(res, msgs.ERROR_USERNAME_IS_EXISTING, err)
                                } else {
                                    errorResponse(res, msgs.UPDATE_USER_ERROR, err)
                                }
                            })
                    } else {
                        const err = `${candidate.username} / ${candidate.email}`
                        errorResponse(res, msgs.ERROR_USERNAME_IS_EXISTING, err)
                    }
                })
                .catch((err) => {
                    if (String(err).includes('duplicate key')) {
                        errorResponse(res, msgs.ERROR_USERNAME_IS_EXISTING, err)
                    } else {
                        errorResponse(res, msgs.UPDATE_USER_ERROR, err)
                    }
                })
        } else {
            errorResponse(res, msgs.UPDATE_USER_ERROR)
        }
    })
}

export const removeUser = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.USER_DELETED_ERROR, res, func)

    tc(() => {
        const user = getAuthorizedUser(req.headers.authorization)

        deleteUser(user.id)
            .then(() => {
                successResponse(res, msgs.USER_DELETED)
            })
            .catch((err) => {
                errorResponse(res, msgs.USER_DELETED_ERROR, err, null, 400)
            })
    })
}

export const removeUserById = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.USER_DELETED_ERROR, res, func)

    tc(() => {
        const userId = req.body.userId

        deleteUser(userId)
            .then(() => {
                successResponse(res, msgs.USER_DELETED)
            })
            .catch((err) => {
                errorResponse(res, msgs.USER_DELETED_ERROR, err, null, 400)
            })
    })
}
