/*
 * Copyright (c) 22.11.2021, 18:50  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */

import { model, Schema } from 'mongoose'
import roles from '../../collections/roles'

export interface IUser {
    id?: string
    username?: string
    password?: string
    email?: string
    avatar?: string
    role?: number
    agreeAgreement?: boolean
    agreeConditions?: boolean
    lastRecaptchaDate?: Date
    lastLoginDate?: Date
    registrationDate?: Date
}

export const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: false,
    },
    lastRecaptchaDate: {
        type: Date,
        required: true,
    },
    lastLoginDate: {
        type: Date,
        required: true,
    },
    registrationDate: {
        type: Date,
        required: true,
    },
    agreeAgreement: {
        type: Boolean,
        default: false,
    },
    agreeConditions: {
        type: Boolean,
        default: false,
    },
    role: {
        type: Number,
        required: true,
        min: roles.ADMIN.value,
        max: roles.USER.value,
        default: roles.USER.value,
    },
})

export default model('User', UserSchema)
