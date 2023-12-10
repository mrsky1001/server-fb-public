/*
 * Copyright (c) 22.11.2021, 18:37  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */
import { Request, Response } from 'express'
import { errorResponse, successResponse, tryCatch } from '../lib/try-catch.lib'
import msgs from '../../app/collections/messages'
import * as nodemailer from 'nodemailer'

export const postEmail = (req: Request, res: Response): void => {
    const tc = (func) => tryCatch(msgs.EMAIL_ERROR, res, func)

    tc(() => {
        const name: string = req.body.name
        const subject: string = req.body.subject
        const emailFeedBack: string = req.body.email
        const text: string = req.body.text

        if (name && subject && emailFeedBack && text) {
            // create reusable transporter object using the default SMTP transport
            const transporter = nodemailer.createTransport({
                host: 'smtp.yandex.ru',
                port: 465,
                secure: true,
                auth: {
                    user: 'userFromSiteFB@yandex.ru',
                    pass: '2QmqgdNqJTWkSg',
                },
            })

            // send mail with defined transport object
            transporter
                .sendMail({
                    from: '"UserFromSiteFB" <userFromSiteFB@yandex.ru>', // sender address
                    to: 'foma.blog@yandex.ru', // list of receivers
                    subject: `${subject} от ${emailFeedBack} (${name})`, // Subject line
                    text: text, // plain text body
                    html: '<div style="width: 50px; height: 100px; background-color: blueviolet"></div>', // html body
                })
                .then(() => {
                    successResponse(res, msgs.EMAIL_SUCCESS)
                })
                .catch((err) => {
                    errorResponse(res, msgs.EMAIL_ERROR, err)
                })
        } else {
            throw new Error('Incorrect params! [' + name + ', ' + subject + ', ' + emailFeedBack + ', ' + text + ']')
        }
    })
}
