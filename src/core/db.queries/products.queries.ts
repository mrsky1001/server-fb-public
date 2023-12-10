/*
 * Copyright (c) 22.11.2021, 18:38  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */

import { FilterQuery, QueryOptions } from 'mongoose'
import ProductModel, { IProduct } from '../models/schemes/product.schema'
import CommentModel from '../models/schemes/comment.schema'
import AnnotationModel from '../models/schemes/annotation.schema'
import UserModel from '../models/schemes/user.schema'

const getComputedValuesProduct = async (product: IProduct): Promise<IProduct> => {
    const newProduct = product.toObject()
    newProduct.countComments = await CommentModel.count({ productId: newProduct._id })
    newProduct.annotation = await AnnotationModel.findOne({ _id: newProduct.annotationId })
    newProduct.author = await UserModel.findOne({ _id: newProduct.authorId })

    return newProduct
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const findProducts = (filter: FilterQuery<IProduct>, projection?: any, options?: QueryOptions): Promise<IProduct[]> => {
    const productsPromise = new Promise<IProduct[]>((resolve, reject) => {
        void ProductModel.find(filter, projection, options, (err, products) => {
            if (!err) {
                resolve(products)
            } else {
                reject(err)
            }
        })
    })

    return new Promise<IProduct[]>((resolve, reject) => {
        productsPromise
            .then((products) => {
                const productsPromises = products.map(async (product) => {
                    return await getComputedValuesProduct(product)
                })

                Promise.all(productsPromises)
                    .then((products) => {
                        resolve(products)
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
export const findOneProduct = (filter: FilterQuery<IProduct>, projection?: any): Promise<IProduct> => {
    const productPromise = new Promise<IProduct>((resolve, reject) => {
        void ProductModel.findOne(filter, projection, (err, product) => {
            if (!err) {
                resolve(product)
            } else {
                reject(err)
            }
        })
    })

    return new Promise<IProduct>((resolve, reject) => {
        productPromise
            .then((product) => {
                getComputedValuesProduct(product)
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

export const createProduct = (product: IProduct): Promise<IProduct> => {
    return new Promise<IProduct>((resolve, reject) => {
        ProductModel.create(product, (err, res) => {
            if (res && !err) {
                resolve(res)
            } else {
                reject(err)
            }
        })
    })
}

export const updateProduct = (productId: string, product: IProduct): Promise<IProduct> => {
    return new Promise<IProduct>((resolve, reject) => {
        const filter = { _id: productId }

        void ProductModel.updateOne(filter, product, null, (err) => {
            if (!err) {
                findOneProduct(filter)
                    .then((updateProduct) => {
                        resolve(updateProduct)
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

export const deleteProduct = (productId: string): Promise<IProduct> => {
    return new Promise<IProduct>((resolve, reject) => {
        const filter = { _id: productId }

        void ProductModel.deleteOne(filter, (err, res) => {
            if (res && !err) {
                resolve(res)
            } else {
                reject(err)
            }
        })
    })
}
