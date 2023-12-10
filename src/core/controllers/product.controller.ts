/*
 * Copyright (c) 22.11.2021, 18:37  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */
import { FilterQuery } from 'mongoose'
import { Request, Response } from 'express'
import { errorResponse, successResponse, tryCatch } from '../lib/try-catch.lib'
import msgs from '../../app/collections/messages'
import { createProduct, deleteProduct, findOneProduct, findProducts, updateProduct } from '../db.queries/products.queries'
import { getAuthorizedUser, isAuthorized } from './auth.controller'
import statuses from '../collections/statuses'
import { IProduct } from '../models/schemes/product.schema'
import { createImgsDir, getPathToPostImgDir } from '../services/imgs.services'
import { afterDeleteProduct, prepareProduct } from '../services/products.service'
import { createAnnotation, deleteAnnotation, findOneAnnotation, updateAnnotation } from '../db.queries/annotations.queries'

const setFilterProducts = (section: string, isAuth: boolean) => {
    const filter: FilterQuery<IProduct> = {}

    if (!isAuth) {
        filter.status = statuses.PUBLISHED
    }

    if (section && section !== 'блог') {
        filter.tags = { $all: [section] }
    }

    return filter
}

export const getProducts = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.GET_PRODUCT_ERROR, res, func)

    tc(() => {
        isAuthorized(req)
            .then((isAuth) => {
                const section = req.params.section ? req.params.section.toLowerCase() : undefined

                const filter = setFilterProducts(section, isAuth)
                const projection = {
                    annotation: 1,
                    likes: 1,
                    shares: 1,
                    views: 1,
                    urlTitle: 1,
                    status: 1,
                    readTime: 1,
                    author: 1,
                    creatingDate: 1,
                    publishedDate: 1,
                    tags: 1,
                    price: 1,
                    title: 1,
                }

                const options = {
                    sort: {
                        status: -1,
                        publishedDate: -1,
                    },
                }

                findProducts(filter, projection, options)
                    .then((products) => {
                        successResponse(res, msgs.PRODUCTS_LOADED, { products })
                    })
                    .catch((err) => {
                        errorResponse(res, msgs.PRODUCTS_NOT_LOADED, err)
                    })
            })
            .catch((err) => {
                errorResponse(res, msgs.CHECK_AUTH_ERROR, err)
            })
    })
}

const afterGetProduct = (filter, req, res) => {
    isAuthorized(req)
        .then((isAuth) => {
            !isAuth && (filter.status = statuses.PUBLISHED)

            findOneProduct(filter)
                .then((product) => {
                    if (product.status === statuses.PUBLISHED) {
                        product.views += 1

                        updateProduct(product.id, product)
                            .then((updatedProduct) => {
                                successResponse(res, msgs.PRODUCT_FOUND, { product: updatedProduct })
                            })
                            .catch((err) => {
                                errorResponse(res, msgs.PRODUCT_NOT_UPDATED, err)
                            })
                    } else {
                        successResponse(res, msgs.PRODUCT_FOUND, { product })
                    }
                })
                .catch((err) => {
                    errorResponse(res, msgs.PRODUCT_NOT_FOUND, err)
                })
        })
        .catch((err) => {
            errorResponse(res, msgs.CHECK_AUTH_ERROR, err)
        })
}

export const getProduct = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.GET_PRODUCT_ERROR, res, func)
    tc(() => {
        const productId = req.params.productId
        const filter: FilterQuery<IProduct> = { _id: productId }

        afterGetProduct(filter, req, res)
    })
}

export const getProductByTitle = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.GET_PRODUCT_ERROR, res, func)
    tc(() => {
        const urlTitle = req.params.title
        const filter: FilterQuery<IProduct> = { urlTitle: urlTitle.trim() }

        afterGetProduct(filter, req, res)
    })
}

