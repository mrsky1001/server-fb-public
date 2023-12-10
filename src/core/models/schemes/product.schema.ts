/*
 * Copyright (©) 09.07.2021, 17:13. Kolyada Nikita Vladimirovich (nikita.nk16@yandex.ru)
 */

import { model, Schema } from 'mongoose'
import { IPost, PostSchema } from './post.schema'

export interface IProductToUpdate extends IPost {
    price?: string
}

export interface IProduct extends IPost {
    price?: string
}

export const ProductSchema = new Schema<IProduct>(
    Object.assign(PostSchema, {
        price: {
            type: String,
        },
    })
)

export default model('Product', ProductSchema)
