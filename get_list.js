const fs = require('fs');

const posts = JSON.parse(fs.readFileSync('posts.json'));

const list = []
posts.forEach(p => p.tags.forEach(tag => list.includes(tag) ?null: list.push(tag)))
fs.writeFileSync('list_tags.txt',JSON.stringify(list.sort()))
// console.log(posts)
