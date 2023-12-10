/*
 * Copyright (c)  Kolyada Nikita Vladimirovich <nikita.nk16@yandex.ru> 12.09.2021, 21:28
 */
import { IUser } from '../models/schemes/user.schema'
// @ts-ignore
import { afterDeletePost, setAnnotation, setPostDate, setPublished, setSchemaProps, setUser } from './posts.service'
import { IProduct, IProductToUpdate } from '../models/schemes/product.schema'
import { IAnnotation } from '../models/schemes/annotation.schema'

/**
 * Prepare section
 */

export const prepareProduct = (rawProduct: IProductToUpdate, user: IUser, annotation: IAnnotation): IProduct => {
    const product: IProduct = {}

    setPostDate(rawProduct, product)
    setSchemaProps(rawProduct, product)
    setAnnotation(product, annotation)
    setUser(product, user)
    setPublished(product)

    return product
}

/**
 * after Update Post
 */
// export const afterPublishedProduct = (oldProduct: IProduct, newProduct: IProduct): Promise<void> => {
//     return afterPublishedPost(oldProduct, newProduct)
// }

// export const afterUpdateProduct = (oldProduct: IProduct, newProduct: IProduct): Promise<void> => {
//     return new Promise<void>((resolve, reject) => {
//         afterPublishedProduct(oldProduct, newProduct)
//             .then(() => )
//             .catch((err) => reject(err))
// resolve()
// })
// }

export const afterDeleteProduct = (product: IProduct, user: IUser): Promise<void> => {
    return afterDeletePost(product, user)
}
