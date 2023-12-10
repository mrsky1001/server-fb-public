/*
 * Copyright (c) 22.11.2021, 18:37  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */
import { FilterQuery } from 'mongoose'
import { Request, Response } from 'express'
import { errorResponse, successResponse, tryCatch } from '../lib/try-catch.lib'
import msgs from '../../app/collections/messages'
import { createPost, deletePost, findOnePost, findPosts, updatePost } from '../db.queries/posts.queries'
import { getAuthorizedUser, isAuthorized } from './auth.controller'
import statuses from '../collections/statuses'
import { IPost } from '../models/schemes/post.schema'
import { afterDeletePost, preparePostToCreate, preparePostToUpdate } from '../services/posts.service'
import { createImgsDir, getPathToPostImgDir } from '../services/imgs.services'
import cnsts from '../collections/constants'
import roles from '../collections/roles'
import { IPostsQuerySettings } from '../models/interfaces/IPostsQuerySettings'
import { createAnnotation, deleteAnnotation, findOneAnnotation, updateAnnotation } from '../db.queries/annotations.queries'
import { filtersPosts } from '../collections/filters'
import { findOneSection } from '../db.queries/sections.queries'
import { deleteAllPhotoPost, deletePhotoPost } from '../db.queries/photo-posts.queries'

const setFilterPosts = (
    domain = 'dev',
    sectionId: string,
    tag: string,
    lastCreateDate: Date,
    searchText: string,
    isEditor: boolean
) => {
    const filter: FilterQuery<IPost> = {}

    filter.domain = domain

    if (!isEditor) {
        filter.status = statuses.PUBLISHED
    }

    if (tag) {
        filter.tags = { $all: [tag] }
    }

    if (sectionId) {
        filter.sectionId = sectionId
    }

    if (searchText) {
        filter.$or = [
            { title: { $regex: searchText, $options: 'i' } },
            { content: { $regex: searchText, $options: 'i' } },
            // { 'annotation.text': { $regex: searchText, $options: 'i' } }, // тут !!!!!!!!!!
            // { 'author.username': { $regex: searchText, $options: 'i' } },
        ]
    }

    filter.creatingDate = { $lt: lastCreateDate }

    return filter
}

const getPostsQuerySettings = (req: Request, isAuth: boolean): IPostsQuerySettings => {
    let domain = req.query.domain ? req.query.domain.toString().toLowerCase() : 'dev'
    domain = !domain && req.params.domain ? req.params.domain : domain

    let sectionId = req.query.sectionId ? req.query.sectionId.toString().toLowerCase() : undefined
    sectionId = !sectionId && req.params.sectionId ? req.params.sectionId : sectionId

    let searchText = req.query.searchText ? req.query.searchText.toString().toLowerCase() : undefined
    searchText = req.params.search ? req.params.search.toLowerCase() : searchText

    const tag = req.query.tag ? req.query.tag.toString().toLowerCase() : undefined
    const date = req.query.lastCreateDate ? req.query.lastCreateDate.toString() : ''
    const lastCreateDate = req.query.lastCreateDate ? new Date(date) : undefined

    const user = isAuth ? getAuthorizedUser(req.headers.authorization) : false
    const isEditor = isAuth && user && user.role <= roles.EDITOR.value

    const filter = setFilterPosts(domain, sectionId, tag, lastCreateDate, searchText, isEditor)
    const sort = req.query.sort ?? { creatingDate: -1 }

    const projection = {
        annotationId: 1,
        authorId: 1,
        likes: 1,
        shares: 1,
        views: 1,
        sectionId: 1,
        urlTitle: 1,
        domain: 1,
        countComments: 1,
        status: 1,
        readTime: 1,
        creatingDate: 1,
        publishedDate: 1,
        tags: 1,
        title: 1,
    }

    const options = {
        sort,
        limit: cnsts.GET_POSTS_LIMIT,
    }

    return {
        filter,
        projection,
        options,
    }
}

export const getPosts = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.GET_ALL_POSTS_ERROR, res, func)

    tc(() => {
        isAuthorized(req)
            .then((isAuth) => {
                const settings = getPostsQuerySettings(req, isAuth)

                findPosts(settings.filter, settings.projection, settings.options)
                    .then((posts) => {
                        successResponse(res, msgs.POSTS_LOADED, { posts })
                    })
                    .catch((err) => {
                        errorResponse(res, msgs.POSTS_NOT_LOADED, err)
                    })
            })
            .catch((err) => {
                errorResponse(res, msgs.POSTS_NOT_LOADED, err)
            })
    })
}

