import axios from "axios";
import cheerio from "cheerio";

const WMovie = async (yyyy: number, mm: number, dd: number): Promise<any> => {
  const weekCount = (yyyy, mm, dd) => {
    let today = new Date(yyyy, mm, dd);
    let countDay = new Date(yyyy, 1, 1);
    let week = 1;
    while (today > countDay) {
      countDay.setDate(countDay.getDate() + 1);
      let countNum = countDay.getDay();
      if (countNum == 0) {
        week++;
      }
    }
    return week;
  };

  const getPoster = async (title) => {
    let movie_href;
    let posterURL = "https://www.themoviedb.org";

    const searchData = await axios({
      url: "https://www.themoviedb.org/search",
      params: {
        query: `${title}`,
      },
    });
    const movie$ = cheerio.load(searchData.data);
    const firstMovie = movie$(".poster", ".image").html();

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
  };

  const week = weekCount(yyyy, mm, dd);

  const M_scrape = await axios({
    url: `https://www.boxofficemojo.com/weekly/by-year/${yyyy}/`,
  });

  const $ = cheerio.load(M_scrape.data);
  const stone = [];
  const result = [];
  $("a", "td").each((idx, el) => {
    stone.push($(el).text());
  });
  stone.forEach((el, idx) => {
    if (idx % 3 === 0) {
      result.push([stone[idx + 2], stone[idx + 1]]);
    }
  });

  const title = result[result.length - week][1];

  const W_poster = await getPoster(title);
};

export = WMovie;
