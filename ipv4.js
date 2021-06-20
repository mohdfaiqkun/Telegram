import { networkInterfaces } from "os";

export async function getIP(){
    const nets = networkInterfaces();
    const results = {};
    let ipAdd;
  
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === "IPv4" && !net.internal) {
          if (!results[name]) {
            results[name] = [];
          }
          results[name].push(net.address);
          ipAdd = name;
        }
      }
    }
    return results[ipAdd];
}