export const getFiltersPosts = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.GET_FILTER_POSTS_ERROR, res, func)

    tc(() => {
        successResponse(res, msgs.FILTER_POSTS_LOADED, { filtersPosts })
    })
}

// export const getPostsBySectionId = (req: Request, res: Response): void => {
//     const tc = (func) => tryCatch(msgs.GET_POST_ERROR, res, func)
//
//     tc(() => {
//         isAuthorized(req)
//             .then((isAuth) => {
//                 const settings = getPostsQuerySettings(req, isAuth)
//
//                 findPosts(filter, projection, options)
//                     .then((posts) => {
//                         successResponse(res, msgs.POSTS_LOADED, { posts })
//                     })
//                     .catch((err) => {
//                         errorResponse(res, msgs.POSTS_NOT_LOADED, err)
//                     })
//             })
//             .catch((err) => {
//                 errorResponse(res, msgs.POSTS_NOT_LOADED, err)
//             })
//     })
// }

const getPostFunc = (filter: FilterQuery<IPost>, req, res) => {
    isAuthorized(req)
        .then((isAuth) => {
            !isAuth && (filter.status = statuses.PUBLISHED)

            findOnePost(filter)
                .then((post) => {
                    if (post.status === statuses.PUBLISHED || isAuth) {
                        post.views += 1

                        updatePost(post._id, post)
                            .then((updatedPost) => {
                                successResponse(res, msgs.POST_FOUND, {
                                    post: updatedPost,
                                })
                            })
                            .catch((err) => {
                                errorResponse(res, msgs.POST_NOT_UPDATED, err)
                            })
                    } else {
                        errorResponse(res, msgs.POST_FOUND)
                    }
                })
                .catch((err) => {
                    errorResponse(res, msgs.POST_NOT_FOUND, err)
                })
        })
        .catch((err) => {
            errorResponse(res, msgs.CHECK_AUTH_ERROR, err)
        })
}

export const getPost = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.GET_POST_ERROR, res, func)
    tc(() => {
        const postId = req.params.postId

        let domain = req.query.domain ? req.query.domain.toString().toLowerCase() : 'dev'
        domain = !domain && req.params.domain ? req.params.domain : domain

        const filter: FilterQuery<IPost> = { _id: postId, domain }

        getPostFunc(filter, req, res)
    })
}

export const getPostByTitle = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.GET_POST_ERROR, res, func)
    tc(() => {
        const urlTitle = req.params.title

        let domain = req.query.domain ? req.query.domain.toString().toLowerCase() : 'dev'
        domain = !domain && req.params.domain ? req.params.domain : domain

        const filter: FilterQuery<IPost> = { urlTitle: urlTitle.trim(), domain }

        getPostFunc(filter, req, res)
    })
}

export const addPost = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.CREATE_POST_ERROR, res, func)

    tc(() => {
        const user = getAuthorizedUser(req.headers.authorization)
        const rawPost: IPost = req.body

        createAnnotation(rawPost.annotation)
            .then((annotation) => {
                const post = preparePostToCreate(rawPost, user, annotation)

                createPost(post)
                    .then((post) => {
                        if (post) {
                            const pathToImgFolder = getPathToPostImgDir(post._id, user)

                            createImgsDir(pathToImgFolder, post.urlTitle)
                                .then(() => {
                                    const msg = `${msgs.POST_CREATED}: ${post.urlTitle}`
                                    successResponse(res, msg, { post })
                                })
                                .catch((err) => {
                                    errorResponse(res, msgs.POST_NOT_CREATED, err)
                                })
                        } else {
                            errorResponse(res, msgs.POST_NOT_CREATED)
                        }
                    })
                    .catch((err) => {
                        if (String(err).includes('duplicate key')) {
                            errorResponse(res, msgs.DUPLICATE_POST, err)
                        } else {
                            errorResponse(res, msgs.POST_NOT_CREATED, err)
                        }
                    })
            })
            .catch((err) => {
                if (String(err).includes('duplicate key')) {
                    errorResponse(res, msgs.DUPLICATE_POST_ANNOTATION, err)
                } else {
                    errorResponse(res, msgs.POST_ANNOTATION_NOT_CREATED, err)
                }
            })
    })
}

