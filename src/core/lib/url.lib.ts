/*
 * Copyright (©) 22.09.2021, 11:14. Kolyada Nikita Vladimirovich (nikita.nk16@yandex.ru)
 */

export const urlWithoutParams = (url: string): string => {
    const idx = url.indexOf('/:')
    const end = idx > -1 ? idx : url.length - 1

    return url.substring(0, end)
}
