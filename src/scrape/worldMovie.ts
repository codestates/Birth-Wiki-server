import axios from "axios";
import cheerio from "cheerio";
import { getRepository } from "typeorm";
import { Wiki_movie } from "../entity/Wiki_movie";
import { Wiki_weekly } from "../entity/Wiki_weekly";

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

  const getDate = (yyyy: number, weekly: number) => {
    let firstDate = new Date(yyyy, 0, 1);
    while (firstDate.getDay() !== 5) {
      firstDate.setDate(firstDate.getDate() + 1);
    }
    return firstDate.getDate() + (weekly - 1) * 7;
  };

  try {
    const W_movie = await axios({
      url: `https://www.boxofficemojo.com/weekly/by-year/${yyyy}/`,
    });

    const $ = cheerio.load(W_movie.data);
    const stone = [];
    const refineData: [number?, string?][] = [];

    $("a", "td").each((idx, el) => {
      stone.push($(el).text());
    });

    stone.forEach((el, idx) => {
      if (idx % 3 === 0) {
        refineData.push([
          getDate(yyyy, Number(stone[idx + 2])),
          stone[idx + 1],
        ]);
      }
    });

    for (let weeklyData of refineData) {
      let weekly: string = yyyy + weekCount(yyyy, 1, weeklyData[0]);
      let title = weeklyData[1];
      let existPoster = await getRepository(Wiki_movie)
        .createQueryBuilder("wiki_movie")
        .where("wiki_movie.title = :title", { title })
        .getOne();
      let poster;

      existPoster
        ? (poster = existPoster.poster)
        : (poster = await getPoster(title, title, 0));

      let weeklyId = await getRepository(Wiki_weekly)
        .createQueryBuilder("wiki_weekly")
        .where("wiki_weekly.date = :date", { date: weekly })
        .andWhere("wiki_weekly.fieldName = :fieldName", { fieldName: "movie" })
        .getOne();

      let oneCase = new Wiki_movie();
      oneCase.source = "world";
      oneCase.title = title;
      oneCase.poster = poster;
      oneCase.date = weeklyId;
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
