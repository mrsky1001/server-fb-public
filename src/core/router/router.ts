/*
 * Copyright (c) 22.11.2021, 18:46  Kolyada Nikita Vladimirovich nikita.nk16@yandex.ru
 */

/*
 * Copyright (c)  Kolyada Nikita Vladimirovich <nikita.nk16@yandex.ru> 12.09.2021, 15:35
 */

import { Router } from 'express'
import { isAuthorized, login, logout, registration } from '../controllers/auth.controller'
import * as core from 'express-serve-static-core'
import {
    addLikePost,
    addPost,
    addSharePost,
    changePostData,
    changeStatusPost,
    getFiltersPosts,
    getPost,
    getPostByTitle,
    getPosts,
    getUrlForUndefinedPost,
    removeLikePost,
    removePost,
} from '../controllers/posts.controller'
import roles from '../../core/collections/roles'
import { getAllImages, getImg, removeAvatarImg, removeImg, uploadImg } from '../controllers/img.controller'
import {
    addProduct,
    changeProduct,
    getProduct,
    getProductByTitle,
    getProducts,
    removeProduct,
} from '../controllers/product.controller'
import {
    addUser,
    changeUser,
    changeUserById,
    getUser,
    getUserById,
    getUsers,
    removeUser,
    removeUserById,
} from '../controllers/user.controller'
import { postMulter, userMulter } from '../lib/multer.lib'
import urls from '../../app/collections/urls'
import { IMethod } from '../models/interfaces/IMethod'
import {
    addComment,
    changeCommentData,
    changeStatusComment,
    getComment,
    getComments,
    removeComment,
} from '../controllers/comments.controller'
import cnsts from '../collections/constants'
import { authMW, recaptchaMW, roleMW } from '../middleware/authMW'
import { addSection, changeSectionData, getSection, getSections, removeSection } from '../controllers/sections.controller'
import { postEmail } from '../controllers/email.controller'
import { addLikePhotoPost, changeSizePhotoPost, removeLikePhotoPost } from '../controllers/photo-posts.controller'
import { addDomain, changeDomainData, getDomain, getDomains, removeDomain } from '../controllers/domains.controller'

class RouterService {
    router: core.Router

    constructor(...initMethods: IMethod[]) {
        this.router = Router()
        this._initRoutes(initMethods)
    }

