/*
 * Copyright (c)  Kolyada Nikita Vladimirovich <nikita.nk16@yandex.ru> 12.09.2021, 21:28
 */
import { FilterQuery } from 'mongoose'
import { IUser } from '../models/schemes/user.schema'
import { IDomain, DomainSchema } from '../models/schemes/domain.schema'

const serverDataProps = ['_id', 'author', 'creatingDate', 'likes']

export const getFilterSearch = (text: string): FilterQuery<IDomain> => {
    return {
        $or: [{ name: { $regex: text, $options: 'i' } }, { 'author.username': { $regex: text, $options: 'i' } }],
    }
}

/**
 * Prepare domain
 */

// export const setDomainDate = (rawDomain: IDomain, domain: IDomain): void => {
//     if (rawDomain.name !== domain.name) {
//         domain.creatingDate = new Date()
//     }
// }

const setSchemaProps = (rawDomain: IDomain, domain: IDomain): void => {
    const schemaProps = Object.keys(DomainSchema.paths)
    const rawProps = Object.keys(rawDomain)

    delete domain._id

    schemaProps.forEach((prop) => {
        if (rawProps.includes(prop) && !serverDataProps.includes(prop)) {
            domain[prop] = typeof rawDomain[prop] === 'string' ? String(rawDomain[prop]).trim() : rawDomain[prop]
        }
    })
}

export const prepareDomainToUpdate = (rawDomain: IDomain, oldDomain: IDomain): IDomain => {
    return {
        name: rawDomain.name ?? oldDomain.name,
        text: rawDomain.text ?? oldDomain.text,
        description: rawDomain.description ?? oldDomain.description,
    }
}

export const prepareDomainToCreate = (rawDomain: IDomain): IDomain => {
    const domain: IDomain = { name: '', description: '', text: '' }

    setSchemaProps(rawDomain, domain)

    return domain
}
