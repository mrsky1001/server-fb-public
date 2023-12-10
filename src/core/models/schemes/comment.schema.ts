/*
 * Copyright (c) 22.11.2021, 18:50  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */

import statuses from '../../collections/statuses'
import { model, Schema } from 'mongoose'
import { IBase } from '../interfaces/IBase'

export interface ICommentData {
    authorId: string
    content?: string
}

export interface IComment extends IBase {
    authorId: string
    content?: string
    creatingDate?: Date
    postId?: string
    errorMsg?: string
    status?: number
    likes?: string[]
    parentId?: string
}

export const CommentSchema = new Schema<IComment>({
    authorId: {
        type: String,
        required: true,
    },
    postId: {
        type: String,
        required: true,
    },
    parentId: {
        type: String,
        required: false,
    },
    content: {
        type: String,
        min: 2,
        max: 1000,
        required: true,
    },
    creatingDate: {
        type: Date,
        required: true,
    },
    likes: [
        {
            type: String,
            required: false,
            default: [],
        },
    ],
    errorMsg: {
        type: String,
        required: false,
    },
    status: {
        type: Number,
        required: true,
        default: statuses.DRAFT,
    },
})

export default model('Comment', CommentSchema)
