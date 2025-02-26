#!/usr/bin/env node

function generateRandomToken(minLength = 8, maxLength = 20) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    let token = '';
    
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return token;
}

const token = generateRandomToken();
console.log('\n生成的认证令牌：');
console.log('\x1b[32m%s\x1b[0m', token);
console.log('\n请将以下内容添加到 .env 文件中：');
console.log('\x1b[36m%s\x1b[0m', `AUTH_TOKEN=${token}\n`);