/*
 * Copyright (c) 22.11.2021, 18:38  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */

import { FilterQuery, QueryOptions } from 'mongoose'
import CommentModel, { IComment } from '../models/schemes/comment.schema'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const findComments = (filter: FilterQuery<IComment>, projection?: any, options?: QueryOptions): Promise<IComment[]> => {
    return new Promise<IComment[]>((resolve, reject) => {
        void CommentModel.find(filter, projection, options, (err, comments) => {
            if (!err) {
                resolve(comments)
            } else {
                reject(err)
            }
        })
    })
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const findOneComment = (filter: FilterQuery<IComment>, projection?: any, options?: QueryOptions): Promise<IComment> => {
    return new Promise<IComment>((resolve, reject) => {
        void CommentModel.findOne(filter, projection, options, (err, comment) => {
            if (!err) {
                resolve(comment)
            } else {
                reject(err)
            }
        })
    })
}

export const createComment = (comment: IComment): Promise<IComment> => {
    return new Promise<IComment>((resolve, reject) => {
        CommentModel.create(comment, (err, res) => {
            if (res && !err) {
                resolve(res)
            } else {
                reject(err)
            }
        })
    })
}

export const updateComment = (commentId: string, comment: IComment): Promise<IComment> => {
    return new Promise<IComment>((resolve, reject) => {
        const filter = { _id: commentId }

        void CommentModel.updateOne(filter, comment, null, (err) => {
            if (!err) {
                findOneComment(filter)
                    .then((updateComment) => {
                        resolve(updateComment)
                    })
                    .catch((error) => {
                        reject(error)
                    })
            } else {
                reject(err)
            }
        })
    })
}

export const deleteComment = (commentId: string): Promise<IComment> => {
    return new Promise<IComment>((resolve, reject) => {
        const filter = { _id: commentId }

        void CommentModel.deleteOne(filter, (err, res) => {
            if (res && !err) {
                resolve(res)
            } else {
                reject(err)
            }
        })
    })
}
