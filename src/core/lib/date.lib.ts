/*
 * Copyright (©) 09.07.2021, 17:13. Kolyada Nikita Vladimirovich (nikita.nk16@yandex.ru)
 */

export const dateCompareToMlSc = (oldDate: Date | string, lastDate: Date | string = new Date()): number => {
    return new Date(lastDate).getTime() - new Date(oldDate).getTime()
}
