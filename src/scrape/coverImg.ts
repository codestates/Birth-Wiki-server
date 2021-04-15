import axios from "axios";
import cheerio from "cheerio";
import { DriverPackageNotInstalledError, getRepository } from "typeorm";
import { BirthWiki_weekly } from "../entity/BirthWiki_weekly";
import { image } from "../types";
import("dotenv/config");

const coverImg = async (): Promise<any> => {
  const result: image[] = [];

  for (let i = 1; i <= 13; i++) {
    let key = i <= 7 ? process.env.UNSPLASH1 : process.env.UNSPLASH2;

    const music = await axios({
      url: "https://api.unsplash.com/search/photos",
      params: {
        client_id: key,
        query: "music",
        per_page: 30,
        page: i,
      },
    });

    const movie = await axios({
      url: "https://api.unsplash.com/search/photos",
      params: {
        client_id: key,
        query: "movie",
        per_page: 30,
        page: i,
      },
    });

    const news = await axios({
      url: "https://api.unsplash.com/search/photos",
      params: {
        client_id: key,
        query: "news",
        per_page: 30,
        page: i,
      },
    });

    const baby = await axios({
      url: "https://api.unsplash.com/search/photos",
      params: {
        client_id: key,
        query: "baby",
        per_page: 30,
        page: i,
      },
    });

    const dark = await axios({
      url: "https://api.unsplash.com/search/photos",
      params: {
        client_id: key,
        query: "dark",
        per_page: 30,
        page: i,
      },
    });

    for (let i = 0; i < 30; i++) {
      result.push({
        music: music.data.results[i].urls["regular"],
        movie: movie.data.results[i].urls["regular"],
        issue: news.data.results[i].urls["regular"],
        birth: baby.data.results[i].urls["regular"],
        death: dark.data.results[i].urls["regular"],
      });
    }
  }

  return result;
};

export = coverImg;
