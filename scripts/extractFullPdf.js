const fs = require('fs');
const pdfParse = require('pdf-parse');

async function main() {
  const buf = fs.readFileSync('./Linux_System_Programming_Essentials-mkerrisk_man7.org.pdf');
  const data = await pdfParse(buf);
  
  console.log('Total pages:', data.numpages);
  console.log('---');
  
  // Output in chunks to avoid buffer issues
  const text = data.text;
  const chunkSize = 40000;
  const startChunk = parseInt(process.argv[2] || '0');
  const start = startChunk * chunkSize;
  const end = Math.min(start + chunkSize, text.length);
  
  console.log(`Chunk ${startChunk} (chars ${start}-${end} of ${text.length}):`);
  console.log('---');
  console.log(text.substring(start, end));
}

main().catch(console.error);
