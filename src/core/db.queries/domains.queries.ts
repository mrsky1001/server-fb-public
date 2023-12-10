/*
 * Copyright (c) 22.11.2021, 18:38  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */

import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose'
import DomainModel, { IDomain } from '../models/schemes/domain.schema'

// const getComputedValuesDomain = async (domainId: string): Promise<IDomain> => {
//     const countComments = await CommentModel.count({ domainId })
//     return { countComments }
// }

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const findDomains = (filter: FilterQuery<IDomain>, projection?: any, options?: QueryOptions): Promise<IDomain[]> => {
    const DomainsPromise = new Promise<IDomain[]>((resolve, reject) => {
        void DomainModel.find(filter, projection, options, (err, domain) => {
            if (!err) {
                resolve(domain)
            } else {
                reject(err)
            }
        })
    })

    return new Promise<IDomain[]>((resolve, reject) => {
        DomainsPromise.then((domain) => {
            Promise.all(domain)
                .then((domain) => {
                    resolve(domain)
                })
                .catch((err) => {
                    reject(err)
                })
        }).catch((err) => {
            reject(err)
        })
    })
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const findOneDomain = (filter: FilterQuery<IDomain>, projection?: any): Promise<IDomain> => {
    return new Promise<IDomain>((resolve, reject) => {
        void DomainModel.findOne(filter, projection, null, (err, domain) => {
            if (domain && !err) {
                resolve(domain)
            } else {
                reject(err)
            }
        })
    })
}

export const createDomain = (domain: IDomain): Promise<IDomain> => {
    return new Promise<IDomain>((resolve, reject) => {
        DomainModel.create(domain, (err, res) => {
            if (res && !err) {
                resolve(res)
            } else {
                reject(err)
            }
        })
    })
}

export const updateDomain = (domainId: string, domain: UpdateQuery<IDomain>): Promise<IDomain> => {
    return new Promise<IDomain>((resolve, reject) => {
        const filter = { _id: domainId }

        void DomainModel.updateOne(filter, domain, null, (err) => {
            if (!err) {
                findOneDomain(filter)
                    .then((updateDomain) => {
                        resolve(updateDomain)
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

export const deleteDomain = (domainId: string): Promise<IDomain> => {
    return new Promise<IDomain>((resolve, reject) => {
        const filter = { _id: domainId }

        void DomainModel.deleteOne(filter, (err, res) => {
            if (res && !err) {
                resolve(res)
            } else {
                reject(err)
            }
        })
    })
}
