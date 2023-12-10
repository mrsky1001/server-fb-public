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
import {urlWithoutParams} from '../src/core/services/url.services'
import AnnotationModel, {IAnnotation} from '../src/core/models/schemes/annotation.schema'
import PostModel, {IPost} from '../src/core/models/schemes/post.schema'

_chai.should()
_chai.expect
_chai.use(chaiHttp)

@suite
class PostControllerTest {
    private _loginProps = {login: 'test', password: 'test'}
    private _annotation: IAnnotation = new AnnotationModel({
        text: 'Решение проблемы с обязательным использованием then и ca',
        imgUrl: 'https://foma-blog.ru/uploads/images/mrsky1001_60d4a60518b818281599550a/61514d575d70216db63582a0/2021_09_27T04_54_08_372Z__1_png.webp',
        imgAuthor: '',
        keywords: ['блог', 'разработка'],
    })

    private _createPostProps: IPost = new PostModel({
        annotation: this._annotation,
        content:
            '<h2>TypeScript. Решение проблемы с обязательным использованием then и catch?</h2><p>Часто при разработке приложений возникает проблема обязательного использования <code>then</code> и <code>catch</code>. </p><blockquote><p>Пример предупреждения которое выводит <strong>ESLint</strong>:</p><p>ESLint: Promises must be handled appropriately or explicitly marked as ignored with the <code>void</code> operator.(@typescript-eslint/no-floating-promises)</p></blockquote><p>Допустим у нас есть асинхронная функция <code>async kar()</code>, которая печатает слово <code>Kar!</code>, и синхронная функция <code>raven()</code>. </p><p>Если мы просто вызовем нашу функцию <code>kar()</code>, то получим предупреждение  от<code>ESLint’a</code>.</p><pre><code class="language-typescript language-typescript" data="code-block">const kar = async () =&gt; {\n  return \'Kar!\'\n}\n\nconst raven = () =&gt; {\n  kar()\n  /** ESLint: Promises must be handled appropriately or explicitly marked as ignored with the void operator.(@typescript-eslint/no-floating-promises) **/\n}</code></pre><p><code>ESLint’a</code> говорит нам, что необходимо обработать присланные “обещания”, а точнее всем знакомые функции <code>then</code> и <code>catch</code>.</p><p>Можно было бы поставить перед функцией <strong>await</strong>, но тогда пришлось бы делать функцию <code>raven()</code> асинхронной.</p><p>Но если мы точнее переведем предупреждение <code>ESLint’a</code>, то ответ на наш вопрос кроется в <code>void</code> операторе перед вызовом функции.</p><pre><code class="language-typescript language-typescript language-typescript language-typescript" data="code-block">const kar = async () =&gt; {\n  return \'Kar!\'\n}\n\nconst raven = () =&gt; {\n  void kar()\n}</code></pre>',
        tags: ['блог', 'разработка', 'nodejs', 'stop', 'close', 'app', 'express', 'connection'],
        title: 'Как закр s нsа NodsessxJS_2?' + Math.random(),
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

    private static _checkErrorResponse(res): void {
        res.body.should.be.a('object')
        res.body.should.have.property('status')
        res.body.should.have.property('success')
        res.body.success.should.be.eq(false)
    }

    @test 'get all posts'(done) {
        request(appService.app)
            .get(urls.GET_ALL_POSTS)
            .end((err, res) => {
                PostControllerTest._checkResponse(res)
                res.body.should.have.property('data')
                res.body.data.should.be.a('array')
                done()
            })
    }

    @test 'get posts with section'(done) {
        request(appService.app)
            .get(urlWithoutParams(urls.GET_POSTS_BY_SECTION) + '/dev')
            .end((err, res) => {
                PostControllerTest._checkResponse(res)
                res.body.should.have.property('data')
                res.body.data.should.be.a('array')
                done()
            })
    }

    callDeletePost(postId, token, done) {
        const url = `${urlWithoutParams(urls.UPDATE_POST_BY_ID)}/${postId}`
        const auth = `Bearer ${token}`

        request(appService.app)
            .delete(url)
            .set('Authorization', auth)
            .send(this._createPostProps)
            .end((err, res) => {
                PostControllerTest._checkResponse(res)
                done()
            })
    }

    callUpdatePost(postId, token, done) {
        const url = `${urlWithoutParams(urls.UPDATE_POST_BY_ID)}/${postId}`
        const auth = `Bearer ${token}`

        request(appService.app)
            .put(url)
            .set('Authorization', auth)
            .send(this._createPostProps)
            .end((err, res) => {
                PostControllerTest._checkResponse(res)
                res.body.should.have.property('data')
                res.body.data.should.be.a('object')
                res.body.data.should.have.property('_id')

                this.callDeletePost(postId, token, done)
            })
    }

    callGetPost(postId, token, done) {
        const url = `${urlWithoutParams(urls.GET_POST_BY_ID)}/${postId}`

        request(appService.app)
            .get(url)
            .end((err, res) => {
                PostControllerTest._checkErrorResponse(res)

                this.callUpdatePost(postId, token, done)
            })
    }

    callGetPostByTitle(postId, urlTitle, token, done) {
        const url = `${urlWithoutParams(urls.GET_POST_BY_TITLE)}/${urlTitle}`
        const auth = `Bearer ${token}`

        request(appService.app)
            .get(url)
            .set('Authorization', auth)
            .end((err, res) => {
                PostControllerTest._checkResponse(res)
                res.body.should.have.property('data')
                res.body.data.should.be.a('object')
                res.body.data.should.have.property('_id')

                this.callGetPost(postId, token, done)
            })
    }

    callCreatePost(token, done) {
        const auth = `Bearer ${token}`

        request(appService.app)
            .post(urls.CREATE_POST)
            .set('Authorization', auth)
            .send(this._createPostProps)
            .end((err, res) => {
                PostControllerTest._checkResponse(res)
                res.body.should.have.property('data')
                res.body.data.should.be.a('object')
                res.body.data.should.have.property('_id')

                const postId = res.body.data._id
                const urlTitle = res.body.data.urlTitle

                this.callGetPostByTitle(postId, urlTitle, token, done)
            })
    }

    callLogin(done) {
        request(appService.app)
            .post(urls.LOGIN)
            .send(this._loginProps)
            .end((err, res) => {
                PostControllerTest._checkResponse(res)
                res.body.data.should.have.property('token')

                this.callCreatePost(res.body.data.token, done)
            })
    }

    @test 'create post, get, update and delete'(done) {
        this.callLogin(done)
    }

    static after() {
        appService.stop()
    }
}
