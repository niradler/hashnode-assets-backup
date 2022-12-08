const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const https = require("https");
const path = require("path");
const Url = require("url");
const glob = require("glob");

let outputPath = "assets";

const downloads = (urls) => {
  outputPath = core.getInput("output_path") || outputPath;
  console.log(`Output folder: ${outputPath}!`);
  [...new Set(urls)].forEach((url) => {
    const fullPath = path.join(process.cwd(),outputPath,Url.parse(url).path);

    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    console.log("folder created");
    const temp = fs.createWriteStream(fullPath);
    https.get(url, function (response) {
      response.pipe(temp);
      temp.on("finish", () => {
        temp.close();
        console.log(`${fullPath} downloaded`);
      });
    });
  });
};

try {
  console.log(`searching for files`);

  glob("**.md", function (er, files) {
    files.forEach((filePath) => {
      try {
        console.log(`found ${filePath}`);
        const file = fs.readFileSync(filePath, "utf-8");
        const urls = [...file.match(/https{0,1}:\/\/(cdn)\S*/g)];

        downloads(urls);
      } catch (error) {
        console.log(error.message);
      }
    });
  });
} catch (error) {
  core.setFailed(error.message);
}
