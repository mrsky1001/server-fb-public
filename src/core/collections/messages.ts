/*
 * Copyright (©) 09.07.2021, 17:13. Kolyada Nikita Vladimirovich (nikita.nk16@yandex.ru)
 */

export default {
    /**
     * USER
     */

    ERROR_USERNAME_IS_EXISTING: 'Пользователь с таким именем или e-mail уже существует! ',
    USER_HAS_REGISTERED: 'Пользователь успешно зарегистрирован! ',
    UPDATE_USER_ERROR: 'Ошибка обновления данных пользователя! ',
    USER_HAS_UPDATED: 'Данные пользователя успешно обновлены! ',
    USER_HAS_FOUND: 'Пользователь успешно найден! ',
    USER_NOT_FOUND: 'Пользователь не найден! ',
    USERS_HAS_FOUND: 'Пользователи успешно найден! ',
    USERS_NOT_FOUND: 'Пользователи не найдены! ',
    USER_HAS_AUTHORIZED: 'Пользователь успешно авторизован! ',
    INCORRECT_LOGIN_PARAMS: 'Некорректные параметры входа! ',
    USER_DELETED: 'Пользователь успешно удален!',
    USER_LOGOUT: 'Операция выполнена успешно!',
    LOGOUT_ERROR: 'Ошибка выхода!',

    ROLES_LOADED: 'Роли успешно загружены! ',
    ROLES_NOT_LOADED: 'Роли не загружены! ',

    INCORRECT_USERNAME_LENGTH: 'Имя пользователя должно быть не менее 3 и не более 20 символов! ',
    INCORRECT_PASSWORD_LENGTH: 'Пароль должен быть не менее 8 и не более 20 символов! ',
    INCORRECT_EMAIL: 'Не корректный e-mail! ',
    ROLE_NOT_FOUND: 'Роль не найдена в списке доступных! ',
    GET_USER_ERROR: 'Ошибка при поиске пользователя! ',
    GET_USERS_ERROR: 'Ошибка при поиске пользователей! ',

    REGISTRATION_ERROR: 'Ошибка регистрации! ',
    USER_NOT_AGREEMENT: 'Ошибка регистрации! Пользователь не указал согласия с условиями.',
    USER_NOT_AUTHORIZED: 'Пользователь не авторизован!',
    RECAPTCHA_NOT_PASS: 'Не пройдена проверка на робота!',
    RECAPTCHA_CHECKING_ERROR: 'Ошибка при проверке на робота!',
    USER_DELETED_ERROR: 'Ошибка удаления аккаунта!',
    NOT_ALLOWED: 'Нет доступа!',
    NOT_ALLOWED_SECTION_DELETE: 'Нет доступа для удаления разделов других авторов!',

    LOGIN_ERROR: 'Ошибка входа! ',
    CHECK_AUTH_ERROR: 'Ошибка проверки авторизации! ',
    CHECK_AUTH: 'Проверки авторизации выполнена успешно! ',
    /**
     * IMAGES
     */
    IMG_DELETED: 'Изображение успешно удалено! ',
    IMG_NOT_DELETED: 'Изображение не было удалено! ',

    IMG_FOUND: 'Изображение найдено! ',
    IMG_NOT_FOUND: 'Изображение не найдено! ',

    IMAGES_FOUND: 'Изображения найдены! ',

    IMG_SAVED: 'Изображение успешно сохранено! ',
    IMG_NOT_SAVED: 'Изображение не сохранено! ',

    GET_IMG_ERROR: 'Ошибка при запросе на получение изображения!',
    GET_ALL_IMG_ERROR: 'Ошибка при запросе получения всех изображений!',
    UPLOAD_IMG_ERROR: 'Ошибка при запросе на загрузку изображения!',
    DELETE_IMG_ERROR: 'Ошибка при запросе на удаления изображения!',
    DELETE_AVATAR_IMG_ERROR: 'Ошибка при запросе на удаления изображения пользователя!',

    /**
     * DATA
     */

    DATA_FOUNDED: 'Данные найдены!',
    DATA_NOT_FOUNDED: 'Данные не найдены!',
    /**
     * PRODUCT
     */
    PRODUCT_DELETED: 'Товар успешно удален! ',
    PRODUCT_NOT_DELETED: 'Товар не удален! ',
    PRODUCT_ANNOTATION_NOT_DELETED: 'Аннотация товар не удален! ',

    PRODUCT_UPDATED: 'Товар успешно обновлен! ',
    PRODUCT_NOT_UPDATED: 'Товар не был обновлен! ',

    PRODUCT_CREATED: 'Товар успешно создан! ',
    PRODUCT_NOT_CREATED: 'Товар не создан! ',
    PRODUCT_ANNOTATION_NOT_CREATED: 'Аннотация товара не создана! ',

    PRODUCT_FOUND: 'Информация о товаре успешно найдена! ',
    PRODUCT_NOT_FOUND: 'Информация о товаре не найдена! ',
    PRODUCT_ANNOTATION_NOT_FOUND: 'Аннотация товара не найдена! ',

    PRODUCTS_LOADED: 'Товары успешно загружены! ',
    PRODUCTS_NOT_LOADED: 'Товары не загружены! ',

    GET_PRODUCT_ERROR: 'Ошибка при запросе на получение товара!',
    GET_ALL_PRODUCTS_ERROR: 'Ошибка при запросе на получение всех товаров!',
    CREATE_PRODUCT_ERROR: 'Ошибка при запросе на создание товара!',
    UPDATE_PRODUCT_ERROR: 'Ошибка при запросе на обновление товара!',
    DUPLICATE_PRODUCT_ANNOTATION: 'Ошибка, аннотация товара с таким заголовком уже существует!',
    UPDATE_PRODUCT_ANNOTATION_ERROR: 'Ошибка при запросе на обновление аннотации товара!',
    UPDATE_STATUS_PRODUCT_ERROR: 'Ошибка при запросе на обновление статуса товара!',
    DELETE_PRODUCT_ERROR: 'Ошибка при запросе на удаление товара!',
    DUPLICATE_PRODUCT: 'Ошибка, товар с таким заголовком уже существует!',
    /**
     * POSTS
     */

    POST_DELETED: 'Статья успешно удалена! ',
    POST_NOT_DELETED: 'Статья не удалена! ',
    POST_ANNOTATION_NOT_DELETED: 'Аннотация статьи не удалена! ',
    POST_PHOTOS_NOT_DELETED: 'Фотографии статьи не удалены! ',

    POST_UPDATED: 'Статья успешно обновлена! ',
    PHOTO_POST_UPDATED: 'Фото-статья успешно обновлена! ',
    POST_NOT_UPDATED: 'Статья не была обновлена! ',

    POST_CREATED: 'Статья успешно создана! ',
    POST_NOT_CREATED: 'Статья не создана! ',
    POST_ANNOTATION_NOT_CREATED: 'Аннотация статьи не создана! ',

    POST_FOUND: 'Статья успешно найдена! ',
    POST_NOT_FOUND: 'Статья не найдена! ',
    PHOTO_POST_NOT_FOUND: 'Фото статьи не найдено! ',
    POST_ANNOTATION_NOT_FOUND: 'Аннотация статьи не найдена! ',

    POSTS_LOADED: 'Статьи успешно загружены! ',
    POSTS_NOT_LOADED: 'Статьи не загружены! ',

    GET_FILTER_POSTS_ERROR: 'Ошибка при запросе на получение фильтра статей!',
    FILTER_POSTS_LOADED: 'Фильтр статей успешно загружен!',
    FILTER_POSTS_NOT_LOADED: 'Фильтр статей не загружен!',

    GET_POST_ERROR: 'Ошибка при запросе на получение статьи!',
    GET_ALL_POSTS_ERROR: 'Ошибка при запросе на получение всех статей!',
    CREATE_POST_ERROR: 'Ошибка при запросе на создание статьи!',
    UPDATE_POST_ERROR: 'Ошибка при запросе на обновление статьи!',
    UPDATE_PHOTO_POST_ERROR: 'Ошибка при запросе на обновление фото-статьи!',
    UPDATE_POST_ANNOTATION_ERROR: 'Ошибка при запросе на обновление аннотации статьи!',
    NOTHING_TO_UPDATE: 'Внимание! Нечего обновлять!',
    UPDATE_STATUS_POST_ERROR: 'Ошибка при запросе на обновление статуса статьи!',
    UPDATE_SIZE_PHOTO_POST_ERROR: 'Ошибка при запросе на обновление размера фото статьи!',
    DELETE_POST_ERROR: 'Ошибка при запросе на удаление статьи!',
    DELETE_PHOTO_POST_ERROR: 'Ошибка при запросе на удаление фото из статьи!',
    DUPLICATE_POST: 'Ошибка, статья с таким заголовком уже существует!',
    DUPLICATE_POST_ANNOTATION: 'Ошибка, статья с таким заголовком уже существует!',

    LIKE_UPDATED: 'Операция обновления параметра "Мне нравится" выполнена успешно!',
    UPDATE_LIKE_ERROR: 'Ошибка при запросе на обновление параметра "Мне нравится"!',
    UPDATE_SHARE_POST_ERROR: 'Ошибка при запросе на обновление параметра "Поделиться"!',

    DEFINE_POST_ERROR: 'Ошибка при запросе на определениеи статьи к секции!',
    DEFINE_POST_NOT_FOUND: 'Статья с таким адресом не найдена для определения! ',
    DEFINE_POST_FOUND: 'Статья успешно определена! ',
    DEFINE_POST_SECTION_FOUND: 'Раздел для определения статьи не найден!',

    /**
     * COMMENT
     */
    GET_COMMENT_ERROR: 'Ошибка при запросе на получение комментария!',
    GET_ALL_COMMENTS_ERROR: 'Ошибка при запросе на получение всех комментариев!',
    CREATE_COMMENT_ERROR: 'Ошибка при запросе на создание комментария!',
    UPDATE_COMMENT_ERROR: 'Ошибка при запросе на обновление комментария!',
    UPDATE_STATUS_COMMENT_ERROR: 'Ошибка при запросе на обновление статуса комментария!',
    DELETE_COMMENT_ERROR: 'Ошибка при запросе на удаление комментария!',

    COMMENTS_LOADED: 'Комментарии успешно загружены! ',
    COMMENTS_NOT_LOADED: 'Комментарии не загружены! ',

    COMMENT_DELETED: 'Комментарий успешно удален! ',
    COMMENT_NOT_DELETED: 'Комментарий не удален! ',

    COMMENT_UPDATED: 'Комментарий успешно обновлен! ',
    COMMENT_NOT_UPDATED: 'Комментарий не была обновлен! ',

    COMMENT_CREATED: 'Комментарий успешно создан! ',
    COMMENT_NOT_CREATED: 'Комментарий не создан! ',
    COMMENT_LIMIT_CONTENT_ERROR: 'Внимание! Превышен лимит символов!',
    COMMENT_LIMIT_COUNT_ERROR: 'Комментарий не создан! Превышен лимит (один комментарий в минуту)!',

    COMMENT_FOUND: 'Комментарий успешно найден! ',
    COMMENT_NOT_FOUND: 'Комментарий не найден! ',

    /**
     * SECTIONS
     */

    GET_SECTION_ERROR: 'Ошибка при запросе на получение раздела!',
    GET_ALL_SECTIONS_ERROR: 'Ошибка при запросе на получение всех разделов!',
    CREATE_SECTION_ERROR: 'Ошибка при запросе на создание раздела!',
    UPDATE_SECTION_ERROR: 'Ошибка при запросе на обновление раздела!',
    DELETE_SECTION_ERROR: 'Ошибка при запросе на удаление раздела!',

    SECTIONS_LOADED: 'Разделы успешно загружены! ',
    SECTIONS_NOT_LOADED: 'Разделы не загружены! ',

    SECTION_DELETED: 'Раздел успешно удален! ',
    SECTION_NOT_DELETED: 'Раздел не удален! ',

    SECTION_UPDATED: 'Раздел успешно обновлен! ',
    SECTION_NOT_UPDATED: 'Раздел не была обновлен! ',

    SECTION_CREATED: 'Раздел успешно создан! ',
    SECTION_NOT_CREATED: 'Раздел не создан! ',

    SECTION_FOUND: 'Раздел успешно найден! ',
    SECTION_NOT_FOUND: 'Раздел не найден! ',

    /**
     * other
     */
    GENERATE_SITEMAP_ERROR: 'Генерация карты сайта не удалась!',
    GENERATE_ROUTES_ERROR: 'Генерация маршрутов не удалась!',
    /**
     * Emails
     */
    EMAIL_SUCCESS: 'Запрос успешно отправлен!',
    EMAIL_ERROR: 'Ошибка при запросе на отправку письма с главной страницы!',
}
