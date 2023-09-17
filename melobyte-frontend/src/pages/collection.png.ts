
import * as melobyte from 'melobyte';
import Jimp from 'jimp';
import {promises as fs} from 'node:fs';
import {x} from '../keyStore.js';

const FakeWallet = {
  isConnected: function()  { return false },
};
export async function get({params, request}) {

  let collection = undefined;
  let now = Date.now();
  if (now - x.get() > 10000) {
    console.log("Updating the fresco")
    collection = await update();
    x.set(now);
  } else {
    console.log("from cache")
    //collection = await update();
    collection = await Jimp.read('./data/data-collection.png');
  }
  return {
    body: "data:image/png;base64," + (await collection.getBufferAsync("image/png")).toString("base64"),
  };
}

async function update() {

  let max = await melobyte.totalSupply({wallet: FakeWallet});
  let collection = new Jimp(2048, 512);
  for (let id=0; id < max; id++) {
    let filename = `./data/data-0x${id.toString(16).padStart(3, "0")}.json`;
    try {
      let data = JSON.parse(await fs.readFile(filename, "utf8"));
      let b64 = data.image.substring(data.image.indexOf(',')+1);
      let image = b64 != data.image ? await Jimp.read(Buffer.from(b64, "base64")) : await Jimp.read(data.image);
      let xy = data.coords;
       collection.composite(image, xy[0] * 16, xy[1] * 16);
    } catch (e) {
      //
      console.log(e)
    }
  }
   collection.write('./data/data-collection.png');

  return collection;
}
