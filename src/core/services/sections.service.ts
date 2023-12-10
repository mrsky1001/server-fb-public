/*
 * Copyright (c)  Kolyada Nikita Vladimirovich <nikita.nk16@yandex.ru> 12.09.2021, 21:28
 */
import { FilterQuery } from 'mongoose'
import { IUser } from '../models/schemes/user.schema'
import { ISection, ISectionData, SectionSchema } from '../models/schemes/section.schema'

const serverDataProps = ['_id', 'author', 'creatingDate', 'likes']

const schemaProps = Object.keys(SectionSchema.paths)

export const getFilterSearch = (text: string): FilterQuery<ISection> => {
    return {
        $or: [{ name: { $regex: text, $options: 'i' } }, { 'author.username': { $regex: text, $options: 'i' } }],
    }
}

/**
 * Prepare section
 */

export const setSectionDate = (rawSection: ISection, section: ISection): void => {
    if (rawSection.name !== section.name) {
        section.creatingDate = new Date()
    }
}

export const setSchemaProps = (rawSection: ISection, section: ISection): void => {
    const rawProps = Object.keys(rawSection)

    delete section._id

    schemaProps.forEach((prop) => {
        if (rawProps.includes(prop) && !serverDataProps.includes(prop)) {
            section[prop] = typeof rawSection[prop] === 'string' ? String(rawSection[prop]).trim() : rawSection[prop]
        }
    })
}

export const prepareSectionToUpdate = (rawSection: ISectionData, oldSection: ISection): ISectionData => {
    return {
        name: rawSection.name ?? oldSection.name,
        description: rawSection.description ?? oldSection.description,
        posts: rawSection.posts ?? oldSection.posts,
    }
}

export const prepareSectionToCreate = (rawSection: ISection, user: IUser): ISection => {
    const section: ISection = { author: user }

    setSectionDate(rawSection, section)
    setSchemaProps(rawSection, section)

    return section
}
