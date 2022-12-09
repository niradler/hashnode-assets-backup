const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const https = require('https');
const path = require('path');
const Url = require('url');
const glob = require('glob');

let outputPath = 'assets';

const downloadUrl = (url) =>
  new Promise((resolve, reject) => {
    const urlFilePath = Url.parse(url).path;
    const fullPath = path.join(process.cwd(), outputPath, urlFilePath);
    const folderPath = path.dirname(fullPath);
    fs.mkdirSync(folderPath, { recursive: true });
    const temp = fs.createWriteStream(fullPath);
    https.get(url, function (response) {
      response.pipe(temp);
      temp.on('finish', () => {
        temp.close();
        resolve({ folderPath, fullPath, url, urlFilePath });
      });
      temp.on('error', (e) => {
        temp.close();
        reject(e);
      });
    });
  });

const downloadUrls = async (urls) => {
  const jobs = await Promise.all(
    [...new Set(urls)].map((url) => downloadUrl(url))
  );

  return jobs;
};

const getFilesByPattern = async (pattern) => {
  return new Promise((resolve, reject) => {
    glob(pattern, function (err, localFiles) {
      if (err) reject(err);
      else {
        resolve(localFiles);
      }
    });
  });
};

try {
  const pattern = core.getInput('pattern') || '**.md';
  outputPath = core.getInput('assets_output_path') || outputPath;
  const postsOutputPath = core.getInput('posts_output_path') || 'posts';
  const copyFailed = !(core.getInput('copy_failed_posts') === 'false');
  const files = core.getInput('files')
    ? core.getInput('files').split(' ')
    : false;

  console.log(`Output folder: ${outputPath}`);
  console.log(
    postsOutputPath
      ? `Output posts: ${postsOutputPath}`
      : 'posts output is disabled'
  );
  console.log(`searching for files`);

  if (postsOutputPath) {
    fs.mkdirSync(path.join(process.cwd(), postsOutputPath), {
      recursive: true,
    });
  }

  (async () => {
    const localFiles = await getFilesByPattern(pattern);
    console.log(`found:`, localFiles);
    const jobs = localFiles.map(async (filePath) => {
      try {
        const isFiles = Array.isArray(files);
        if (isFiles && !files.find((file) => filePath.includes(file))) {
          return;
        }
        console.log('processing:', filePath);
        const file = fs.readFileSync(filePath, 'utf-8');

        try {
          const urls = [...file.match(/https{0,1}:\/\/(cdn)\S*/g)];
          console.log('assets:', urls);
          const report = await downloadUrls(urls);
          console.log('backup report:', report);
          if (postsOutputPath) {
            const newFile = file
              .replaceAll('https://cdn.hashnode.com', `/${outputPath}`)
              .replaceAll(' align="left")', '?raw=true)');
            fs.writeFileSync(
              path.join(process.cwd(), postsOutputPath, filePath),
              newFile
            );
          }
        } catch (error) {
          if (postsOutputPath && copyFailed) {
            fs.writeFileSync(
              path.join(process.cwd(), postsOutputPath, filePath),
              file
            );
          }
          console.log(`assets not found: ${filePath}`);
        }
      } catch (error) {
        console.log(error.message);
      }
    });

    await Promise.all(jobs);
  })();
} catch (error) {
  core.setFailed(error.message);
}
