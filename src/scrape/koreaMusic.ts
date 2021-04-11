import axios from "axios";
import cheerio from "cheerio";

const KMusic = async (yyyy: number, mm: number, dd: number): Promise<any> => {
  // const week = 1;
  // const yyyy = 2011;

  // const K_scrape = await axios({
  //   url: `http://gaonchart.co.kr/main/section/chart/online.gaon?nationGbn=T&serviceGbn=ALL&targetTime=${week}&hitYear=${yyyy}&termGbn=week`,
  // });

  // const $ = cheerio.load(K_scrape.data);
  // let respon;
  // $(".subject", "tr").each((idx, el) => {
  //   if (idx === 0) {
  //     respon = $(el).text();
  //   }
  //   return false;
  // });
  // const title = respon.trim().split("\n")[0];
  // const singer = respon.trim().split("\n")[1].trim().split('|')[0];
  const title = "좋은 날";
  const singer = "아이유 (IU)";

  const P_scrape = await axios({
    url: `https://music.bugs.co.kr/search/integrated`,
    params: {
      q: `${singer} ${title}`,
    },
  });
  const P$ = cheerio.load(P_scrape.data)
  let P_URL;
  const respon = P$(".thumbnail","td").html().split(' ')
  respon.forEach((el, idx)=>{
    if(el.includes("src")){
      P_URL = el.slice(5, el.length-1)
    }
  })
  P_URL = P_URL.replace('images/50', 'images/original')
};

export = KMusic;
