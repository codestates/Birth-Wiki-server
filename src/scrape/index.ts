import fs from "fs";
import util from "util";

const seed = async () => {
  const readFile = util.promisify(fs.readFile);
  const open = util.promisify(fs.open);
  const appendFile = util.promisify(fs.appendFile);

  const cb = (err, data) => {
    if (err) {
      console.log(err);
    }
  };

  try {
    await readFile("end.txt");
  } catch (err) {
    //await open("wiki.txt", 'w').then(()=>{console.log('위키')})
    //await appendFile("wiki.txt", '[2000년, [저런일이있었따]]')
    // const text = await readFile("wiki.txt")
    // console.log('검사',text.toString())
    // await open("weather.txt", 'w').then(()=>{console.log('날씨')})
    console.log('저기')
    // await open("music.txt", 'w').then(()=>{console.log('음악')})
    console.log('거기')
    // await open("movie.txt", 'w').then(()=>{console.log('영화')})
    console.log('메기')
  }
  // if (err) {
  //   await fs.open("wiki.txt", "w", cb);
  //   await fs.open("wiki.txt", "w", cb);
  // } else {
  //   console.log("데이따", data);
  // }

  //console.log('여부', exist);
};

export = seed;
