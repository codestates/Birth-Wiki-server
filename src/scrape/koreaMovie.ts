import axios from "axios";
import cheerio from "cheerio";

const KMovie = async (yyyy: number, mm: number, dd: number): Promise<any> => {
  const getPoster = async (title) => {
    let movie_href;
    let posterURL = "https://www.themoviedb.org";

    const searchData = await axios({
      url: "https://www.themoviedb.org/search",
      params: {
        query: `${title}%20y%3A${yyyy}`,
      },
    });

    const movie$ = cheerio.load(searchData.data);
    const firstMovie = movie$(".poster", ".image").html();

    if (!firstMovie) {
      return "no image";
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
  };

  const K_movie = await axios({
    url:
      "http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchWeeklyBoxOfficeList.json",
    params: {
      key: "ENV_KEY",
      targetDt: `${yyyy}${mm}${dd}`,
      weekGb: "0",
      itemPerPage: "1",
    },
  });

  if (!K_movie.data.boxOfficeResult.weeklyBoxOfficeList[0]) {
    //res.send("no data");
  } else {
    let url = await getPoster(
      K_movie.data.boxOfficeResult.weeklyBoxOfficeList[0].movieNm
    );
    if (url === "no image") {
      url = await getPoster(
        K_movie.data.boxOfficeResult.weeklyBoxOfficeList[0].movieNm.replace(
          /(\s*)/g,
          ""
        )
      );
    }
  }
};

export = KMovie;
