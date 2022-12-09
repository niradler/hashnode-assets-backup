const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const https = require('https');
const path = require('path');
const Url = require('url');
const glob = require('glob');

let outputPath = 'assets';

const createPost = (fullPath) => {

}

const downloadUrl = (url) => new Promise((resolve, reject) => {
  const fullPath = path.join(process.cwd(), outputPath, Url.parse(url).path);
  const folderPath = path.dirname(fullPath);
  fs.mkdirSync(folderPath, { recursive: true });
  console.log(folderPath, 'folder created');
  const temp = fs.createWriteStream(fullPath);
  https.get(url, function (response) {
    response.pipe(temp);
    temp.on('finish', () => {
      temp.close();
      console.log(`${fullPath} downloaded`);
      resolve({ folderPath, fullPath, url })
    });
    temp.on('error', (e) => {
      temp.close();
      reject(e)
    });
  });
});

const downloadUrls = async (urls) =>  {
  const jobs = await Promise.all([...new Set(urls)].map((url) => downloadUrl(url)));

  return jobs;
};

const getFilesByPattern = async (pattern) => {
  return new Promise((resolve, reject) => {
    glob(pattern, function (err, localFiles) {
      if (err) reject(err)
      else {
        resolve(localFiles)
      }
    });
  })
}

try {
  
  const pattern = core.getInput('pattern') || '**.md';
  outputPath = core.getInput('assets_output_path') || outputPath;  
  const postsOutputPath = core.getInput('posts_output_path') || 'posts';
  const files = core.getInput('files')
    ? core.getInput('files').split(' ')
    : false;

    console.log(`Output folder: ${outputPath}`);
    console.log(`Output posts: ${postsOutputPath}`);
  console.log(`searching for files`);

  (async () => {
    const localFiles = await getFilesByPattern(pattern)
    console.log(`found:`, localFiles);
    const jobs = localFiles.map(async (filePath) => {
      try {        
        const isFiles = Array.isArray(files);
        if (isFiles && !files.find((file) => filePath.includes(file))) {
          return;
        }
        const file = fs.readFileSync(filePath, 'utf-8');
        const urls = [...file.match(/https{0,1}:\/\/(cdn)\S*/g)];

        await downloadUrls(urls);
        if(postsOutputPath){
          fs.writeFileSync(path.join(process.cwd(), postsOutputPath, filePath),file.replace(/https{0,1}:\/\/(cdn)\S*/g,``))
        }
      } catch (error) {
        console.log(error.message);
      }
    });

    await Promise.all(jobs);
  })()


} catch (error) {
  core.setFailed(error.message);
}
