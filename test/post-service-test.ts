/*
 * Copyright (©) 15.09.2021, 14:47. Kolyada Nikita Vladimirovich (nikita.nk16@yandex.ru)
 */
import {suite, test} from '@testdeck/mocha'
import * as _chai from 'chai'
// @ts-ignore
import * as chaiHttp from 'chai-http'
import {calcReadTime, strToUrlFormat} from "../src/core/services/posts-service";


_chai.should()
_chai.expect
_chai.use(chaiHttp)

@suite
class PostServiceTest {
    private _title = 'Алоха, будем тестить-все пунктуации! Ах да еще и вопрос?'
    private _content = '<h2>Итак, давайте знакомиться 😃 !</h2><p>Мы семья из Сибири, где растет черника и брусника, а также кедр с виноградом и грушей. Живем в городе рекордсмене по числу солнечных дней в году.</p><h3><span data-mention="" class="mention" data-id="mrsky1001">@mrsky1001</span></h3><p>Меня зовут Никита и я веб-программист. Разрабатываю сайты и веб-приложения, в основном для бюджетных учреждений, но иногда и для коммерческих организаций. Так же увлекаюсь монтажом видео (в основно для себя). Наш канал на → <a target="_blank" rel="noopener noreferrer nofollow" href="https://www.youtube.com/channel/UC_k_rdwbeDwf1KbMQmyK_pw/videos">YouTube</a>.</p><p>Помимо программирования я ярый поклонник сноубординга. Мы частенько наведываемся в <a target="_blank" rel="noopener noreferrer nofollow" href="https://foma-blog.ru/post/Gornaya_Shoriya_ili_samii_luchshii_gornolizhnii_kurort_Sibiri">Горную Шорию</a> чтобы насладится природой и красотами зимних пейзажем. Особенно завораживающе пребывать в горах во время снегопада.</p><p>Так же люблю делать различные штуки для дома, да бы с экономить время и улучшить быт.</p><h3><span data-mention="" class="mention" data-id="n_shurupchic">@n_shurupchic</span></h3><p>Меня зовут Анастасия, учусь в университете по профилю: «Графический дизайн», увлекаюсь <a target="_blank" rel="noopener noreferrer nofollow" href="https://foma-blog.ru/post/Analiz_zhanrovoi_fotografii_v_Rossii_i_za_rubezhom">жанровой и документальной фотографией</a>. Снимаю на соньку и яблоко. Мое портфолио → <a target="_blank" rel="noopener noreferrer nofollow" href="https://www.instagram.com/n_shurupchic/">Instagram</a>.</p><p>Нравится рукодельничать (лепить, рисовать, проектировать, вышивать, кулинарить и украшать). Мое портфолио на → <a target="_blank" rel="noopener noreferrer nofollow" href="https://www.behance.net/foma_design">behance</a>.</p><h2>Фото из наших путешествий 🤗</h2><img src.old="https://foma-blog.ru/uploads/images/mrsky1001_60d4a60518b818281599550a/60fffdc75db8bb94221dc89c/2021-07-29T07:14:04.629Z__foto4.webp" style="width:100%;" id="C0UnvU4GOzHPvsFZHl_-G" clientwidth="0" clientheight="0" naturalwidth="0" naturalheight="0" onerror="this.style.display=\'none\'"><p style="text-align: center"></p><img src.old="https://foma-blog.ru/uploads/images/mrsky1001_60d4a60518b818281599550a/60fffdc75db8bb94221dc89c/2021-08-02T06:55:16.042Z__foto4.webp" style="width:100%;" id="BQuaVwmtzpQlIbsYZ3g9V" clientwidth="0" clientheight="0" naturalwidth="0" naturalheight="0" onerror="this.style.display=\'none\'"><p style="text-align: center"><em>Горная Шория. Взгляд</em></p><p style="text-align: center"></p><img src.old="https://foma-blog.ru/uploads/images/mrsky1001_60d4a60518b818281599550a/60fffdc75db8bb94221dc89c/2021-08-02T06:55:23.638Z__DSC03143.webp" style="width:100%;" id="BQuaVwmtzpQlIbsYZ3g9V" clientwidth="0" clientheight="0" naturalwidth="0" naturalheight="0" onerror="this.style.display=\'none\'"><img src.old="https://foma-blog.ru/uploads/images/mrsky1001_60d4a60518b818281599550a/60fffdc75db8bb94221dc89c/2021-07-29T07:14:13.470Z__DSC03143.webp" style="width:100%;" id="C0UnvU4GOzHPvsFZHl_-G" clientwidth="0" clientheight="0" naturalwidth="0" naturalheight="0" onerror="this.style.display=\'none\'"><p style="text-align: center"><em>Горная Шория. Просторы</em></p><p style="text-align: center"></p><p style="text-align: center"></p>'

    @test 'title to url (urlReplacer)'(done) {
        const res = strToUrlFormat(this._title)
        res.should.eq('alokha_budem_testitvse_punktuatsii_akh_da_yeshche_i_vopros')
        done()
    }

    @test 'calc read time'(done) {
        const res = calcReadTime(this._content)
        res.should.eq(1)
        done()
    }

}
