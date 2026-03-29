const fs = require('fs');
const content = fs.readFileSync('prisma/schema.prisma', 'utf8');
const lines = content.split('\n');
console.log(lines[9]);
for (let i = 0; i < lines[9].length; i++) {
  console.log(lines[9][i], lines[9].charCodeAt(i));
}
