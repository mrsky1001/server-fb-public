/*
 * Copyright (c) 22.11.2021, 18:38  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */

import { FilterQuery, QueryOptions } from 'mongoose'
import SectionModel, { ISection } from '../models/schemes/section.schema'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const findSections = (filter: FilterQuery<ISection>, projection?: any, options?: QueryOptions): Promise<ISection[]> => {
    return new Promise<ISection[]>((resolve, reject) => {
        void SectionModel.find(filter, projection, options, (err, sections) => {
            if (!err) {
                resolve(sections)
            } else {
                reject(err)
            }
        })
    })
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const findOneSection = (filter: FilterQuery<ISection>, projection?: any, options?: QueryOptions): Promise<ISection> => {
    return new Promise<ISection>((resolve, reject) => {
        void SectionModel.findOne(filter, projection, options, (err, section) => {
            if (section && !err) {
                resolve(section)
            } else {
                reject(err)
            }
        })
    })
}

export const createSection = (section: ISection): Promise<ISection> => {
    return new Promise<ISection>((resolve, reject) => {
        SectionModel.create(section, (err, res) => {
            if (res && !err) {
                resolve(res)
            } else {
                reject(err)
            }
        })
    })
}

export const updateSection = (sectionId: string, section: ISection): Promise<ISection> => {
    return new Promise<ISection>((resolve, reject) => {
        const filter = { _id: sectionId }

        void SectionModel.updateOne(filter, section, null, (err) => {
            if (!err) {
                findOneSection(filter)
                    .then((updateSection) => {
                        resolve(updateSection)
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

export const deleteSection = (sectionId: string): Promise<ISection> => {
    return new Promise<ISection>((resolve, reject) => {
        const filter = { _id: sectionId }

        void SectionModel.deleteOne(filter, (err, res) => {
            if (res && !err) {
                resolve(res)
            } else {
                reject(err)
            }
        })
    })
}
