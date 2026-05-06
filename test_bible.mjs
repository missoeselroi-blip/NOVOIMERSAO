import axios from 'axios';
import fs from 'fs';

async function test() {
  const endpoints = [
    'https://bolls.life/get-translations/',
    'https://bolls.life/api/v1/get-translations/'
  ];
  
  for (const url of endpoints) {
    try {
      const response = await axios.get(url);
      fs.writeFileSync('translations.json', JSON.stringify(response.data, null, 2));
      console.log('Success with ' + url);
      return;
    } catch (e) {
      console.log('Failed ' + url);
    }
  }
}
test();
