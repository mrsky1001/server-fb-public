/*
 * Copyright (c) 16.01.2022, 16:19  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */

import { FilterQuery, QueryOptions } from 'mongoose'
import { IPost } from '../schemes/post.schema'

export interface IPostsQuerySettings {
    filter: FilterQuery<IPost>
    projection?: any
    options?: QueryOptions
}
