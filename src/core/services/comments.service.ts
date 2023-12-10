/*
 * Copyright (c)  Kolyada Nikita Vladimirovich <nikita.nk16@yandex.ru> 12.09.2021, 21:28
 */
import { FilterQuery } from 'mongoose'
import { IUser } from '../models/schemes/user.schema'
import { CommentSchema, IComment, ICommentData } from '../models/schemes/comment.schema'
import { isProfanity } from '../lib/text-validation.lib'
import cnsts from '../collections/constants'

const serverDataProps = ['_id', 'author', 'creatingDate', 'likes']

const schemaProps = Object.keys(CommentSchema.paths)

export const getFilterSearch = (text: string): FilterQuery<IComment> => {
    return {
        $or: [{ content: { $regex: text, $options: 'i' } }, { 'author.username': { $regex: text, $options: 'i' } }],
    }
}

/**
 * Prepare section
 */

export const setCommentDate = (rawComment: IComment, comment: IComment): void => {
    if (rawComment.content !== comment.content) {
        comment.creatingDate = new Date()
    }
}

export const setSchemaProps = (rawComment: IComment, comment: IComment): void => {
    const rawProps = Object.keys(rawComment)

    delete comment._id

    schemaProps.forEach((prop) => {
        if (rawProps.includes(prop) && !serverDataProps.includes(prop)) {
            comment[prop] = typeof rawComment[prop] === 'string' ? String(rawComment[prop]).trim() : rawComment[prop]
        }
    })
}

export const prepareCommentToUpdate = (rawComment: ICommentData, oldComment: IComment): ICommentData => {
    return {
        authorId: oldComment.authorId,
        content: rawComment.content ?? oldComment.content,
    }
}

export const isValidComment = (content: string): boolean => {
    return (
        content.length >= cnsts.CONTENT_COMMENT_MIN_LIMIT &&
        content.length <= cnsts.CONTENT_COMMENT_MAX_LIMIT &&
        !isProfanity(content)
    )
}

export const prepareCommentToCreate = (rawComment: IComment, user: IUser): IComment => {
    const comment: IComment = { authorId: user.id }

    setCommentDate(rawComment, comment)
    setSchemaProps(rawComment, comment)

    return comment
}
