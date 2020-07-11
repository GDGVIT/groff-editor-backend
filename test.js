// const {spawn} = require("child_process");

// const child = spawn('wc');

// process.stdin.pipe(child.stdin)

// child.stdout.on('data', (data) => {
//   console.log(`child stdout:\n${data}`);
// });

//*************************** */


// const {
//     spawn
// } = require('child_process');


// const filePath = process.argv[2];
// console.log('INPUT: ' + filePath);

// const childProcess = spawn('cat', [filePath], {
//     stdio: [process.stdin, process.stdout, process.stderr]
// }); // (A)

// await onExit(childProcess); // (B)

// console.log('### DONE');

const { spawn, exec } = require('child_process');

const child = exec('echo ".B bold" | groff -i -ms -T html');

// child.stdin.write(".B bold")

child.stdout.on('data', (data) => {
  console.log(`child stdout:\n${data}`);
});

// var cmd = require('node-cmd');

// // cmd.run('echo ".B bold" | groff -i -ms -T html');

// cmd.get(
//     cmd.get('echo ".B bold" | groff -i -ms -T html'),
//     function (err, data, stderr) {
//         console.log('the current dir contains these files :\n\n', data)
//     }
// );