export const addProduct = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.CREATE_PRODUCT_ERROR, res, func)

    tc(() => {
        const user = getAuthorizedUser(req.headers.authorization)
        const rawProduct = req.body

        createAnnotation(rawProduct.annotation)
            .then((annotation) => {
                const product = prepareProduct(req.body, user, annotation)

                createProduct(product)
                    .then((product) => {
                        if (product) {
                            const pathToImgFolder = getPathToPostImgDir(product._id, user)

                            createImgsDir(pathToImgFolder, product.urlTitle)
                                .then(() => {
                                    const msg = `${msgs.PRODUCT_CREATED}: ${product.urlTitle}`
                                    successResponse(res, msg, { product })
                                })
                                .catch((err) => {
                                    errorResponse(res, msgs.PRODUCT_NOT_CREATED, err)
                                })
                        } else {
                            errorResponse(res, msgs.PRODUCT_NOT_CREATED)
                        }
                    })
                    .catch((err) => {
                        if (String(err).includes('duplicate key')) {
                            errorResponse(res, msgs.DUPLICATE_PRODUCT, err)
                        } else {
                            errorResponse(res, msgs.PRODUCT_NOT_CREATED, err)
                        }
                    })
            })
            .catch((err) => {
                if (String(err).includes('duplicate key')) {
                    errorResponse(res, msgs.DUPLICATE_PRODUCT_ANNOTATION, err)
                } else {
                    errorResponse(res, msgs.PRODUCT_ANNOTATION_NOT_CREATED, err)
                }
            })
    })
}

export const changeProduct = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.UPDATE_PRODUCT_ERROR, res, func)

    tc(() => {
        const user = getAuthorizedUser(req.headers.authorization)
        const rawProduct = req.body
        const productId = req.params.productId

        findOneProduct({ _id: productId })
            .then((oldProduct) => {
                findOneAnnotation({ _id: oldProduct.annotationId })
                    .then(() => {
                        updateAnnotation(oldProduct.annotationId, rawProduct.annotation)
                            .then((updatedAnnotation) => {
                                const product = prepareProduct(req.body, user, updatedAnnotation)
                                updateProduct(productId, product)
                                    .then((updatedProduct) => {
                                        // afterUpdateProduct(oldProduct, updatedProduct)
                                        //     .then(() => {
                                        successResponse(res, msgs.PRODUCT_UPDATED, { product: updatedProduct })
                                        // })
                                        // .catch((err) => {
                                        //     errorResponse(res, msgs.UPDATE_PRODUCT_ERROR, err)
                                        // })
                                    })
                                    .catch((err) => {
                                        errorResponse(res, msgs.UPDATE_PRODUCT_ERROR, err)
                                    })
                            })
                            .catch((err) => {
                                errorResponse(res, msgs.UPDATE_PRODUCT_ANNOTATION_ERROR, err)
                            })
                    })
                    .catch((err) => {
                        errorResponse(res, msgs.PRODUCT_ANNOTATION_NOT_FOUND, err)
                    })
            })
            .catch((err) => {
                errorResponse(res, msgs.PRODUCT_NOT_FOUND, err)
            })
    })
}

export const removeProduct = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.DELETE_PRODUCT_ERROR, res, func)

    tc(() => {
        const productId: string = req.params.productId

        findOneProduct({ _id: productId })
            .then((product) => {
                const user = getAuthorizedUser(req.headers.authorization)

                deleteProduct(productId)
                    .then(() => {
                        afterDeleteProduct(product, user)
                            .then(() => {
                                findOneAnnotation({ _id: product.annotationId })
                                    .then(() => {
                                        deleteAnnotation(product.annotationId)
                                            .then(() => {
                                                successResponse(res, msgs.PRODUCT_DELETED)
                                            })
                                            .catch((err) => {
                                                errorResponse(res, msgs.PRODUCT_ANNOTATION_NOT_DELETED, err)
                                            })
                                    })
                                    .catch((err) => {
                                        errorResponse(res, msgs.PRODUCT_ANNOTATION_NOT_FOUND, err)
                                    })
                            })
                            .catch((err) => {
                                errorResponse(res, msgs.PRODUCT_DELETED, err)
                            })
                    })
                    .catch((err) => {
                        errorResponse(res, msgs.PRODUCT_NOT_DELETED, err)
                    })
            })
            .catch((err) => {
                errorResponse(res, msgs.PRODUCT_NOT_FOUND, err)
            })
    })
}
