const fs = require('fs');
const {model, mongoose, Schema} = require("mongoose");

const posts = JSON.parse(fs.readFileSync('posts.json'));


mongoose
    .connect('mongodb://localhost/fb-db')
    .then(() => {
        console.log('Successfully connected to MongoDB Database!')
    })
    .catch((err) => {
        console.log('Database Connection Error: ', err, 'Reload MongoDB!')
    })

const Annotation = new Schema({
    text: {
        type: String,
        required: true,
    },
    imgUrl: {
        type: String,
        required: false,
    },
    keywords: [
        {
            type: String,
            required: true,
            default: '',
        },
    ],
})
const AnnotationModel = model('Annotation', Annotation)


const Post = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    urlTitle: {
        type: String,
        required: true,
        unique: true,
    },
    annotationId: {
        type: String,
        required: true,
    },
    sectionId: {
        type: String,
        required: false,
    },
    content: {
        type: String,
        required: true,
    },
    creatingDate: {
        type: Date,
        required: true,
    },
    updatingDate: {
        type: Date,
    },
    publishedDate: {
        type: Date,
    },
    authorId: {
        type: String,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
        min: 0,
    },
    likes: [
        {
            type: String,
            required: false,
            default: [],
        },
    ],
    shares: {
        type: Number,
        default: 0,
        min: 0,
    },
    countComments: {
        type: Number,
        default: 0,
        min: 0,
    },

    readTime: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    domain: {
        type: String,
        required: true,
    },
    tags: [
        {
            type: String,
            required: true,
            default: 'блог',
        },
    ],
    commentsIds: [
        {
            type: String,
            required: false,
        },
    ],
    status: {
        type: Number,
        required: true,
        max: 2,
        min: 0,
        default: 0,
    },
})

const PostModel = model('Post', Post)


const User = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: false,
    },
    lastRecaptchaDate: {
        type: Date,
        required: true,
    },
    lastLoginDate: {
        type: Date,
        required: true,
    },
    registrationDate: {
        type: Date,
        required: true,
    },
    agreeAgreement: {
        type: Boolean,
        default: false,
    },
    agreeConditions: {
        type: Boolean,
        default: false,
    },
    role: {
        type: Number,
        required: true,
        min: 0,
        max: 2,
        default: 2,
    },
})

const UserModel = model('User', User)


const Section = new Schema({
    name: {
        type: String,
        min: 2,
        max: 300,
        required: true,
    },
    text: {
        type: String,
        min: 2,
        max: 1000,
        required: true,
    },
    domain: {
        type: String,
        required: true,
    },
    creatingDate: {
        type: Date,
        required: true,
    },
})

const SectionModel = model('Section', Section)

const callUser = (post, annotation, section, domain) => {
    return new Promise((resolve, reject) => {
        UserModel.findOne({username: post.author.username}, null, null, (err, user) => {
            const newPost = {
                authorId: user._id,
                annotationId: annotation._id,
                sectionId: section._id,
                urlTitle: post.urlTitle,
                content: post.content,
                title: post.title,
                readTime: post.readTime,
                creatingDate: post.creatingDate,
                updatingDate: new Date(),
                domain: domain,
                tags: post.tags
            }

            const postForUpdate = {
                // authorId: user._id,
                // annotationId: annotation._id,
                // sectionId: section._id,
                // urlTitle: post.urlTitle,
                // content: post.content,
                // title: post.title,
                // readTime: post.readTime,
                // creatingDate: post.creatingDate,
                // updatingDate: new Date(),
                domain: domain,
                // tags: post.tags
            }

            PostModel.findOne({title: newPost.title}, null, null, (err, post) => {
                if (post && !err) {
                    PostModel.updateOne({_id: post.id}, postForUpdate, null, (err, res) => {
                        if (res && !err) {
                            console.log('Post updated! >> ' + newPost.title)
                            resolve()
                        } else {
                            console.error(err)
                            reject()
                        }
                    })
                } else {
                    PostModel.create(newPost, (err, res) => {
                        if (res && !err) {
                            console.log('Post created! >> ' + newPost.title)
                            resolve()
                        } else {
                            console.error(err)
                            reject()
                        }
                    })
                }
            })

        })
    })
}

const callAnnotation = (section, tags, domain) => {
    return new Promise((resolve, reject) => {
        tags.forEach(tag => {
            posts.filter(post => post.tags.includes(tag)).forEach(post => {
                AnnotationModel.findOne({text: post.annotation.text}, null, null, (err, annotation) => {
                    if (annotation && !err) {
                        console.log('Annotation found! >> ' + annotation.text)
                        callUser(post, annotation, section, domain).then(resolve).catch(reject)
                    } else {
                        AnnotationModel.create({text: post.annotation.text}, (err, annotation) => {
                            if (annotation && !err) {
                                console.log('Annotation created! >> ' + annotation.text)
                                callUser(post, annotation, section, domain).then(resolve).catch(reject)
                            } else {
                                console.error(err)
                                reject()
                            }
                        })
                    }
                })
            })
        })
    })

}

const startRestore = (tags, domain) => SectionModel.findOne({name: 'Сборная солянка'}, null, null, (err, section) => {
    if (section && !err) {
        callAnnotation(section, tags, domain).then()
    } else {
        SectionModel.create({name: 'Сборная солянка', text:'ss', creatingDate:new Date(), domain}, (err, section) => {
            if (section && !err) {
                callAnnotation(section, tags, domain).then()
            } else {
                console.error(err)
            }
        })

    }
})

// startRestore(['дизайн', 'искусство', 'арт', 'колористика', 'техники-графики', 'фирменный стиль'], 'design')
// startRestore(['дом','хрущевки','экономия','уют','цветы','фиалки','цветоведение', 'сталинки','смартфон', 'рукоделие'], 'home')
startRestore(['разработка'], 'dev')
// startRestore(['путешествие', 'путешествия'], 'travel')

// const devFormattedPosts = posts.filter(post => post.tags.includes('разработка')).map(post => {
//     return {authorId:mrsky1001Id,sectionId: devSectionId, content:post.content, readTime:post.readTime, tags: post.tags}
// })

// console.log(devFormattedPosts)
