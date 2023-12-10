/*
 * Copyright (©) 22.09.2021, 11:14. Kolyada Nikita Vladimirovich (nikita.nk16@yandex.ru)
 */

//
// const getSectionSitemap = (): Promise<string> => {
//     return new Promise<string>((resolve, reject) => {
//         let data = `<?xml version="1.0" encoding="UTF-8"?>
//         <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`
//         const date = new Date().toISOString()
//
//         const insertToSitemap = (section: string) => {
//             data += `
//                        <url>
//                           <loc>https://www.foma-blog.ru${section}</loc>
//                           <lastmod>${date}</lastmod>
//                           <changefreq>monthly</changefreq>
//                           <priority>0.5</priority>
//                        </url>
//                       `
//         }
//
//         readLinesFile(config.paths.routes)
//             .then((lines) => {
//                 const regexp = new RegExp(/\/\w+/)
//                 let section = null
//
//                 lines.forEach((line) => {
//                     if (line.includes('path:')) {
//                         section = regexp.exec(line) ? regexp.exec(line)[0] : null
//                     } else if (section && line.includes('isSection: true')) {
//                         insertToSitemap(section)
//                     }
//                 })
//
//                 resolve(data)
//             })
//             .catch((err) => {
//                 logError(exceptions.SITEMAP_GENERATE_SECTION_ERROR, err.stack)
//                 reject(err)
//             })
//     })
// }
// const copySitemapToSite = () => {
//     return new Promise<void>((resolve, reject) => {
//         const source = config.paths.sitemap
//         const destination = `${config.paths.prodSite}/sitemap.xml`
//
//         fs.copyFile(source, destination, (err) => {
//             if (!err) {
//                 logInfo(exceptions.SITEMAP_COPIED)
//             } else {
//                 reject(err)
//                 logError(exceptions.SITEMAP_COPIED_ERROR, err.stack)
//             }
//         })
//     })
// }
//
// const writeSitemapToFile = (data) => {
//     return new Promise<void>((resolve, reject) => {
//         const source = config.paths.sitemap
//
//         fs.writeFile(source, data, (err) => {
//             if (!err) {
//                 logInfo(exceptions.SITEMAP_SAVED)
//                 copySitemapToSite()
//                     .then(() => resolve())
//                     .catch((err) => reject(err))
//             } else {
//                 logError(exceptions.SITEMAP_SAVED_ERROR)
//                 reject(err)
//             }
//         })
//     })
// }
//
// export const createSitemap = (): Promise<void> => {
//     return new Promise<void>((resolve, reject) => {
//         const filter = { status: 2 }
//         const projection = { urlTitle: 1, publishedDate: 1 }
//         let data: string = null
//
//         const insertToSitemap = (post: IPost) => {
//             data += `
//                         <url>
//                             <loc>https://www.foma-blog.ru/post/${post.urlTitle}</loc>
//                             <lastmod>${String(post.publishedDate) ?? new Date().toISOString()}</lastmod>
//                             <changefreq>monthly</changefreq>
//                             <priority>0.5</priority>
//                         </url>
//         `
//         }
//
//         //     getSectionSitemap()
//         //         .then((sections) => {
//         //             data = sections
//         //
//         //             findPosts(filter, projection)
//         //                 .then((posts) => {
//         //                     posts.forEach((post) => insertToSitemap(post))
//         //                     data += '</urlset>'
//         //
//         //                     writeSitemapToFile(data)
//         //                         .then(() => resolve())
//         //                         .catch((err) => reject(err))
//         //                 })
//         //                 .catch((err) => {
//         //                     reject(err)
//         //                 })
//         //         })
//         //         .catch((err) => reject(err))
//     })
// }
