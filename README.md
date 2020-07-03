# WS Exec
Execute commands remotely through websockets

## Usage example:
On the server side:
```shell script
npm install
AUTHORIZATION=debug PORT=3000 npm start
````

On the client side (`brew install websocat` beforehand):
```shell script
websocat ws://localhost:3000?authorization=debug
 > {"command":"ls", "args":["-a"]}
 < {"stdoutMessage":".\n..\n.eslintignore\n.eslintrc.js\n.git\n.gitignore\n.idea\n.prettierrc.js\nREADME.md\nbuild\nnode_modules\npackage-lock.json\npackage.json\nsrc\ntsconfig.json\n","token":"ENrrIs._W8-lJnm8HJsft2AD"}
 < {"exitCode":0,"token":"ENrrIs._W8-lJnm8HJsft2AD"}
```