    private _initRoutes(initMethods: IMethod[]): void {
        /**
         * Account
         */
        this.router.post(urls.LOGIN, recaptchaMW(), login)
        this.router.post(urls.REGISTRATION, recaptchaMW(), registration)
        this.router.post(urls.LOGOUT, authMW, logout)
        // this.router.get(urls.ROLES, getUserRoles)
        this.router.get(urls.IS_AUTHORIZED, isAuthorized)
        this.router.get(urls.GET_USER, authMW, getUser)
        this.router.put(urls.UPDATE_USER, authMW, recaptchaMW(), changeUser)
        this.router.delete(urls.DELETE_USER, authMW, recaptchaMW(), removeUser)

        /**
         * User
         */
        this.router.post(urls.CREATE_USER, roleMW(roles.ADMIN), addUser)
        this.router.get(urls.GET_USERS, roleMW(roles.ADMIN), getUsers)
        this.router.get(urls.GET_USER_BY_ID, roleMW(roles.ADMIN), getUserById)
        this.router.put(urls.UPDATE_USER_BY_ID, roleMW(roles.ADMIN), changeUserById)
        this.router.delete(urls.DELETE_USER_BY_ID, roleMW(roles.ADMIN), removeUserById)

        /**
         * Posts
         */
        this.router.get(urls.GET_POSTS, getPosts)
        this.router.get(urls.GET_POSTS_BY_SECTION_ID, getPosts)
        this.router.get(urls.GET_POST_BY_ID, getPost)
        this.router.get(urls.GET_POST_BY_TITLE, getPostByTitle)
        this.router.get(urls.GET_FILTERS_POSTS, getFiltersPosts)
        this.router.post(urls.CREATE_POST, roleMW(roles.EDITOR), addPost)
        this.router.put(urls.UPDATE_POST_BY_ID, roleMW(roles.EDITOR), changePostData)

        this.router.delete(urls.UPDATE_POST_BY_ID, roleMW(roles.EDITOR), removePost)
        this.router.put(urls.UPDATE_POST_STATUS, roleMW(roles.EDITOR), changeStatusPost)
        this.router.post(urls.ADD_POST_SHARE, addSharePost)
        this.router.get(urls.GET_UNDEFINED, getUrlForUndefinedPost)

        this.router.post(urls.SET_PHOTO_POST_LIKE, roleMW(roles.USER), addLikePhotoPost)
        this.router.delete(urls.DELETE_PHOTO_POST_LIKE, roleMW(roles.USER), removeLikePhotoPost)
        this.router.put(urls.UPDATE_POST_PHOTO_SIZE, roleMW(roles.EDITOR), changeSizePhotoPost)

        /**
         * Like post
         */
        this.router.post(urls.SET_POST_LIKE, roleMW(roles.USER), addLikePost)
        this.router.delete(urls.DELETE_POST_LIKE, roleMW(roles.USER), removeLikePost)

        /**
         * COMMENTS
         */
        this.router.get(urls.GET_COMMENTS, getComments)
        this.router.get(urls.GET_COMMENT_BY_ID, getComment)
        this.router.post(urls.CREATE_COMMENT, recaptchaMW(cnsts.RECAPTCHA_COMMENT_LIMIT), roleMW(roles.USER), addComment)
        this.router.put(urls.UPDATE_COMMENT_BY_ID, roleMW(roles.USER), changeCommentData)
        this.router.delete(urls.UPDATE_COMMENT_BY_ID, roleMW(roles.USER), removeComment)
        this.router.post(urls.UPDATE_COMMENT_STATUS, roleMW(roles.USER), changeStatusComment)

        /**
         * Like comment
         */
        this.router.post(urls.SET_COMMENT_LIKE, roleMW(roles.USER), addLikePost)
        this.router.delete(urls.DELETE_COMMENT_LIKE, roleMW(roles.USER), removeLikePost)

        /**
         * SECTIONS
         */
        this.router.get(urls.GET_SECTIONS, getSections)
        this.router.get(urls.GET_SECTION_BY_ID, getSection)
        this.router.post(urls.CREATE_SECTION, roleMW(roles.EDITOR), addSection)
        this.router.put(urls.UPDATE_SECTION_BY_ID, roleMW(roles.EDITOR), changeSectionData)
        this.router.delete(urls.UPDATE_SECTION_BY_ID, roleMW(roles.EDITOR), removeSection)

        /**
         * DOMAINS
         */
        this.router.get(urls.GET_DOMAINS, getDomains)
        this.router.get(urls.GET_DOMAIN_BY_ID, getDomain)
        this.router.post(urls.CREATE_DOMAIN, roleMW(roles.ADMIN), addDomain)
        this.router.put(urls.UPDATE_DOMAIN_BY_ID, roleMW(roles.ADMIN), changeDomainData)
        this.router.delete(urls.UPDATE_DOMAIN_BY_ID, roleMW(roles.ADMIN), removeDomain)

        /**
         * Product
         */
        this.router.get(urls.GET_ALL_PRODUCTS, getProducts)
        this.router.get(urls.GET_PRODUCT_BY_ID, getProduct)
        this.router.get(urls.GET_PRODUCT_BY_TITLE, getProductByTitle)
        this.router.post(urls.CREATE_PRODUCT, roleMW(roles.EDITOR), addProduct)
        this.router.put(urls.UPDATE_PRODUCT_BY_ID, roleMW(roles.EDITOR), changeProduct)
        this.router.delete(urls.UPDATE_PRODUCT_BY_ID, roleMW(roles.EDITOR), removeProduct)

        /**
         * Images
         */
        this.router.get(urls.GET_IMG, getImg)
        this.router.get(urls.GET_IMG_OLD, getImg)
        this.router.get(urls.GET_IMGS, getAllImages)

        this.router.post(urls.UPLOAD_AVATAR_IMG, roleMW(roles.USER), userMulter.single('image'), uploadImg)
        this.router.post(urls.UPLOAD_POST_IMG, roleMW(roles.EDITOR), postMulter.single('image'), uploadImg)
        this.router.post(urls.UPLOAD_PRODUCT_IMG, roleMW(roles.EDITOR), postMulter.single('image'), uploadImg)

        this.router.delete(urls.DELETE_AVATAR_IMG, roleMW(roles.USER), removeAvatarImg)
        this.router.delete(urls.DELETE_POST_IMG, roleMW(roles.EDITOR), removeImg)
        this.router.delete(urls.DELETE_PRODUCT_IMG, roleMW(roles.EDITOR), removeImg)

        initMethods.forEach((m) => {
            const role = m.role ? roleMW(m.role) : undefined
            this.router[m.type](m.url, role, m.callback)
        })

        /**
         * Emails
         */

        this.router.post(urls.POST_EMAIL, recaptchaMW(cnsts.RECAPTCHA_COMMENT_LIMIT), postEmail)
    }
}

export default RouterService
