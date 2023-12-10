/*
 * Copyright (©) 15.09.2021, 14:47. Kolyada Nikita Vladimirovich (nikita.nk16@yandex.ru)
 */
import {suite, test} from '@testdeck/mocha'
import * as _chai from 'chai'
import {request} from 'chai'
// @ts-ignore
import * as chaiHttp from 'chai-http'

import appService from '../src/app-service'
import {IUser} from '../src/core/models/schemes/user.schema'
import roles from '../src/core/collections/roles'
import urls from '../src/app/collections/urls'


_chai.should()
_chai.expect
_chai.use(chaiHttp)

@suite
class AuthControllerTest {
    private _loginProps = {login: 'admin', password: 'test'}
    private _testLoginProps = {login: 'test3', password: 'test'}
    private _regProps: IUser = {
        username: 'test3',
        password: 'test',
        email: 'foma3.blog@yandex.ru',
        role: roles.EDITOR.value
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

    private static _callLogin(res, callback): void {
        AuthControllerTest._checkResponse(res)
        res.body.should.have.property('data')
        res.body.data.should.be.a('object')
        res.body.data.should.have.property('token')
        res.body.data.token.should.be.a('string')
        callback()
    }

    @test login(done) {
        request(appService.app)
            .post(urls.LOGIN)
            .send(this._loginProps)
            .end((err, res) => {
                AuthControllerTest._callLogin(res, () => done())
            })
    }

    @test registration(done) {
        request(appService.app)
            .post(urls.LOGIN)
            .send(this._loginProps)
            .end((err, res) => {
                AuthControllerTest._callLogin(res, () => {
                    request(appService.app)
                        .post(urls.REGISTRATION)
                        .set('Authorization', `Bearer ${res.body.data.token}`)
                        .send(this._regProps)
                        .end((err, res) => {
                            AuthControllerTest._checkResponse(res)
                            done()
                        })
                })
            })
    }

    @test 'delete account'(done) {
        request(appService.app)
            .post(urls.LOGIN)
            .send(this._testLoginProps)
            .end((err, res) => {
                AuthControllerTest._callLogin(res, () => {
                    request(appService.app)
                        .delete(urls.DELETE_USER)
                        .set('Authorization', `Bearer ${res.body.data.token}`)
                        .end((err, res) => {
                            AuthControllerTest._checkResponse(res)
                            done()
                        })
                })
            })
    }

    @test 'get roles'(done) {
        request(appService.app)
            .get(urls.ROLES)
            .end((err, res) => {
                AuthControllerTest._checkResponse(res)
                res.body.should.have.property('data')
                res.body.data.should.be.a('array')
                done()
            })
    }

    static after() {
        appService.stop()
    }
}
