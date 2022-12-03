const core = require('@actions/core');
const github = require('@actions/github');

try {
    const outputPath = core.getInput('output_path');
    console.log(`Output folder: ${outputPath}!`);
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}