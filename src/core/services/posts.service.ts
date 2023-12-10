/*
 * Copyright (c)  Kolyada Nikita Vladimirovich <nikita.nk16@yandex.ru> 12.09.2021, 21:28
 */
import { FilterQuery } from 'mongoose'
import { IPost, IPostData, PostSchema } from '../models/schemes/post.schema'
import { IUser } from '../models/schemes/user.schema'
// @ts-ignore
import * as cyrillicToTranslit from 'cyrillic-to-translit-js'
import statuses from '../collections/statuses'
import { deletePostImgsDir } from './imgs.services'
import { IAnnotation } from '../models/schemes/annotation.schema'

const serverDataProps = [
    '_id',
    'author',
    'creatingDate',
    'urlTitle',
    'publishedDate',
    'updatingDate',
    'likes',
    'readTime',
    'views',
    'shares',
]

const schemaProps = Object.keys(PostSchema.paths)

export const getFilterSearch = (text: string): FilterQuery<IPost> => {
    return {
        $or: [
            { title: { $regex: text, $options: 'i' } },
            { content: { $regex: text, $options: 'i' } },
            { 'annotation.text': { $regex: text, $options: 'i' } },
            { 'author.username': { $regex: text, $options: 'i' } },
        ],
    }
}

/**
 * Prepare section
 */

export const strToUrlFormat = (str: string): string => {
    const reg = /[.,/#!?$%^&*;:{}=\-`~()\n]/g
    const replacedPunctuation = str.replace(reg, '')
    const replacedUpper = replacedPunctuation.toLowerCase()

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const res: string = cyrillicToTranslit().transform(replacedUpper, '_')
    const lastSymbol = res[res.length]

    if (lastSymbol === '_') {
        return res.slice(0, res.length - 1)
    }
    return res
}

export const calcReadTime = (content: string): number => {
    let lengthCode = 0
    const constReadTime = 1500

    for (let index = -2; index !== -1; index = content.indexOf('data="code-block"', index + 1)) {
        if (index > 0) {
            lengthCode += content.indexOf('</code>', index + 1) - index
        }
    }

    for (let index = -2; index !== -1; index = content.indexOf('img', index + 1)) {
        if (index > 0) {
            lengthCode += content.indexOf('>', index + 1) - index
        }
    }

    let time: number = (content.length - lengthCode) / constReadTime
    time = Math.round(time)

    return time < 1 ? 1 : time
}

export const getFilterDataToUpdatePost = (postId: string, data: IPost): FilterQuery<IPostData> => {
    return {
        _id: postId,
        title: data.title ? { $ne: data.title } : undefined,
        content: data.content ? { $ne: data.content } : undefined,
        'annotation.text': data.annotation.text ? { $ne: data.annotation.text } : undefined,
        'annotation.imgUrl': data.annotation.imgUrl ? { $ne: data.annotation.imgUrl } : undefined,
    }
}

export const preparePostToUpdate = (rawPost: IPostData, oldPost: IPost): IPostData => {
    return {
        title: rawPost.title ?? oldPost.title,
        content: rawPost.content ?? oldPost.content,
        domain: rawPost.domain ?? oldPost.domain,
        sectionId: rawPost.sectionId ?? oldPost.sectionId,
        tags: rawPost.tags ?? oldPost.tags,
        updatingDate: new Date(),
        readTime: calcReadTime(rawPost.content),
    }
}

export const setPostDate = (rawPost: IPost, post: IPost): void => {
    if (
        rawPost.title !== post.title ||
        rawPost.content !== post.content ||
        (rawPost.annotation && rawPost.annotation.text !== post.annotation.text) ||
        (rawPost.annotation && rawPost.annotation.imgUrl !== post.annotation.imgUrl)
    ) {
        post.updatingDate = new Date()
        post.creatingDate = post.updatingDate
        post.readTime = calcReadTime(rawPost.content)
    }
}

export const setSchemaProps = (rawPost: IPost, post: IPost): void => {
    const rawProps = Object.keys(rawPost)

    delete post._id
    post.title = String(rawPost.title).trim()
    post.urlTitle = post.urlTitle ?? strToUrlFormat(rawPost.title)

    schemaProps.forEach((prop) => {
        if (rawProps.includes(prop) && !serverDataProps.includes(prop)) {
            post[prop] = typeof rawPost[prop] === 'string' ? String(rawPost[prop]).trim() : rawPost[prop]
        }
    })
}

export const setPublished = (post: IPost): void => {
    if (post.status === statuses.PUBLISHED) {
        post.publishedDate = new Date()
    } else {
        post.publishedDate = post.publishedDate ?? null
    }
}

export const setAnnotation = (post: IPost, annotation: IAnnotation): void => {
    post.annotationId = annotation.id
}

export const setUser = (post: IPost, user: IUser): void => {
    post.authorId = user.id
}

export const fixUrlTitle = (urlTitle: string) => {
    const lastSymbol = urlTitle[urlTitle.length]

    if (lastSymbol === '_') {
        return urlTitle.slice(0, urlTitle.length - 1)
    }

    return urlTitle
}
//
// export const setphotoPosts = (post: IPost): void => {
//     post.content = post.content
//         .split('<h3')
//         .map((s) => {
//             return `<p>****${post._id}</p><h3${s}<p>${post._id}****</p>`
//         })
//         .join('')
// }

export const preparePostToCreate = (rawPost: IPost, user: IUser, annotation: IAnnotation): IPost => {
    const post: IPost = {}

    setPostDate(rawPost, post)
    setSchemaProps(rawPost, post)
    setAnnotation(post, annotation)
    setUser(post, user)
    setPublished(post)

    // if (rawPost.domain === domains.PHOTO.name) {
    //     setphotoPosts(post)
    // }

    return post
}

/**
 * after Update Post
 */
// export const afterPublishedPost = (oldPost: IPost, newPost: IPost): Promise<void> => {
//     return new Promise<void>((resolve, reject) => {
//         if (oldPost.status !== newPost.status && newPost.status === statuses.PUBLISHED) {
//             resolve()
//             // createSitemap()
//             //     .then(() => resolve())
//             //     .catch((err) => reject(err))
//         } else {
//             resolve()
//         }
//     })
// }

// export const afterUpdatePost = (oldPost: IPost, newPost: IPost): Promise<void> => {
//     return new Promise<void>((resolve, reject) => {
//         afterPublishedPost(oldPost, newPost)
//             .then(() => resolve())
//             .catch((err) => reject(err))
//     })
// }

export const afterDeletePost = (post: IPost, user: IUser): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        deletePostImgsDir(post.urlTitle, post._id, user)
            .then(() => {
                if (post.status === statuses.PUBLISHED) {
                    resolve()
                    // createSitemap()
                    //     .then(() => resolve())
                    //     .catch((err) => reject(err))
                } else {
                    resolve()
                }
            })
            .catch((err) => reject(err))
    })
}
