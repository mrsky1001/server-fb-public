/*
 * Copyright (©) 15.09.2021, 14:45. Kolyada Nikita Vladimirovich (nikita.nk16@yandex.ru)
 */

const tsNode = require('ts-node');
const testTSConfig = require('../server-fb/test/tsconfig.json');

tsNode.register({
    files: true,
    transpileOnly: true,
    project: './test/tsconfig.json'
});
