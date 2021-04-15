import axios from "axios";
import cheerio from "cheerio";
import { getRepository } from "typeorm";
import { BirthWiki_weekly } from "../entity/BirthWiki_weekly";

const KMusic = async (yyyy: number, mm: number, dd: number): Promise<any> => {
  const weekCount = (yyyy, mm, dd) => {
    let today = new Date(yyyy, mm - 1, dd);
    let countDay = new Date(yyyy, 0, 1);
    let week = 1;
    while (today > countDay) {
      countDay.setDate(countDay.getDate() + 1);
      let countNum = countDay.getDay();
      if (countNum == 0) {
        week++;
      }
    }

    return week < 10 ? "0" + week : "" + week;
  };

  const getPoster = async (title: string, singer: string) => {
    try {
      const scrape = await axios({
        url: `https://music.bugs.co.kr/search/integrated`,
        params: {
          q: `${singer} ${title}`,
        },
      });
      const P$ = cheerio.load(scrape.data);
      let P_URL = null;

      if (P$(".thumbnail", "td").html()) {
        const respon = P$(".thumbnail", "td").html().split(" ");

        respon.forEach((el, idx) => {
          if (el.includes("src")) {
            P_URL = el.slice(5, el.length - 1);
          }
        });
        P_URL = P_URL.replace("images/50", "images/original");
      }

      return P_URL;
    } catch {
      console.log("포스터 오류");
    }
  };

  const weekly = weekCount(yyyy, mm, dd);

  try {
    const K_music = await axios({
      url: `http://gaonchart.co.kr/main/section/chart/online.gaon?nationGbn=T&serviceGbn=ALL&targetTime=${weekly}&hitYear=${yyyy}&termGbn=week`,
    });

    const $ = cheerio.load(K_music.data);
    let respon;
    $(".subject", "tr").each((idx, el) => {
      if (idx === 0) {
        respon = $(el).text();
      }
      return false;
    });
    const title = respon.trim().split("\n")[0];
    const singer = respon.trim().split("\n")[1].trim().split("|")[0];
    const poster = await getPoster(title, singer);

    let oneCase = await getRepository(BirthWiki_weekly)
      .createQueryBuilder("birth_wiki_weekly")
      .where("birth_wiki_weekly.weekly = :weekly", { weekly: weekly })
      .getOne();

    if (!oneCase) {
      oneCase = new BirthWiki_weekly();
      oneCase.weekly = yyyy + weekly;
    }
    oneCase.KS_title = title;
    oneCase.KS_singer = singer;
    oneCase.KS_poster = poster;
    await oneCase.save();

    console.log("completed seed Kmusic", yyyy + weekly);
  } catch (e) {
    console.log("에러주차", yyyy + weekly);
    console.log(e);
    console.log("에러주차", yyyy + weekly);
  }
};

export = KMusic;
