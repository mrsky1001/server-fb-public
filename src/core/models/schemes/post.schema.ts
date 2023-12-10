/*
 * Copyright (c) 22.11.2021, 18:50  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */

import { model, Schema } from 'mongoose'

import statuses from '../../collections/statuses'
import { IAnnotation } from './annotation.schema'
import { IUser } from './user.schema'
import { IPhotoPost } from './photo-post.schema'
import { IBase } from '../interfaces/IBase'

export interface IPostData {
    title?: string
    annotation?: IAnnotation
    sectionId?: string
    content?: string
    domain?: string
    updatingDate?: Date
    tags?: string[]
    readTime?: number
}

export interface IPost extends IBase {
    title?: string
    urlTitle?: string
    sectionId?: string
    photoPosts?: IPhotoPost[]
    annotationId?: string
    domain?: string
    countSymbols?: number
    annotation?: IAnnotation
    author?: IUser
    content?: string
    creatingDate?: Date
    updatingDate?: Date
    publishedDate?: Date
    authorId?: string
    views?: number
    likes?: string[]
    shares?: number
    readTime?: number
    countComments?: number

    tags?: string[]
    commentsIds?: string[]
    status?: number
    toObject?: () => any
}

// export class PostClass implements IPost {
//     id?: string
//     title?: string
//     urlTitle?: string
//     sectionId?: string
//     annotationId?: string
//     annotation?: IAnnotation
//     author?: IUser
//     content?: string
//     creatingDate?: Date
//     updatingDate?: Date
//     publishedDate?: Date
//     authorId?: string
//     views?: number
//     likes?: string[]
//     shares?: number
//     readTime?: number
//     countComments?: number
//
//     tags?: string[]
//     commentsIds?: string[]
//     status?: number
// }

export const PostSchema = new Schema<IPost>({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    urlTitle: {
        type: String,
        required: true,
        unique: true,
    },
    annotationId: {
        type: String,
        required: true,
    },
    sectionId: {
        type: String,
        required: false,
    },
    content: {
        type: String,
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
    updatingDate: {
        type: Date,
    },
    publishedDate: {
        type: Date,
    },
    authorId: {
        type: String,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
        min: 0,
    },
    likes: [
        {
            type: String,
            required: false,
            default: [],
        },
    ],
    shares: {
        type: Number,
        default: 0,
        min: 0,
    },
    countComments: {
        type: Number,
        default: 0,
        min: 0,
    },

    readTime: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    tags: [
        {
            type: String,
            required: true,
            default: 'блог',
        },
    ],
    commentsIds: [
        {
            type: String,
            required: false,
        },
    ],
    status: {
        type: Number,
        required: true,
        max: statuses.PUBLISHED,
        min: statuses.DRAFT,
        default: statuses.DRAFT,
    },
})

export default model('Post', PostSchema)
