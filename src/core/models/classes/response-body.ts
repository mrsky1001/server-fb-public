/*
 * Copyright (c)  Kolyada Nikita Vladimirovich <nikita.nk16@yandex.ru> 12.09.2021, 21:35
 */
export interface IResponseBody {
    status: number
    success: boolean
    message: string
    data?: any
}

export default class ResponseBody implements IResponseBody {
    status: number
    success: boolean
    message: string
    data?: any

    constructor(status: number, success: boolean, message: string, data?: any) {
        this.status = status
        this.success = success
        this.message = message
        this.data = data
    }
}
