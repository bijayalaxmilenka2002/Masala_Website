const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserPath = fs.existsSync(edgePath) ? edgePath : chromePath;

const inputHtml = path.resolve(__dirname, '..', 'platform_documentation.html');
const outputPdf = path.resolve(__dirname, '..', 'Subhadarshini_Platform_Documentation.pdf');

const args = [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  `--print-to-pdf=${outputPdf}`,
  `file:///${inputHtml.replace(/\\/g, '/')}`
];

console.log('Using browser:', browserPath);
console.log('Generating PDF to:', outputPdf);

execFile(browserPath, args, (error, stdout, stderr) => {
  if (error) {
    console.error('Execution failed:', error);
    process.exit(1);
  }
  if (fs.existsSync(outputPdf)) {
    const stats = fs.statSync(outputPdf);
    console.log(`SUCCESS: PDF generated successfully! Size: ${(stats.size / 1024).toFixed(1)} KB`);
    console.log('File path:', outputPdf);
  } else {
    console.error('PDF file was not created. Stderr:', stderr);
    process.exit(1);
  }
});
