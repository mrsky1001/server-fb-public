/*
 * Copyright (©) 15.09.2021, 14:47. Kolyada Nikita Vladimirovich (nikita.nk16@yandex.ru)
 */
import {suite, test} from '@testdeck/mocha'
import * as _chai from 'chai'
import {request} from 'chai'
// @ts-ignore
import * as chaiHttp from 'chai-http'

import appService from '../src/app-service'
import urls from '../src/app/collections/urls'
import AnnotationModel, {IAnnotation} from '../src/core/models/schemes/annotation.schema'
import PostModel, {IPost} from '../src/core/models/schemes/post.schema'
import {urlWithoutParams} from '../src/core/services/url.services'

_chai.should()
_chai.expect
_chai.use(chaiHttp)

@suite
class ImgControllerTest {
    private _pathToImg = '/home/mrsky1001/devel/github/mevn-blog/server/test/Снимок экрана от 2021-07-16 10-49-27.png'
    private _loginProps = {login: 'test', password: 'test'}
    private _annotation: IAnnotation = new AnnotationModel({
        text: 'Решение',
        keywords: ['блог'],
    })

    private _createPostProps: IPost = new PostModel({
        annotation: this._annotation,
        content: 'content',
        tags: ['блог'],
        title: 'Testsssssssssssssssы' + Math.random(),
    })

    static before() {
        appService.start()
    }

    private static _checkResponse(res): void {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('status')
        res.body.should.have.property('success')
    }

    callDeletePost(postId, token, done) {
        const url = `${urlWithoutParams(urls.UPDATE_POST_BY_ID)}/${postId}`
        const auth = `Bearer ${token}`

        request(appService.app)
            .delete(url)
            .set('Authorization', auth)
            .send(this._createPostProps)
            .end((err, res) => {
                ImgControllerTest._checkResponse(res)
                done()
            })
    }


    callDeleteImg(postId, imgUrl, token, done) {
        const auth = `Bearer ${token}`

        request(appService.app)
            .delete(urls.DELETE_IMG)
            .set('Authorization', auth)
            .send({postId, imgUrl})
            .end((err, res) => {
                ImgControllerTest._checkResponse(res)

                this.callDeletePost(postId, token, done)
            })
    }

    callUploadImg(postId, token, done) {
        const auth = `Bearer ${token}`

        request(appService.app)
            .post(urls.UPLOAD_POST_IMG)
            .set('Authorization', auth)
            .field({postId: postId})
            .attach('image', this._pathToImg)
            .end((err, res) => {
                ImgControllerTest._checkResponse(res)
                res.body.should.have.property('data')
                res.body.data.should.be.a('object')
                res.body.data.should.have.property('imgUrl')

                this.callDeleteImg(postId, res.body.data.imgUrl, token, done)
            })
    }

    callCreatePost(token, done) {
        const auth = `Bearer ${token}`

        request(appService.app)
            .post(urls.CREATE_POST)
            .set('Authorization', auth)
            .send(this._createPostProps)
            .end((err, res) => {
                ImgControllerTest._checkResponse(res)
                res.body.should.have.property('data')
                res.body.data.should.be.a('object')
                res.body.data.should.have.property('_id')

                const postId = res.body.data._id

                this.callUploadImg(postId, token, done)
            })
    }

    callLogin(done) {
        request(appService.app)
            .post(urls.LOGIN)
            .send(this._loginProps)
            .end((err, res) => {
                ImgControllerTest._checkResponse(res)
                res.body.data.should.have.property('token')

                this.callCreatePost(res.body.data.token, done)
            })
    }

    @test 'upload img'(done) {
        this.callLogin(done)
    }

    static after() {
        appService.stop()
    }
}
