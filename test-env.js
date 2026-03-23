import fs from 'fs';
import path from 'path';

const distPath = path.resolve(process.cwd(), 'dist');
const distIndexHtml = path.resolve(distPath, 'index.html');
const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(distIndexHtml);

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('distPath:', distPath);
console.log('distIndexHtml:', distIndexHtml);
console.log('distIndexHtml exists:', fs.existsSync(distIndexHtml));
console.log('isProd:', isProd);
console.log('process.cwd():', process.cwd());
