import {App} from './App';

let server: any = new App().expressApp;

server.listen(process.env.PORT || 8080);
console.log("Server running on port: 8080 or Azure port");