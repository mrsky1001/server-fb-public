/*
 * Copyright (c) 22.11.2021, 18:38  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */

import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose'
import AnnotationModel, { IAnnotation } from '../models/schemes/annotation.schema'

// const getComputedValuesAnnotation = async (annotationId: string): Promise<IAnnotation> => {
//     const countComments = await CommentModel.count({ annotationId })
//     return { countComments }
// }

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const findAnnotations = (
    filter: FilterQuery<IAnnotation>,
    projection?: any,
    options?: QueryOptions
): Promise<IAnnotation[]> => {
    const annotationsPromise = new Promise<IAnnotation[]>((resolve, reject) => {
        void AnnotationModel.find(filter, projection, options, (err, annotations) => {
            if (!err) {
                resolve(annotations)
            } else {
                reject(err)
            }
        })
    })

    return new Promise<IAnnotation[]>((resolve, reject) => {
        annotationsPromise
            .then((annotations) => {
                Promise.all(annotations)
                    .then((annotations) => {
                        resolve(annotations)
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
export const findOneAnnotation = (filter: FilterQuery<IAnnotation>, projection?: any): Promise<IAnnotation> => {
    return new Promise<IAnnotation>((resolve, reject) => {
        void AnnotationModel.findOne(filter, projection, null, (err, annotation) => {
            if (annotation && !err) {
                resolve(annotation)
            } else {
                reject(err)
            }
        })
    })
}

export const createAnnotation = (annotation: IAnnotation): Promise<IAnnotation> => {
    return new Promise<IAnnotation>((resolve, reject) => {
        AnnotationModel.create(annotation, (err, res) => {
            if (res && !err) {
                resolve(res)
            } else {
                reject(err)
            }
        })
    })
}

export const updateAnnotation = (annotationId: string, annotation: UpdateQuery<IAnnotation>): Promise<IAnnotation> => {
    return new Promise<IAnnotation>((resolve, reject) => {
        const filter = { _id: annotationId }

        void AnnotationModel.updateOne(filter, annotation, null, (err) => {
            if (!err) {
                findOneAnnotation(filter)
                    .then((updateAnnotation) => {
                        resolve(updateAnnotation)
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

export const deleteAnnotation = (annotationId: string): Promise<IAnnotation> => {
    return new Promise<IAnnotation>((resolve, reject) => {
        const filter = { _id: annotationId }

        void AnnotationModel.deleteOne(filter, (err, res) => {
            if (res && !err) {
                resolve(res)
            } else {
                reject(err)
            }
        })
    })
}
