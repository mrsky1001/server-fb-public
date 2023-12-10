/*
 * Copyright (c) 22.11.2021, 18:50  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */

import { model, Schema } from 'mongoose'
import { IUser } from './user.schema'
import { IPost } from './post.schema'
import { IBase } from '../interfaces/IBase'

export interface ISectionData {
    name?: string
    description?: string
    posts?: IPost[]
}

export interface ISection extends IBase {
    author?: IUser
    name?: string
    description?: string
    domain?: string
    creatingDate?: Date
    posts?: IPost[]
}

export const SectionSchema = new Schema<ISection>({
    name: {
        type: String,
        min: 2,
        max: 300,
        required: true,
    },
    description: {
        type: String,
        min: 2,
        max: 1000,
        required: true,
    },
    domain: {
        type: String,
        required: true,
    },
    creatingDate: {
        type: Date,
        required: true,
    },
})

export default model('Section', SectionSchema)
