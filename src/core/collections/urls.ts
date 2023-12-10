/*
 * Copyright (c)  Kolyada Nikita Vladimirovich <nikita.nk16@yandex.ru> 12.09.2021, 15:40
 */

import config from '../../../config/config'

export default {
    /**
     * USER
     */
    LOGIN: '/api/loginST',
    ROLES: '/api/roles',
    REGISTRATION: '/api/registration',
    LOGOUT: '/api/logout',
    DELETE_ACCOUNT: '/api/user/delete',
    IS_AUTHORIZED: '/api/is-authorized',
    GET_USER: '/api/user',
    UPDATE_USER: '/api/user',
    DELETE_USER: '/api/user',

    GET_USERS: '/api/users',
    CREATE_USER: '/api/user',
    GET_USER_BY_ID: '/api/user/:userId',
    UPDATE_USER_BY_ID: '/api/user/:userId',
    DELETE_USER_BY_ID: '/api/user/:userId',

    /**
     * POST
     */

    GET_POSTS: '/api/posts',
    GET_POSTS_BY_SECTION: '/api/posts/:section',
    GET_POSTS_BY_SECTION_ID: '/api/posts/section-id/:sectionId',
    GET_POSTS_BY_SEARCH: '/api/posts/search/:searchText',
    GET_POST_BY_ID: '/api/post-id/:postId',
    GET_POST_BY_TITLE: '/api/post/:title',
    GET_FILTERS_POSTS: '/api/post-filters',
    CREATE_POST: '/api/post',
    UPDATE_POST_BY_ID: '/api/post-id/:postId',

    SET_POST_LIKE: '/api/post-like/:postId',
    DELETE_POST_LIKE: '/api/post-like/:postId',

    SET_PHOTO_POST_LIKE: '/api/photo-post-like/:photoPostId',
    DELETE_PHOTO_POST_LIKE: '/api/photo-post-like/:photoPostId',
    UPDATE_POST_PHOTO_SIZE: '/api/photo-post-size/:photoPostId',

    UPDATE_POST_STATUS: '/api/post-status/:postId',
    ADD_POST_SHARE: '/api/post-share/:postId',

    GET_UNDEFINED: '/api/post-undefined/:urlTitle',
    /**
     * COMMENT
     */
    GET_COMMENTS: '/api/comments/:postId',
    GET_COMMENT_BY_ID: '/api/comment-id/:commentId',
    CREATE_COMMENT: '/api/comment',
    UPDATE_COMMENT_BY_ID: '/api/comment-id/:commentId',

    SET_COMMENT_LIKE: '/api/comment-like/:commentId',
    DELETE_COMMENT_LIKE: '/api/comment-like/:commentId',

    UPDATE_COMMENT_STATUS: '/api/comment-status/:commentId',

    /**
     * SECTIONS
     */
    GET_SECTIONS: '/api/sections',
    GET_SECTION_BY_ID: '/api/section-id/:sectionId',
    CREATE_SECTION: '/api/section',
    UPDATE_SECTION_BY_ID: '/api/section-id/:sectionId',

    /**
     * DOMAINS
     */
    GET_DOMAINS: '/api/domains',
    GET_DOMAIN_BY_ID: '/api/domain-id/:domainId',
    CREATE_DOMAIN: '/api/domain',
    UPDATE_DOMAIN_BY_ID: '/api/domain-id/:domainId',

    /**
     * PRODUCT
     */
    GET_ALL_PRODUCTS: '/api/product',
    GET_PRODUCT_BY_ID: '/api/product-id/:postId',
    GET_PRODUCT_BY_TITLE: '/api/product/:title',
    CREATE_PRODUCT: '/api/product',
    UPDATE_PRODUCT_BY_ID: '/api/product-id/:productId',

    /**
     * IMGS
     */

    GET_IMGS: '/api/imgs/:postId',
    GET_IMG: `/api/${config.paths.imgs}/*`,
    GET_IMG_OLD: `/${config.paths.imgs}/*`,

    UPLOAD_PRODUCT_IMG: '/api/product-img',
    DELETE_PRODUCT_IMG: '/api/product-img',

    UPLOAD_POST_IMG: '/api/post-img',
    DELETE_POST_IMG: '/api/post-img',

    UPLOAD_AVATAR_IMG: '/api/avatar-img',
    DELETE_AVATAR_IMG: '/api/avatar-img',

    /**
     * Emails
     */
    POST_EMAIL: '/api/email',
}