const updateDataPost = (postId: string, data: IPost, res: Response, oldPost?: IPost) => {
    updatePost(postId, data, oldPost)
        .then((updatedPost) => {
            // afterUpdatePost(oldPost, updatedPost)
            //     .then(() => {
            successResponse(res, msgs.POST_UPDATED, { post: updatedPost })
            // })
            // .catch((err) => {
            //     errorResponse(res, msgs.UPDATE_POST_ERROR, err)
            // })
        })
        .catch((err) => {
            if (String(err).includes('duplicate key')) {
                errorResponse(res, msgs.DUPLICATE_POST, err)
            } else {
                errorResponse(res, msgs.UPDATE_POST_ERROR, err)
            }
        })
}

export const changePostData = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.UPDATE_POST_ERROR, res, func)

    tc(() => {
        const postId = req.params.postId
        const rawPost: IPost = req.body
        // const filter: FilterQuery<IPostData> = getFilterDataToUpdatePost(postId, rawPost)

        findOnePost({ _id: postId })
            .then((oldPost) => {
                if (oldPost) {
                    findOneAnnotation({ _id: oldPost.annotationId })
                        .then(() => {
                            updateAnnotation(oldPost.annotationId, rawPost.annotation)
                                .then(() => {
                                    const dataToUpdate = preparePostToUpdate(rawPost, oldPost)
                                    if (oldPost.content !== rawPost.content) {
                                        const oldIds = oldPost.content
                                            .split('****')
                                            .map((s) => {
                                                const startIdx = 0
                                                const endIdx = s.indexOf('<h3>')

                                                if (endIdx === 0) {
                                                    return null
                                                }

                                                return s.substring(startIdx, endIdx)
                                            })
                                            .filter((id) => !!id)

                                        const newIds = rawPost.content.split('****').map((s) => {
                                            const startIdx = 0
                                            const endIdx = s.indexOf('<h3>')

                                            if (endIdx === 0) {
                                                return null
                                            }

                                            return s.substring(startIdx, endIdx)
                                        })

                                        oldIds.forEach((oldId) => {
                                            if (!newIds.includes(oldId)) {
                                                deletePhotoPost(oldId)
                                                    .then()
                                                    .catch((err) => {
                                                        errorResponse(res, msgs.DELETE_PHOTO_POST_ERROR, err)
                                                    })
                                            }
                                        })
                                    }

                                    updateDataPost(postId, dataToUpdate, res, oldPost)
                                })
                                .catch((err) => {
                                    errorResponse(res, msgs.UPDATE_POST_ANNOTATION_ERROR, err)
                                })
                        })
                        .catch((err) => {
                            errorResponse(res, msgs.POST_ANNOTATION_NOT_FOUND, err)
                        })
                } else {
                    errorResponse(res, msgs.NOTHING_TO_UPDATE)
                }
            })
            .catch((err) => {
                if (err === null) {
                    successResponse(res, msgs.NOTHING_TO_UPDATE, { post: rawPost })
                } else {
                    errorResponse(res, msgs.UPDATE_POST_ERROR, err)
                }
            })
    })
}

export const addLikePost = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.UPDATE_LIKE_ERROR, res, func)

    tc(() => {
        const postId = req.params.postId

        findOnePost({ _id: postId })
            .then((oldPost) => {
                if (oldPost) {
                    const user = getAuthorizedUser(req.headers.authorization)
                    updateDataPost(postId, { likes: [...oldPost.likes, user.id] }, res)
                } else {
                    errorResponse(res, msgs.NOTHING_TO_UPDATE)
                }
            })
            .catch((err) => {
                errorResponse(res, msgs.UPDATE_LIKE_ERROR, err)
            })
    })
}

export const removeLikePost = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.UPDATE_LIKE_ERROR, res, func)

    tc(() => {
        const postId = req.params.postId

        findOnePost({ _id: postId })
            .then((oldPost) => {
                if (oldPost) {
                    const user = getAuthorizedUser(req.headers.authorization)
                    updateDataPost(postId, { likes: [...oldPost.likes.filter((l) => l !== user.id)] }, res)
                } else {
                    errorResponse(res, msgs.NOTHING_TO_UPDATE)
                }
            })
            .catch((err) => {
                errorResponse(res, msgs.UPDATE_LIKE_ERROR, err)
            })
    })
}

export const addSharePost = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.UPDATE_SHARE_POST_ERROR, res, func)

    tc(() => {
        const postId = req.params.postId

        findOnePost({ _id: postId })
            .then((oldPost) => {
                if (oldPost) {
                    updateDataPost(postId, { shares: oldPost.shares++ }, res)
                } else {
                    errorResponse(res, msgs.NOTHING_TO_UPDATE)
                }
            })
            .catch((err) => {
                errorResponse(res, msgs.UPDATE_SHARE_POST_ERROR, err)
            })
    })
}

