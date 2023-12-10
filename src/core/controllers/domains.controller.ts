/*
 * Copyright (c) 22.11.2021, 18:37  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */
import { FilterQuery } from 'mongoose'
import { Request, Response } from 'express'
import { errorResponse, successResponse, tryCatch } from '../lib/try-catch.lib'
import msgs from '../../app/collections/messages'
import { getAuthorizedUser, isAuthorized } from './auth.controller'
import statuses from '../collections/statuses'
import { IDomain } from '../models/schemes/domain.schema'
import { createDomain, deleteDomain, findOneDomain, findDomains, updateDomain } from '../db.queries/domains.queries'
import { prepareDomainToCreate, prepareDomainToUpdate } from '../services/domain.service'

export const getDomains = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.GET_SECTION_ERROR, res, func)

    tc(() => {
        const domain = req.query.domain ?? 'dev'

        const options = {
            sort: {
                // status: -1,
                creatingDate: -1,
            },
        }

        findDomains({ domain }, undefined, options)
            .then((domains) => {
                successResponse(res, msgs.SECTIONS_LOADED, { domains })
            })
            .catch((err) => {
                errorResponse(res, msgs.SECTIONS_NOT_LOADED, err)
            })
    })
}

export const getDomain = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.GET_SECTION_ERROR, res, func)
    tc(() => {
        const domainId = req.params.domainId
        const filter: FilterQuery<IDomain> = { _id: domainId }

        isAuthorized(req)
            .then((isAuth) => {
                !isAuth && (filter.status = statuses.PUBLISHED)

                findOneDomain(filter)
                    .then((domain) => {
                        successResponse(res, msgs.SECTION_FOUND, { domain })
                    })
                    .catch((err) => {
                        errorResponse(res, msgs.SECTION_NOT_FOUND, err)
                    })
            })
            .catch((err) => {
                errorResponse(res, msgs.CHECK_AUTH_ERROR, err)
            })
    })
}

export const addDomain = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.CREATE_SECTION_ERROR, res, func)

    tc(() => {
        const domain = prepareDomainToCreate(req.body)

        createDomain(domain)
            .then((domain) => {
                successResponse(res, msgs.SECTION_CREATED, { domain })
            })
            .catch((err) => {
                errorResponse(res, msgs.SECTION_NOT_CREATED, err)
            })
    })
}

const updateDataDomain = (domainId: string, data: IDomain, oldDomain: IDomain, res: Response) => {
    updateDomain(domainId, data)
        .then((updatedDomain) => {
            successResponse(res, msgs.SECTION_UPDATED, { domain: updatedDomain })
        })
        .catch((err) => {
            errorResponse(res, msgs.UPDATE_SECTION_ERROR, err)
        })
}

export const changeDomainData = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.UPDATE_SECTION_ERROR, res, func)

    tc(() => {
        const domainId = req.params.domainId
        const data = req.body
        // const filter: FilterQuery<IDomainData> = getFilterDataToUpdateDomain(domainId, data)

        findOneDomain({ _id: domainId })
            .then((oldDomain) => {
                if (oldDomain) {
                    const dataToUpdate = prepareDomainToUpdate(data, oldDomain)
                    updateDataDomain(domainId, dataToUpdate, oldDomain, res)
                } else {
                    errorResponse(res, msgs.NOTHING_TO_UPDATE)
                }
            })
            .catch((err) => {
                if (err === null) {
                    successResponse(res, msgs.NOTHING_TO_UPDATE, { domain: data })
                } else {
                    errorResponse(res, msgs.UPDATE_SECTION_ERROR, err)
                }
            })
    })
}

export const removeDomain = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.DELETE_SECTION_ERROR, res, func)

    tc(() => {
        const domainId = req.params.domainId

        findOneDomain({ _id: domainId })
            .then(() => {
                deleteDomain(domainId)
                    .then(() => {
                        successResponse(res, msgs.SECTION_DELETED)
                    })
                    .catch((err) => {
                        errorResponse(res, msgs.SECTION_NOT_DELETED, err)
                    })
            })
            .catch((err) => {
                errorResponse(res, msgs.SECTION_NOT_FOUND, err)
            })
    })
}
