const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');
const { text } = require('stream/consumers');
const pathlib = require('node:path');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);
let todos = findTodo();

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    let files = [];
    filePaths.forEach(path => files.push({content: readFile(path), file: pathlib.basename(path)}))
    return files;
}

function findTodo() {
    let result = [];
    let files = getFiles();
        files.forEach(file => {
           file.content.split('\n').forEach(line => {
                 if (line.includes('// TODO ')) {
                    let raw = ('// TODO ' + line.split('// TODO ')[1]);
                    result.push({
                        importance: getImportance(raw),
                        author: getAuthor(raw),
                        date: getDate(raw),
                        text: getText(raw).replace('\r', ''),
                        file: file.file
                    });
                 }
            });
        });
    return result;
}

function getText(todo) {
    if (!todo.includes(';')) {
        return todo.slice(8);
    }
    return todo.split(';')[2].slice(1);
}

function getAuthor(todo) {
    if (!todo.includes(';')) {
        return '';
    }
    return todo.split(';')[0].slice(8);
}

function getDate(todo) {
    if (!todo.includes(';')) {
        return '';
    }
    return todo.split(';')[1].slice(1);
}

function getImportance(todo) {
    return todo.split('!').length - 1;
}

function getRow(todo, maxAuthor, maxText, maxDate, maxFile) {
    return `  ${todo.importance > 0 ? '!' : ' '}  |  ${todo.author.length <= maxAuthor ? todo.author.padEnd(maxAuthor) : todo.author.slice(0, 9) + '…'}  |  ${todo.date.padEnd(maxDate)}  |  ${todo.text.length <= maxText ? todo.text.padEnd(maxText) : todo.text.slice(0, 49) + '…'}   |  ${todo.file.padEnd(maxFile)}  `;
}

function printTable(todos) {
    let maxAuthor = Math.max(Math.min(10, Math.max(...todos.map(todo => todo.author.length))), 4);
    let maxText = Math.max(Math.min(50, Math.max(...todos.map(todo => todo.text.length))), 7);
    let maxDate = Math.max(Math.min(10, Math.max(...todos.map(todo => todo.date.length))), 4);
    let maxFile = Math.max(Math.min(20, Math.max(...todos.map(todo => todo.file.length))), 4);
    const header = getRow({importance: '!', author: 'user', date: 'date', text: 'comment', file: 'file'}, maxAuthor, maxText, maxDate, maxFile);
    console.log(header);
    console.log('-'.repeat(header.length));
    todos.forEach(todo => console.log(getRow(todo, maxAuthor, maxText, maxDate)));
}

function processCommand(command) {
    const com = command.split(' ')[0];
    switch (com) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            printTable(todos);
            break;
        case 'important':
            printTable(todos.filter(todo => todo.importance > 0))
            break;
        case 'user':
            printTable(todos.filter(todo => todo.author.toLowerCase() === command.split(' ')[1].toLowerCase()));
            break;
        case 'sort':
            switch(command.split(' ')[1]) {
                case 'importance':
                    printTable(todos.sort((a, b) => b.importance - a.importance));
                    break;
                case 'user':
                    printTable(todos.sort((a, b) => a.author.localeCompare(b.author)));
                    break;
                case 'date':
                    printTable(todos.sort((a, b) => -a.date.localeCompare(b.date)));
                    break;
            }
            break;
        case 'date':
            let date = new Date(command.split(' ')[1]);
            printTable(todos.filter(todo => new Date(todo.date) > date));
            break;
        default:
            console.log('wrong command');
            break;
    }
}

// TODO you can do it!