export const changeStatusPost = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.UPDATE_STATUS_POST_ERROR, res, func)

    tc(() => {
        const postId = req.params.postId
        const status = req.body.status

        if (typeof Object.values(statuses).find((s) => s === status) === 'number') {
            findOnePost({ _id: postId })
                .then((oldPost) => {
                    if (oldPost) {
                        const publishedDate = status === statuses.PUBLISHED ? new Date() : null
                        updateDataPost(postId, { status, publishedDate }, res)
                    } else {
                        errorResponse(res, msgs.NOTHING_TO_UPDATE)
                    }
                })
                .catch((err) => {
                    errorResponse(res, msgs.UPDATE_STATUS_POST_ERROR, err)
                })
        } else {
            errorResponse(res, msgs.UPDATE_STATUS_POST_ERROR)
        }
    })
}
//
// export const changeSizePhotoPost = (req: Request, res: Response): void => {
//     const tc = (func) => tryCatch(msgs.UPDATE_SIZE_PHOTO_POST_ERROR, res, func)
//
//     tc(() => {
//         const photoId = req.params.photoId
//         const size = Number(req.body.size)
//
//         findOnePost({ _id: photoId })
//             .then((oldPost) => {
//                 if (oldPost) {
//                     const urlIdx = oldPost.content.indexOf(title)
//                     const startSizeIdx = oldPost.content.indexOf('[[size:', urlIdx)
//                     const endStartIdx = oldPost.content.indexOf(']]', startSizeIdx) + 2
//
//                     const subStrSize = oldPost.content.substring(startSizeIdx, endStartIdx)
//                     const subUrlStrSize = oldPost.content.substr(urlIdx, endStartIdx)
//
//                     const newStrSize = subUrlStrSize.replace(subStrSize, `[[size:${size}]]`)
//                     const content = oldPost.content.replace(subUrlStrSize, newStrSize)
//
//                     updateDataPost(postId, { content }, res)
//                 } else {
//                     errorResponse(res, msgs.NOTHING_TO_UPDATE)
//                 }
//             })
//             .catch((err) => {
//                 errorResponse(res, msgs.POST_NOT_FOUND, err)
//             })
//     })
// }

export const removePost = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.DELETE_POST_ERROR, res, func)

    tc(() => {
        const postId = req.params.postId

        findOnePost({ _id: postId })
            .then((post) => {
                const user = getAuthorizedUser(req.headers.authorization)

                deleteAllPhotoPost(post._id)
                    .then(() => {
                        findOneAnnotation({ _id: post.annotationId })
                            .then(() => {
                                deleteAnnotation(post.annotationId)
                                    .then(() => {
                                        deletePost(postId)
                                            .then(() => {
                                                afterDeletePost(post, user)
                                                    .then(() => {
                                                        successResponse(res, msgs.POST_DELETED)
                                                    })
                                                    .catch((err) => {
                                                        errorResponse(res, msgs.POST_DELETED, err)
                                                    })
                                            })
                                            .catch((err) => {
                                                errorResponse(res, msgs.POST_NOT_DELETED, err)
                                            })
                                    })
                                    .catch((err) => {
                                        errorResponse(res, msgs.POST_ANNOTATION_NOT_DELETED, err)
                                    })
                            })
                            .catch((err) => {
                                errorResponse(res, msgs.POST_ANNOTATION_NOT_FOUND, err)
                            })
                    })
                    .catch((err) => {
                        errorResponse(res, msgs.POST_PHOTOS_NOT_DELETED, err)
                    })
            })
            .catch((err) => {
                errorResponse(res, msgs.POST_NOT_FOUND, err)
            })
    })
}

export const getUrlForUndefinedPost = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.DEFINE_POST_ERROR, res, func)

    tc(() => {
        const urlTitle = req.params.urlTitle.trim()

        findOnePost({ urlTitle })
            .then((post) => {
                if (post.sectionId) {
                    findOneSection({ _id: post.sectionId })
                        .then((section) => {
                            const url = `https://${section.domain}.foma-blog.ru/post/${post.urlTitle}`
                            successResponse(res, msgs.DEFINE_POST_FOUND, { url })
                        })
                        .catch((err) => {
                            errorResponse(res, msgs.DEFINE_POST_NOT_FOUND, err)
                        })
                }
            })
            .catch((err) => {
                errorResponse(res, msgs.DEFINE_POST_NOT_FOUND, err)
            })
    })
}
