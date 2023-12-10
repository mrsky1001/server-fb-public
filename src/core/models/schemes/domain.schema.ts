/*
 * Copyright (©) 09.07.2021, 17:13. Kolyada Nikita Vladimirovich (nikita.nk16@yandex.ru)
 */

import { model, Schema } from 'mongoose'
import { IBase } from '../interfaces/IBase'

export interface IDomain extends IBase {
    name: string
    text: string
    description: string
}

export const DomainSchema = new Schema<IDomain>({
    name: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
})

export default model('Domain', DomainSchema)
