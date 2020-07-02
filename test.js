const { spawn, exec } = require("child_process");

const child = spawn("pwd");

// child.on("exit", function(code, signal){
//     console.log(child);
//     console.log('child process exited with ' + `code ${code} and signal ${signal}`);
// });

exec("groff -i ms -T html >> out.html", (err, stdout, stderr) => {
    if (err) {
        console.log(`Error: ${err.message}`);
    }
    if (stderr) {
        console.log(`Error: ${stderr}`);
    }
    console.log(stdout)
});

child.stdout.on("data", (data)=>{
    console.log(`child stdout: \n ${data}`);
});
