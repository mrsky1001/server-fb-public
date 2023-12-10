/*
 * Copyright (©) 09.07.2021, 17:13. Kolyada Nikita Vladimirovich (nikita.nk16@yandex.ru)
 */

import { model, Schema } from 'mongoose'
import { IBase } from '../interfaces/IBase'

export interface IAnnotation extends IBase {
    text: string
    imgUrl: string
    keywords: string[]
}

const AnnotationSchema = new Schema<IAnnotation>({
    text: {
        type: String,
        required: true,
    },
    imgUrl: {
        type: String,
        required: false,
    },
    keywords: [
        {
            type: String,
            required: true,
            default: '',
        },
    ],
})

export default model('Annotation', AnnotationSchema)
