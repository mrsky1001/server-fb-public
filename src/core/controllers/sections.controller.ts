/*
 * Copyright (c) 22.11.2021, 18:37  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */
import { FilterQuery } from 'mongoose'
import { Request, Response } from 'express'
import { errorResponse, successResponse, tryCatch } from '../lib/try-catch.lib'
import msgs from '../../app/collections/messages'
import { getAuthorizedUser, isAuthorized } from './auth.controller'
import statuses from '../collections/statuses'
import { ISection } from '../models/schemes/section.schema'
import { createSection, deleteSection, findOneSection, findSections, updateSection } from '../db.queries/sections.queries'
import { prepareSectionToCreate, prepareSectionToUpdate } from '../services/sections.service'

export const getSections = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.GET_SECTION_ERROR, res, func)

    tc(() => {
        const domain = req.query.domain ?? 'dev'

        const options = {
            sort: {
                // status: -1,
                creatingDate: -1,
            },
        }

        findSections({ domain }, undefined, options)
            .then((sections) => {
                successResponse(res, msgs.SECTIONS_LOADED, { sections })
            })
            .catch((err) => {
                errorResponse(res, msgs.SECTIONS_NOT_LOADED, err)
            })
    })
}

export const getSection = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.GET_SECTION_ERROR, res, func)
    tc(() => {
        const sectionId = req.params.sectionId
        const filter: FilterQuery<ISection> = { _id: sectionId }

        isAuthorized(req)
            .then((isAuth) => {
                !isAuth && (filter.status = statuses.PUBLISHED)

                findOneSection(filter)
                    .then((section) => {
                        successResponse(res, msgs.SECTION_FOUND, { section })
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

export const addSection = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.CREATE_SECTION_ERROR, res, func)

    tc(() => {
        const user = getAuthorizedUser(req.headers.authorization)
        const section = prepareSectionToCreate(req.body, user)

        createSection(section)
            .then((section) => {
                successResponse(res, msgs.SECTION_CREATED, { section })
            })
            .catch((err) => {
                errorResponse(res, msgs.SECTION_NOT_CREATED, err)
            })
    })
}

const updateDataSection = (sectionId: string, data: ISection, oldSection: ISection, res: Response) => {
    updateSection(sectionId, data)
        .then((updatedSection) => {
            successResponse(res, msgs.SECTION_UPDATED, { section: updatedSection })
        })
        .catch((err) => {
            errorResponse(res, msgs.UPDATE_SECTION_ERROR, err)
        })
}

export const changeSectionData = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.UPDATE_SECTION_ERROR, res, func)

    tc(() => {
        const sectionId = req.params.sectionId
        const data = req.body
        // const filter: FilterQuery<ISectionData> = getFilterDataToUpdateSection(sectionId, data)

        findOneSection({ _id: sectionId })
            .then((oldSection) => {
                if (oldSection) {
                    const dataToUpdate = prepareSectionToUpdate(data, oldSection)
                    updateDataSection(sectionId, dataToUpdate, oldSection, res)
                } else {
                    errorResponse(res, msgs.NOTHING_TO_UPDATE)
                }
            })
            .catch((err) => {
                if (err === null) {
                    successResponse(res, msgs.NOTHING_TO_UPDATE, { section: data })
                } else {
                    errorResponse(res, msgs.UPDATE_SECTION_ERROR, err)
                }
            })
    })
}

export const removeSection = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.DELETE_SECTION_ERROR, res, func)

    tc(() => {
        const sectionId = req.params.sectionId
        const user = getAuthorizedUser(req.headers.authorization)

        findOneSection({ _id: sectionId })
            .then((section) => {
                if (!section.author || section.author.id === user.id) {
                    deleteSection(sectionId)
                        .then(() => {
                            successResponse(res, msgs.SECTION_DELETED)
                        })
                        .catch((err) => {
                            errorResponse(res, msgs.SECTION_NOT_DELETED, err)
                        })
                } else {
                    errorResponse(res, msgs.NOT_ALLOWED_SECTION_DELETE)
                }
            })
            .catch((err) => {
                errorResponse(res, msgs.SECTION_NOT_FOUND, err)
            })
    })
}
