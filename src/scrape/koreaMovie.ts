import axios from "axios";
import cheerio from "cheerio";
import { getRepository } from "typeorm";
import { BirthWiki_weekly } from "../entity/BirthWiki_weekly";
import("dotenv/config");

const KMovie = async (yyyy: number, mm: number, dd: number): Promise<any> => {
  const getPoster = async (title, realTitle, count) => {
    let movie_href;
    let posterURL = "https://www.themoviedb.org";
    try {
      if (title === " undefined") {
        return null;
      }

      let searchData = await axios({
        url: "https://www.themoviedb.org/search",
        params: {
          query: `${title}%20y%3A${yyyy}`,
        },
      });

      const movie$ = cheerio.load(searchData.data);
      const firstMovie = movie$(".poster", ".image").html();

      if (!firstMovie) {
        let recTitle;
        if (count === 0) {
          recTitle = title.replace(/(\s*)/g, "");
          count++;
        } else if (count === 1) {
          recTitle = title.slice(0, -1) + " " + title[title.length - 1];
          count++;
        } else {
          recTitle = title.slice(0, -3) + " " + title[title.length - 3];
        }

        return await getPoster(recTitle, realTitle, count);
      } else {
        firstMovie
          .split("\n")[1]
          .trim()
          .split(" ")
          .forEach((el) => {
            if (el.includes("href")) {
              movie_href = el.split(`"`)[1];
            }
          });

        const posterData = await axios({
          url: `https://www.themoviedb.org${movie_href}`,
        });

        const poster$ = cheerio.load(posterData.data);

        const urlData = poster$(".image_content", ".poster").html();

        urlData
          .trim()
          .split(" ")
          .forEach((el) => {
            if (el[0] === "/" && el.includes("and")) {
              posterURL += el;
            }
          });

        return posterURL;
      }
    } catch (e) {
      console.log("포스터 에러", e);
    }
  };

  const month = mm < 10 ? "0" + mm : mm;
  const day = dd < 10 ? "0" + dd : dd;
  try {
    const K_movie = await axios({
      url:
        "http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchWeeklyBoxOfficeList.json",
      params: {
        key: process.env.KOBIS,
        targetDt: `${yyyy}${month}${day}`,
        weekGb: "0",
        itemPerPage: "1",
      },
    });

    let weekly = K_movie.data.boxOfficeResult.yearWeekTime;
    let title = K_movie.data.boxOfficeResult.weeklyBoxOfficeList[0].movieNm;
    let existPoster = await getRepository(BirthWiki_weekly)
      .createQueryBuilder("birth_wiki_weekly")
      .where("birth_wiki_weekly.KM_title = :KM_title", { KM_title: title })
      .getOne();
    let poster;

    existPoster
      ? (poster = existPoster.KM_poster)
      : (poster = await getPoster(title, title, 0));

    let oneCase = await getRepository(BirthWiki_weekly)
      .createQueryBuilder("birth_wiki_weekly")
      .where("birth_wiki_weekly.weekly = :weekly", { weekly: weekly })
      .getOne();

    if (!oneCase) {
      oneCase = new BirthWiki_weekly();
      oneCase.weekly = weekly;
    }
    oneCase.KM_title = title;
    oneCase.KM_poster = poster;
    await oneCase.save();

    console.log("completed seed Kmovie", weekly);
  } catch (e) {
    console.log("에러날짜", yyyy, mm, dd);
    console.log(e);
    console.log("에러날짜", yyyy, mm, dd);
  }
};

export = KMovie;
