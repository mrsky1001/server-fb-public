/*
 * Copyright (c) 22.11.2021, 18:50  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */

import { IRole } from '../schemes/role.schema'

export interface IMethod {
    type: 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'
    url: string
    callback: (...any) => any
    role?: IRole
}
