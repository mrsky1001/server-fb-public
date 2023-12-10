/*
 * Copyright (c) 22.11.2021, 18:36  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */

import User, { IUser } from '../models/schemes/user.schema'
import { FilterQuery } from 'mongoose'

export const findUsers = (filter: FilterQuery<IUser>, projection: any | null = { password: 0 }): Promise<IUser[]> => {
    return new Promise<IUser[]>((resolve, reject) => {
        return User.find(filter, projection, null, (err, res) => {
            if (!err) {
                resolve(res)
            } else {
                reject(err)
            }
        })
    })
}

export const findOneUser = (filter: FilterQuery<IUser>, projection: any | null = { password: 0 }): Promise<IUser> => {
    return new Promise<IUser>((resolve, reject) => {
        return User.findOne(filter, projection, null, (err, res) => {
            if (!err) {
                resolve(res)
            } else {
                reject(err)
            }
        })
    })
}

export const createUser = (user: IUser): Promise<IUser> => {
    return new Promise<IUser>((resolve, reject) => {
        User.create(user)
            .then((userDB) => {
                resolve(userDB)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const updateUser = (userId: string, user: IUser): Promise<IUser> => {
    return new Promise<IUser>((resolve, reject) => {
        void User.findOneAndUpdate({ _id: userId }, user, null, (err) => {
            if (!err) {
                findOneUser({ _id: userId })
                    .then((updatedUser) => {
                        resolve(updatedUser)
                    })
                    .catch((err) => {
                        reject(err)
                    })
            } else {
                reject(err)
            }
        })
    })
}

export const deleteUser = (userId: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        void User.findOneAndRemove({ _id: userId }, null, (err) => {
            if (!err) {
                resolve()
            } else {
                reject(err)
            }
        })
    })
}
