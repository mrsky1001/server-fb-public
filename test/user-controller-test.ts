/*
 * Copyright (©) 15.09.2021, 14:47. Kolyada Nikita Vladimirovich (nikita.nk16@yandex.ru)
 */
import {suite, test} from '@testdeck/mocha'
import * as _chai from 'chai'
import {request} from 'chai'
// @ts-ignore
import * as chaiHttp from 'chai-http'

import appService from '../src/app-service'
import roles from '../src/core/collections/roles'
import urls from '../src/app/collections/urls'
import {urlWithoutParams} from "../src/core/services/url.services";


_chai.should()
_chai.expect
_chai.use(chaiHttp)

@suite
class UserControllerTest {
    private _loginProps = {login: 'admin', password: 'test'}
    private _createUserProps = {
        username: 'test522',
        password: 'test',
        email: 'sss@gmail.com',
        role: roles.USER.value
    }

    static before() {
        appService.start()
    }

    private static _checkResponse(res): void {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('status')
        res.body.should.have.property('success')
    }

    callDeleteUser(userId, token, done) {
        const auth = `Bearer ${token}`
        const url = `${urlWithoutParams(urls.DELETE_USER_BY_ID)}/${userId}`

        request(appService.app)
            .delete(url)
            .set('Authorization', auth)
            .end((err, res) => {
                UserControllerTest._checkResponse(res)

                done()
            })
    }

    callUpdateUser(userId, token, done) {
        const auth = `Bearer ${token}`
        const url = `${urlWithoutParams(urls.UPDATE_USER_BY_ID)}/${userId}`
        const data = {username: 'tesast1210' + Math.random()}

        request(appService.app)
            .put(url)
            .set('Authorization', auth)
            .send(data)
            .end((err, res) => {
                UserControllerTest._checkResponse(res)
                res.body.should.have.property('data')
                res.body.data.should.be.a('object')
                res.body.data.should.have.property('_id')
                res.body.data.should.have.property('username')
                res.body.data.username.should.be.eq(data.username)

                this.callDeleteUser(userId, token, done)
            })
    }

    callGetUser(userId, token, done) {
        const auth = `Bearer ${token}`
        const url = `${urlWithoutParams(urls.GET_USER_BY_ID)}/${userId}`

        request(appService.app)
            .get(url)
            .set('Authorization', auth)
            .end((err, res) => {
                UserControllerTest._checkResponse(res)
                res.body.should.have.property('data')
                res.body.data.should.be.a('object')
                res.body.data.should.have.property('_id')

                this.callUpdateUser(userId, token, done)
            })
    }

    callGetUsers(userId, token, done) {
        const auth = `Bearer ${token}`

        request(appService.app)
            .get(urls.GET_USERS)
            .set('Authorization', auth)
            .end((err, res) => {
                UserControllerTest._checkResponse(res)
                res.body.should.have.property('data')
                res.body.data.should.be.a('array')

                this.callGetUser(userId, token, done)
            })
    }

    callCreateUser(token, done) {
        const auth = `Bearer ${token}`

        request(appService.app)
            .post(urls.CREATE_USER)
            .set('Authorization', auth)
            .send(this._createUserProps)
            .end((err, res) => {
                UserControllerTest._checkResponse(res)
                res.body.should.have.property('data')
                res.body.data.should.be.a('object')
                res.body.data.should.have.property('_id')

                const userId = res.body.data._id

                this.callGetUsers(userId, token, done)
            })
    }

    callLogin(done) {
        request(appService.app)
            .post(urls.LOGIN)
            .send(this._loginProps)
            .end((err, res) => {
                UserControllerTest._checkResponse(res)
                res.body.should.have.property('data')
                res.body.data.should.be.a('object')
                res.body.data.should.have.property('token')

                this.callCreateUser(res.body.data.token, done)
            })
    }

    @test 'create, get, update and delete user'(done) {
        this.callLogin(done)
    }


    static after() {
        appService.stop()
    }
}
