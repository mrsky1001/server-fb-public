/*
 * Copyright (c) 22.11.2021, 18:37  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */
import { FilterQuery } from 'mongoose'
import { Request, Response } from 'express'
import { errorResponse, successResponse, tryCatch } from '../lib/try-catch.lib'
import msgs from '../../app/collections/messages'
import { getAuthorizedUser, isAuthorized } from './auth.controller'
import statuses from '../collections/statuses'
import { IComment } from '../models/schemes/comment.schema'
import { createComment, deleteComment, findComments, findOneComment, updateComment } from '../db.queries/comments.queries'
import { isValidComment, prepareCommentToCreate, prepareCommentToUpdate } from '../services/comments.service'
import { dateCompareToMlSc } from '../lib/date.lib'
import cnsts from '../collections/constants'

export const getComments = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.GET_COMMENT_ERROR, res, func)

    tc(() => {
        const postId = req.params.postId
        const filter = { postId }

        const options = {
            sort: {
                // status: -1,
                creatingDate: -1,
            },
            limit: cnsts.GET_COMMENTS_LIMIT,
        }

        findComments(filter, undefined, options)
            .then((comments) => {
                successResponse(res, msgs.COMMENTS_LOADED, { comments })
            })
            .catch((err) => {
                errorResponse(res, msgs.COMMENTS_NOT_LOADED, err)
            })
    })
}

export const getComment = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.GET_COMMENT_ERROR, res, func)

    tc(() => {
        const commentId = req.params.commentId
        const filter: FilterQuery<IComment> = { _id: commentId }

        isAuthorized(req)
            .then((isAuth) => {
                !isAuth && (filter.status = statuses.PUBLISHED)
                findOneComment(filter)
                    .then((comment) => {
                        successResponse(res, msgs.COMMENT_FOUND, { comment })
                    })
                    .catch((err) => {
                        errorResponse(res, msgs.COMMENT_NOT_FOUND, err)
                    })
            })
            .catch((err) => {
                errorResponse(res, msgs.CHECK_AUTH_ERROR, err)
            })
    })
}

export const addComment = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.CREATE_COMMENT_ERROR, res, func)

    tc(() => {
        const user = getAuthorizedUser(req.headers.authorization)
        const comment = prepareCommentToCreate(req.body, user)

        findOneComment({}, undefined, { sort: { _id: -1 } })
            .then((lastComment) => {
                const isMoreOneMinute = !lastComment || dateCompareToMlSc(lastComment.creatingDate) > cnsts.TIME_COMMENT_LIMIT

                if (!isMoreOneMinute) {
                    errorResponse(res, msgs.COMMENT_LIMIT_COUNT_ERROR)
                } else if (isValidComment(comment.content)) {
                    createComment(comment)
                        .then((comment) => {
                            successResponse(res, msgs.COMMENT_CREATED, { comment })
                        })
                        .catch((err) => {
                            errorResponse(res, msgs.COMMENT_NOT_CREATED, err)
                        })
                } else {
                    errorResponse(res, msgs.COMMENT_LIMIT_CONTENT_ERROR)
                }
            })
            .catch((err) => {
                errorResponse(res, msgs.COMMENT_NOT_CREATED, err)
            })
    })
}

const updateDataComment = (commentId: string, data: IComment, oldComment: IComment, res: Response) => {
    updateComment(commentId, data)
        .then((updatedComment) => {
            successResponse(res, msgs.COMMENT_UPDATED, { comment: updatedComment })
        })
        .catch((err) => {
            errorResponse(res, msgs.UPDATE_COMMENT_ERROR, err)
        })
}

export const changeCommentData = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.UPDATE_COMMENT_ERROR, res, func)

    tc(() => {
        const commentId = req.params.commentId
        const data = req.body
        // const filter: FilterQuery<ICommentData> = getFilterDataToUpdateComment(commentId, data)

        findOneComment({ _id: commentId })
            .then((oldComment) => {
                if (oldComment) {
                    const dataToUpdate = prepareCommentToUpdate(data, oldComment)
                    updateDataComment(commentId, dataToUpdate, oldComment, res)
                } else {
                    errorResponse(res, msgs.NOTHING_TO_UPDATE)
                }
            })
            .catch((err) => {
                if (err === null) {
                    successResponse(res, msgs.NOTHING_TO_UPDATE, { comment: data })
                } else {
                    errorResponse(res, msgs.UPDATE_COMMENT_ERROR, err)
                }
            })
    })
}

export const addLikeComment = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.UPDATE_LIKE_ERROR, res, func)

    tc(() => {
        const commentId = req.params.commentId

        findOneComment({ _id: commentId })
            .then((oldComment) => {
                if (oldComment) {
                    const user = getAuthorizedUser(req.headers.authorization)
                    updateDataComment(
                        commentId,
                        { authorId: oldComment.authorId, likes: [...oldComment.likes, user.id] },
                        oldComment,
                        res
                    )
                } else {
                    errorResponse(res, msgs.NOTHING_TO_UPDATE)
                }
            })
            .catch((err) => {
                errorResponse(res, msgs.UPDATE_LIKE_ERROR, err)
            })
    })
}

export const removeLikeComment = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.UPDATE_LIKE_ERROR, res, func)

    tc(() => {
        const commentId = req.params.commentId

        findOneComment({ _id: commentId })
            .then((oldComment) => {
                if (oldComment) {
                    const user = getAuthorizedUser(req.headers.authorization)
                    updateDataComment(
                        commentId,
                        { authorId: oldComment.authorId, likes: [...oldComment.likes.filter((l) => l !== user.id)] },
                        oldComment,
                        res
                    )
                } else {
                    errorResponse(res, msgs.NOTHING_TO_UPDATE)
                }
            })
            .catch((err) => {
                errorResponse(res, msgs.UPDATE_LIKE_ERROR, err)
            })
    })
}

export const changeStatusComment = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.UPDATE_STATUS_COMMENT_ERROR, res, func)

    tc(() => {
        const commentId = req.params.commentId
        const status: number = req.body.status

        if (typeof Object.values(statuses).find((s) => s === status) === 'number') {
            findOneComment({ _id: commentId })
                .then((oldComment) => {
                    if (oldComment) {
                        updateDataComment(commentId, { authorId: oldComment.authorId, status }, oldComment, res)
                    } else {
                        errorResponse(res, msgs.NOTHING_TO_UPDATE)
                    }
                })
                .catch((err) => {
                    errorResponse(res, msgs.UPDATE_STATUS_COMMENT_ERROR, err)
                })
        } else {
            errorResponse(res, msgs.UPDATE_STATUS_COMMENT_ERROR)
        }
    })
}

export const removeComment = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.DELETE_COMMENT_ERROR, res, func)

    tc(() => {
        const commentId = req.params.commentId
        const user = getAuthorizedUser(req.headers.authorization)

        findOneComment({ _id: commentId })
            .then((comment) => {
                if (comment.authorId === user.id) {
                    deleteComment(commentId)
                        .then(() => {
                            successResponse(res, msgs.COMMENT_DELETED)
                        })
                        .catch((err) => {
                            errorResponse(res, msgs.COMMENT_NOT_DELETED, err)
                        })
                } else {
                    errorResponse(res, msgs.NOT_ALLOWED)
                }
            })
            .catch((err) => {
                errorResponse(res, msgs.COMMENT_NOT_FOUND, err)
            })
    })
}
