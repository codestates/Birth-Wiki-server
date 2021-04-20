import axios from "axios";
import cheerio from "cheerio";
import { getRepository } from "typeorm";
import { Wiki_music } from "../entity/Wiki_music";
import { Wiki_weekly } from "../entity/Wiki_weekly";

const WMusic = async (yyyy: number, mm: number, dd: number): Promise<any> => {
  let curYear;

  const weekCount = (yyyy: number, mm: number, dd: number): string => {
    let today = new Date(yyyy, mm - 1, dd);
    let defaultDay = new Date(1958, 7, 4);
    while (today > defaultDay) {
      defaultDay.setDate(defaultDay.getDate() + 7);
    }
    today.setDate(defaultDay.getDate() - 7);
    curYear = today.getFullYear();
    let countDay = new Date(curYear, 0, 1);
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

  const weekly: string = curYear + weekCount(yyyy, mm, dd);
  const month = mm < 10 ? "0" + mm : mm;
  const day = dd < 10 ? "0" + dd : dd;
  const date = `${yyyy}-${month}-${day}`;

  try {
    const W_music = await axios({
      url: `https://www.billboard.com/charts/hot-100/${date}`,
    });

    const $ = cheerio.load(W_music.data);
    const title = $(
      ".chart-element__information__song",
      ".chart-element__wrapper"
    ).html();
    const singer = $(
      ".chart-element__information__artist",
      ".chart-element__wrapper"
    ).html();
    const p_scrape = $(".chart-element__wrapper").html().split("</span");
    const start = p_scrape[p_scrape.length - 2].indexOf("(") + 2;
    const end = p_scrape[p_scrape.length - 2].indexOf(")") - 1;
    let poster = p_scrape[p_scrape.length - 2].slice(start, end);

    poster.includes("53x53")
      ? (poster = poster.replace("53x53", "155x155"))
      : (poster = poster);

    let weeklyId = await getRepository(Wiki_weekly)
      .createQueryBuilder("wiki_weekly")
      .where("wiki_weekly.date = :date", { date: weekly })
      .andWhere("wiki_weekly.fieldName = :fieldName", { fieldName: "music" })
      .getOne();

    let oneCase = new Wiki_music();
    oneCase.source = "world";
    oneCase.title = title;
    oneCase.singer = singer;
    oneCase.poster = poster;
    oneCase.date = weeklyId;
    await oneCase.save();

    console.log("completed seed Wmusic", weekly);
  } catch (e) {
    console.log("에러주차", weekly);
    console.log(e);
    console.log("에러주차", weekly);
  }
};

export = WMusic;
