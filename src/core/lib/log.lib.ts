/*
 * Copyright (c)  Kolyada Nikita Vladimirovich <nikita.nk16@yandex.ru> 12.09.2021, 16:03
 */

export function logInfo(...messages: string[]): void {
    console.log('=============================== [ LOG ] =============================== ')

    console.log(`[ ${new Date().toISOString()} ]`)

    messages.forEach((msg) => console.log(msg))

    console.log('=============================== [ END ] =============================== ')
}

export function logError(...messages: string[]): void {
    console.error('=============================== [ LOG ] =============================== ')

    console.error(`[ ${new Date().toISOString()} ]`)

    messages.forEach((msg) => console.error(msg))

    console.error('=============================== [ END ] =============================== ')
}
