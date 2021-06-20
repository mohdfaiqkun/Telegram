import { networkInterfaces } from "os";

export async function getIP(){
    const nets = networkInterfaces();
    const results = [];
  console.log(nets)
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === "IPv4" && !net.internal) {
          results.push(net.address);
        }
      }
    }
    return results;
}
