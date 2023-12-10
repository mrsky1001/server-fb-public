/*
 * Copyright (c) 21.11.2021, 23:33  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */

import { model, Schema } from 'mongoose'
import { IBase } from '../interfaces/IBase'

export interface IPhotoPost extends IBase {
    postId?: string
    title?: string
    url?: string
    likes?: string[]
    size?: number
    description?: string
    toObject?: () => any
}

export const PhotoPostSchema = new Schema<IPhotoPost>({
    postId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        default: 2,
        min: 1,
    },
    likes: [
        {
            type: String,
            required: false,
            default: [],
        },
    ],
})

export default model('PhotoPost', PhotoPostSchema)
