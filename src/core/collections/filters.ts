/*
 * Copyright (c)  Kolyada Nikita Vladimirovich <nikita.nk16@yandex.ru> 12.09.2021, 22:08
 */

export const filtersPosts = [
    { text: 'Популярные', icon: 'mdi-thumb-up-outline', filterObj: { likes: -1, creatingDate: -1 } },
    { text: 'Не популярные', icon: 'mdi-thumb-down-outline', filterObj: { likes: 1, creatingDate: -1 } },
    { text: 'Опубликованные', icon: 'mdi-upload', filterObj: { status: -1, creatingDate: -1 } },
    { text: 'Черновики', icon: 'mdi-upload-off', filterObj: { status: 1, creatingDate: -1 } },
    { text: 'Новые', icon: 'mdi-arrow-up-thick', filterObj: { creatingDate: -1 } },
    { text: 'Старые', icon: 'mdi-arrow-down-thick', filterObj: { creatingDate: 1 } },
    { text: 'Все', icon: 'mdi-filter-variant', filterObj: { creatingDate: -1 } },
]
