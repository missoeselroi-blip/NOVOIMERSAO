import fs from 'fs';
const file = 'src/pages/QuizPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove interface Question
content = content.replace(/interface Question \{[\s\S]*?\n\}\n/, '');

// Remove const QUESTIONS
content = content.replace(/const QUESTIONS: Question\[\] = \[[\s\S]*?\];\n/, '');

// Add import
content = content.replace(/import \{ db \} from '\.\.\/lib\/firebase';/, "import { db } from '../lib/firebase';\nimport { Question, QUESTIONS } from '../data/questions';");

fs.writeFileSync(file, content);
console.log('Done');
