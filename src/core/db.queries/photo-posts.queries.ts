/*
 * Copyright (c) 22.11.2021, 18:38  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */

import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose'
import PhotoPostModel, { IPhotoPost } from '../models/schemes/photo-post.schema'
import PostModel, { IPost } from '../models/schemes/post.schema'

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

const getComputedValuesPhotoPost = async (photoPost: IPhotoPost): Promise<IPhotoPost> => {
    const newPhotoPost = photoPost.toObject()
    const postWithContent = await PostModel.findOne({ _id: photoPost.postId }, { content: 1 })
    const titleIdx = postWithContent.content.indexOf(newPhotoPost.title)
    const endOfImg = postWithContent.content.indexOf('>', postWithContent.content.indexOf('<img', titleIdx)) + 1

    const nextStart = postWithContent.content.indexOf('<h3>', titleIdx)
    const endContent = nextStart > -1 ? nextStart : postWithContent.content.length - 1

    newPhotoPost.description = getSubStr(postWithContent.content, endOfImg, endContent)

    return newPhotoPost
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const findPhotoPosts = (
    filter: FilterQuery<IPhotoPost>,
    projection?: any,
    options?: QueryOptions
): Promise<IPhotoPost[]> => {
    const photoPostsPromise = new Promise<IPhotoPost[]>((resolve, reject) => {
        void PhotoPostModel.find(filter, projection, options, (err, posts) => {
            if (!err) {
                resolve(posts)
            } else {
                reject(err)
            }
        })
    })

    return new Promise<IPhotoPost[]>((resolve, reject) => {
        photoPostsPromise
            .then((posts) => {
                const postsPromises = posts.map(async (photoPost) => {
                    return await getComputedValuesPhotoPost(photoPost)
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
export const findOnePhotoPost = (filter: FilterQuery<IPhotoPost>, projection?: any): Promise<IPhotoPost> => {
    const postPromise = new Promise<IPhotoPost>((resolve, reject) => {
        void PhotoPostModel.findOne(filter, projection, (err, photoPost) => {
            if (!err) {
                resolve(photoPost)
            } else {
                reject(err)
            }
        })
    })

    return new Promise<IPhotoPost>((resolve, reject) => {
        postPromise
            .then((photoPost) => {
                getComputedValuesPhotoPost(photoPost)
                    .then((updatedPhotoPost) => {
                        resolve(updatedPhotoPost)
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

export const createPhotoPosts = (post: IPost): Promise<IPhotoPost[]> => {
    return new Promise<IPhotoPost[]>((resolve, reject) => {
        void PhotoPostModel.find({ postId: post._id }, null, null, (err, photoPosts) => {
            const allPhotos = []
            const newPhotos = []

            post.content.split('<h3').forEach((s) => {
                if (s.length > 10) {
                    s = '<h3' + s
                    const title = getSubStr(s, '<h3>', '</h3>')
                    const endOfImg = s.indexOf('>', s.indexOf('<img'))
                    const rawUrl = getSubStr(s, '<img', endOfImg)
                    const srcIdx = rawUrl.indexOf('src="') + 5
                    const url = getSubStr(rawUrl, srcIdx, rawUrl.indexOf('"', srcIdx))

                    if (title.length && url.length) {
                        const oldPhoto = photoPosts.find((p) => p.title === title && p.url === url)
                        if (oldPhoto) {
                            allPhotos.push(oldPhoto)
                        } else {
                            const newPhoto = {
                                postId: post._id,
                                title,
                                url,
                            }

                            newPhotos.push(newPhoto)
                            allPhotos.push(newPhoto)
                        }
                    }
                }
            })

            photoPosts.forEach((p) => {
                if (!allPhotos.find((rp) => rp.title === p.title)) {
                    void PhotoPostModel.deleteOne({ _id: p._id }, null, (err) => {
                        if (err) reject(err)
                    })
                }
            })

            void PhotoPostModel.insertMany(newPhotos, null, (err, createdPhotoPosts: IPhotoPost[]) => {
                if (createdPhotoPosts && !err) {
                    resolve(createdPhotoPosts)
                } else {
                    reject(err)
                }
            })
        })
    })
}

export const updatePhotoPost = (photoPostId: string, photoPost: UpdateQuery<IPhotoPost>): Promise<IPhotoPost> => {
    return new Promise<IPhotoPost>((resolve, reject) => {
        const filter = { _id: photoPostId }

        void PhotoPostModel.updateOne(filter, photoPost, null, (err) => {
            if (!err) {
                findOnePhotoPost(filter)
                    .then((updatedPhotoPost) => {
                        resolve(updatedPhotoPost)
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

export const deletePhotoPost = (photoPostId: string): Promise<IPhotoPost> => {
    return new Promise<IPhotoPost>((resolve, reject) => {
        const filter = { _id: photoPostId }

        void PhotoPostModel.deleteOne(filter, (err, res) => {
            if (res && !err) {
                resolve(res)
            } else {
                reject(err)
            }
        })
    })
}

export const deleteAllPhotoPost = (postId: string): Promise<IPhotoPost> => {
    return new Promise<IPhotoPost>((resolve, reject) => {
        const filter = { postId: postId }

        void PhotoPostModel.deleteMany(filter, (err, res) => {
            if (res && !err) {
                resolve(res)
            } else {
                reject(err)
            }
        })
    })
}
