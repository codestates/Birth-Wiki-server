import axios from "axios";
import { Wiki_weekly } from "../entity/Wiki_weekly";
import("dotenv/config");

const weeklyImg = async (): Promise<any> => {
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

  for (let i = 1; i <= 132; i++) {
    let key;
    switch (Math.floor(i / 23)) {
      case 0:
        key = process.env.UNSPLASH2;
        break;
      case 1:
        key = process.env.UNSPLASH3;
        break;
      case 2:
        key = process.env.UNSPLASH4;
        break;
      case 3:
        key = process.env.UNSPLASH5;
        break;
      case 4:
        key = process.env.UNSPLASH6;
        break;
      case 5:
        key = process.env.UNSPLASH7;
        break;
    }

    const album = await axios({
      url: "https://api.unsplash.com/search/photos",
      params: {
        client_id: key,
        query: "music",
        per_page: 30,
        page: i,
      },
    });

    const film = await axios({
      url: "https://api.unsplash.com/search/photos",
      params: {
        client_id: key,
        query: "movie night",
        per_page: 30,
        page: i,
      },
    });

    for (let j = 0; j < 25; j++) {
      let curYear = new Date(1958, 7, (i - 1) * 175 + 4 + j * 7).getFullYear();
      let curMonth =
        new Date(1958, 7, (i - 1) * 175 + 4 + j * 7).getMonth() + 1;
      let curDay = new Date(1958, 7, (i - 1) * 175 + 4 + j * 7).getDate();
      let curWeek: string = curYear + weekCount(curYear, curMonth, curDay);

      const movie = new Wiki_weekly();
      movie.date = curWeek;
      movie.fieldName = "movie";
      movie.image = album.data.results[j].urls["regular"];
      await movie.save();

      const music = new Wiki_weekly();
      music.date = curWeek;
      music.fieldName = "music";
      music.image = film.data.results[j].urls["regular"];
      await music.save();
    }
    console.log("completed seed weekly page", i);
  }
};

export = weeklyImg;
