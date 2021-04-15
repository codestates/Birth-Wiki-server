import axios from "axios";
import cheerio from "cheerio";
import { getRepository } from "typeorm";
import { BirthWiki_weekly } from "../entity/BirthWiki_weekly";

const WMovie = async (yyyy: number): Promise<any> => {
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

  try {
    const W_movie = await axios({
      url: `https://www.boxofficemojo.com/weekly/by-year/${yyyy}/`,
    });

    const $ = cheerio.load(W_movie.data);
    const stone = [];
    const refineData = [];

    $("a", "td").each((idx, el) => {
      stone.push($(el).text());
    });

    stone.forEach((el, idx) => {
      if (idx % 3 === 0) {
        if (Number(stone[idx + 2]) < 10) {
          refineData.push([yyyy + "0" + stone[idx + 2], stone[idx + 1]]);
        } else {
          refineData.push([yyyy + "" + stone[idx + 2], stone[idx + 1]]);
        }
      }
    });

    for (let weeklyData of refineData) {
      let weekly = weeklyData[0];
      let title = weeklyData[1];
      let existPoster = await getRepository(BirthWiki_weekly)
        .createQueryBuilder("birth_wiki_weekly")
        .where("birth_wiki_weekly.WM_title = :WM_title", { WM_title: title })
        .getOne();
      let poster;

      existPoster
        ? (poster = existPoster.WM_poster)
        : (poster = await getPoster(title, title, 0));

      let oneCase = await getRepository(BirthWiki_weekly)
        .createQueryBuilder("birth_wiki_weekly")
        .where("birth_wiki_weekly.weekly = :weekly", { weekly: weekly })
        .getOne();

      if (!oneCase) {
        oneCase = new BirthWiki_weekly();
        oneCase.weekly = weekly;
      }
      oneCase.WM_title = title;
      oneCase.WM_poster = poster;
      await oneCase.save();
    }
    console.log("completed seed Wmovie", yyyy);
  } catch (e) {
    console.log("에러연도", yyyy);
    console.log(e);
    console.log("에러연도", yyyy);
  }
};

export = WMovie;
