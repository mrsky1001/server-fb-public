/*
 * Copyright (c) 22.11.2021, 18:37  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */
import { Request, Response } from 'express'
import { errorResponse, successResponse, tryCatch } from '../lib/try-catch.lib'
import msgs from '../../app/collections/messages'
import { getAuthorizedUser } from './auth.controller'
import { IPhotoPost } from '../models/schemes/photo-post.schema'
import { findOnePhotoPost, updatePhotoPost } from '../db.queries/photo-posts.queries'

const updateDataPhotoPost = (photoPostId: string, data: IPhotoPost, res: Response) => {
    updatePhotoPost(photoPostId, data)
        .then((updatedPhotoPost) => {
            // afterUpdatePost(photoPost, updatedPost)
            //     .then(() => {
            successResponse(res, msgs.PHOTO_POST_UPDATED, { photoPost: updatedPhotoPost })
            // })
            // .catch((err) => {
            //     errorResponse(res, msgs.UPDATE_POST_ERROR, err)
            // })
        })
        .catch((err) => {
            if (String(err).includes('duplicate key')) {
                errorResponse(res, msgs.DUPLICATE_POST, err)
            } else {
                errorResponse(res, msgs.UPDATE_PHOTO_POST_ERROR, err)
            }
        })
}

export const addLikePhotoPost = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.UPDATE_LIKE_ERROR, res, func)

    tc(() => {
        const photoPostId = req.params.photoPostId

        findOnePhotoPost({ _id: photoPostId })
            .then((photoPost) => {
                if (photoPost) {
                    const user = getAuthorizedUser(req.headers.authorization)
                    updateDataPhotoPost(photoPostId, { likes: [...photoPost.likes, user.id] }, res)
                } else {
                    errorResponse(res, msgs.NOTHING_TO_UPDATE)
                }
            })
            .catch((err) => {
                errorResponse(res, msgs.UPDATE_LIKE_ERROR, err)
            })
    })
}

export const removeLikePhotoPost = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.UPDATE_LIKE_ERROR, res, func)

    tc(() => {
        const photoPostId = req.params.photoPostId

        findOnePhotoPost({ _id: photoPostId })
            .then((photoPost) => {
                if (photoPost) {
                    const user = getAuthorizedUser(req.headers.authorization)
                    updateDataPhotoPost(photoPostId, { likes: [...photoPost.likes.filter((l) => l !== user.id)] }, res)
                } else {
                    errorResponse(res, msgs.NOTHING_TO_UPDATE)
                }
            })
            .catch((err) => {
                errorResponse(res, msgs.UPDATE_LIKE_ERROR, err)
            })
    })
}

export const changeSizePhotoPost = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.UPDATE_SIZE_PHOTO_POST_ERROR, res, func)

    tc(() => {
        const photoPostId = req.params.photoPostId
        const size = Number(req.body.size)

        findOnePhotoPost({ _id: photoPostId })
            .then((oldPhotoPost) => {
                if (oldPhotoPost) {
                    updateDataPhotoPost(photoPostId, { size }, res)
                } else {
                    errorResponse(res, msgs.NOTHING_TO_UPDATE)
                }
            })
            .catch((err) => {
                errorResponse(res, msgs.POST_NOT_FOUND, err)
            })
    })
}
