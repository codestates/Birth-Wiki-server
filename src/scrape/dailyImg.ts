import axios from "axios";
import { Wiki_daily } from "../entity/Wiki_daily";
import("dotenv/config");

const dailyImg = async (): Promise<any> => {
  let key = process.env.UNSPLASH6;

  for (let i = 1; i <= 13; i++) {
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

    for (let j = 1; j < 30; j++) {
      let curMonth = new Date(2020, 0, (i - 1) * 29 + j).getMonth() + 1;
      let curDay = new Date(2020, 0, (i - 1) * 29 + j).getDate();

      const issue = new Wiki_daily();
      issue.date = curMonth + "-" + curDay;
      issue.fieldName = "issue";
      issue.image = news.data.results[j].urls["regular"];
      await issue.save();

      const birth = new Wiki_daily();
      birth.date = curMonth + "-" + curDay;
      birth.fieldName = "birth";
      birth.image = baby.data.results[j].urls["regular"];
      await birth.save();

      const death = new Wiki_daily();
      death.date = curMonth + "-" + curDay;
      death.fieldName = "death";
      death.image = dark.data.results[j].urls["regular"];
      await death.save();

      if (curMonth === 12 && curDay === 31) {
        break;
      }
    }
  }
};

export = dailyImg;
