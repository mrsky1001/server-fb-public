// /*
//  * Copyright (c)  Kolyada Nikita Vladimirovich <nikita.nk16@yandex.ru> 12.09.2021, 21:28
//  */
//
// import { IBase } from '../models/interfaces/IBase'
//
// export const setSchemaProps = <TRaw, T extends IBase>(rawObj: TRaw, obj: T): void => {
//     const schemaPropNames = Object.keys(rawObj)
//     const rawPropNames = Object.keys(rawObj)
//
//     delete obj._id
//
//     schemaProps.forEach((prop) => {
//         if (rawProps.includes(prop) && !serverDataProps.includes(prop)) {
//             obj[prop] = typeof rawObj[prop] === 'string' ? String(rawObj[prop]).trim() : rawObj[prop]
//         }
//     })
// }
