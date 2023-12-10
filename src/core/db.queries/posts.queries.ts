/*
 * Copyright (c) 22.11.2021, 18:38  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */

import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose'
import PostModel, { IPost } from '../models/schemes/post.schema'
import CommentModel from '../models/schemes/comment.schema'
import AnnotationModel from '../models/schemes/annotation.schema'
import UserModel from '../models/schemes/user.schema'
import statuses from '../collections/statuses'
// import domains from '../collections/domains'
import { createPhotoPosts } from './photo-posts.queries'
import PhotoPostModel from '../models/schemes/photo-post.schema'
import { fixUrlTitle } from '../services/posts.service'
import domains from '../collections/domains'

const getComputedValuesPost = async (post: IPost): Promise<IPost> => {
    const newPost = post.toObject()

    newPost.countComments = await CommentModel.count({ postId: newPost._id })
    newPost.annotation = await AnnotationModel.findOne({ _id: newPost.annotationId })
    newPost.author = await UserModel.findOne({ _id: newPost.authorId })

    const postWithContent = await PostModel.findOne({ _id: newPost._id }, { content: 1 })
    newPost.countSymbols = postWithContent?.content.length

    if (newPost.domain === domains.PHOTO.name) {
        const getSubStr = (
            rawStr: string,
            firstPoint: string | number,
            secondPoint: string | number,
            startIncr = typeof secondPoint === 'number' ? 0 : secondPoint.length - 1,
            endIncr = 0
        ) => {
            const startIdx = typeof firstPoint === 'number' ? firstPoint : rawStr.indexOf(firstPoint) + startIncr
            const endIdx = typeof secondPoint === 'number' ? secondPoint : rawStr.indexOf(secondPoint, startIdx) + endIncr

            return startIdx > startIncr - 1 && endIdx > startIncr ? rawStr.substring(startIdx, endIdx) : ''
        }

        const photoPosts = await PhotoPostModel.find({ postId: newPost._id })

        newPost.photoPosts = photoPosts.map((p) => {
            const newPhotoPost = p.toObject()
            const titleIdx = postWithContent.content.indexOf(p.title)
            const endOfImg = postWithContent.content.indexOf('>', postWithContent.content.indexOf('<img', titleIdx)) + 1

            const nextStart = postWithContent.content.indexOf('<h3>', titleIdx)
            const endContent = nextStart > -1 ? nextStart : postWithContent.content.length - 1

            newPhotoPost.description = getSubStr(postWithContent.content, endOfImg, endContent)

            return newPhotoPost
        })
    }

    return newPost
}

export const findPosts = (filter: FilterQuery<IPost>, projection?: any, options?: QueryOptions): Promise<IPost[]> => {
    const postsPromise = new Promise<IPost[]>((resolve, reject) => {
        void PostModel.find(filter, projection, options, (err, posts) => {
            if (!err) {
                if (filter.$or) {
                    const filterAnnotation = filter.$or.length ? { $or: [{ text: filter.$or[0].title }] } : {}

                    void AnnotationModel.find(filterAnnotation, { _id: 1, text: 1 }, null, (err, annotations) => {
                        if (annotations && annotations.length) {
                            const appendPost = [...posts]

                            const annotationsPromises = annotations.map(async (ann) => {
                                const post = await PostModel.findOne({
                                    annotationId: ann._id,
                                    status: statuses.PUBLISHED,
                                })

                                if (post && !appendPost.find((p) => p.title === post.title)) {
                                    appendPost.push(post)
                                }
                            })

                            Promise.all(annotationsPromises)
                                .then(() => {
                                    resolve(appendPost)
                                })
                                .catch((err) => {
                                    reject(err)
                                })
                        } else resolve(posts)
                    })
                } else {
                    resolve(posts)
                }
            } else {
                reject(err)
            }
        })
    })

    return new Promise<IPost[]>((resolve, reject) => {
        postsPromise
            .then((posts) => {
                const postsPromises = posts.map(async (post) => {
                    return await getComputedValuesPost(post)
                })

                Promise.all(postsPromises)
                    .then((posts) => {
                        resolve(posts)
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
            .catch((err) => {
                reject(err)
            })
    })
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const findOnePost = (filter: FilterQuery<IPost>, projection?: any): Promise<IPost> => {
    const postPromise = new Promise<IPost>((resolve, reject) => {
        if (filter.urlTitle) {
            filter.urlTitle = fixUrlTitle(filter.urlTitle)
        }

        void PostModel.findOne(filter, projection, (err, post) => {
            if (!err) {
                resolve(post)
            } else {
                reject(err)
            }
        })
    })

    return new Promise<IPost>((resolve, reject) => {
        postPromise
            .then((post) => {
                getComputedValuesPost(post)
                    .then((updatedPost) => {
                        resolve(updatedPost)
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const createPost = (post: IPost): Promise<IPost> => {
    return new Promise<IPost>((resolve, reject) => {
        PostModel.create(post, (err, createdPost) => {
            if (createdPost && !err) {
                findOnePost({ _id: createdPost._id })
                    .then((updatedPost) => {
                        if (post.domain === domains.PHOTO.name) {
                            createPhotoPosts(post)
                                .then(() => {
                                    resolve(updatedPost)
                                })
                                .catch((error) => {
                                    reject(error)
                                })
                        } else {
                            resolve(updatedPost)
                        }
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

export const updatePost = (postId: string, post: UpdateQuery<IPost>, oldPost?: IPost): Promise<IPost> => {
    return new Promise<IPost>((resolve, reject) => {
        const filter = { _id: postId }

        void PostModel.updateOne(filter, post, null, (err) => {
            if (!err) {
                findOnePost(filter)
                    .then((updatedPost) => {
                        if (post.domain === domains.PHOTO.name && oldPost && oldPost.content !== updatedPost.content) {
                            createPhotoPosts(updatedPost)
                                .then(() => {
                                    resolve(updatedPost)
                                })
                                .catch((error) => {
                                    reject(error)
                                })
                        } else {
                            resolve(updatedPost)
                        }
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

export const deletePost = (postId: string): Promise<IPost> => {
    return new Promise<IPost>((resolve, reject) => {
        const filter = { _id: postId }

        void PostModel.deleteOne(filter, (err, res) => {
            if (res && !err) {
                resolve(res)
            } else {
                reject(err)
            }
        })
    })
}
