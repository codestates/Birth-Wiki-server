import { createQueryBuilder, getRepository } from "typeorm";
import { Wiki_weather } from "../../entity/Wiki_weather";
import { Wiki_weekly } from "../../entity/Wiki_weekly";
import { RecordCard } from "../../entity/RecordCard";
import { Wiki_birth } from "../../entity/Wiki_birth";
import { Wiki_daily } from "../../entity/Wiki_daily";
import { Wiki_death } from "../../entity/Wiki_death";
import { Wiki_issue } from "../../entity/Wiki_issue";
import { Wiki_movie } from "../../entity/Wiki_movie";
import { Wiki_music } from "../../entity/Wiki_music";

export = async (req, res) => {
  const { date, nickName, accessToken } = req.body;

  const weekCount = (yyyy: number, mm: number, dd: number) => {
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

    return week < 10 ? "0" + week : week;
  };

  const getDaily = async (field: string, dateId: number, img: string) => {
    let repo;
    switch (field) {
      case "issue":
        repo = Wiki_issue;
        break;
      case "birth":
        repo = Wiki_birth;
        break;
      case "death":
        repo = Wiki_death;
        break;
    }

    try {
      const data: [string, [string, string]?] = [img];
      const stone: any[] = await getRepository(repo)
        .createQueryBuilder(`wiki_${field}`)
        .where(`wiki_${field}.date = :date`, { date: dateId })
        .getMany();
      if (stone) {
        stone.forEach((event) => {
          data.push([event.year, JSON.parse(event.event)]);
        });

        return data;
      }
      return null;
    } catch {
      console.log("데이터 조회 에러");
    }
  };

  const getWeekly = async (field: string, dateId: number, img: string) => {
    let repo;
    switch (field) {
      case "movie":
        repo = Wiki_movie;
        break;
      case "music":
        repo = Wiki_music;
        break;
    }

    try {
      const data: [string, [string, string]?] = [img];
      const stone: any[] = await getRepository(repo)
        .createQueryBuilder(`wiki_${field}`)
        .where(`wiki_${field}.date = :date`, { date: dateId })
        .getMany();
      if (stone) {
        stone.forEach((event) => {
          data.push([event.year, JSON.parse(event.event)]);
        });

        return data;
      }
      return null;
    } catch {
      console.log("데이터 조회 에러");
    }
  };

  try {
    const year = date.split("-")[0];
    const month = date.split("-")[1];
    const day = date.split("-")[2];
    const weekly = weekCount(Number(year), Number(month), Number(day));

    const dailyData = await getRepository(Wiki_daily)
      .createQueryBuilder("wiki_daily")
      .where("wiki_daily.date = :date", { date: `${month}-${day}` })
      .getMany();

    const weeklyData = await getRepository(Wiki_weekly)
      .createQueryBuilder("wiki_weekly")
      .where("wiki_weekly.weekly = :weekly", { weekly: weekly })
      .getMany();

    const issueId = dailyData[0]["id"];
    const birthId = dailyData[1]["id"];
    const deathId = dailyData[2]["id"];
    const musicId = weeklyData[0]["id"];
    const movieId = weeklyData[1]["id"];

    const issueCard = await getDaily("issue", issueId, dailyData[0]["image"]);
    const birthCard = await getDaily("birth", birthId, dailyData[1]["image"]);
    const deathCard = await getDaily("death", deathId, dailyData[2]["image"]);
    const musicCard = await getWeekly("music", musicId, weeklyData[0]["image"]);
    const movieCard = await getWeekly("movie", movieId, weeklyData[1]["image"]);
    let weatherCard = null;

    const weatherData = await getRepository(Wiki_weather)
      .createQueryBuilder("birth_wiki_daily")
      .where("birth_wiki_daily.date = :date", { date: date })
      .getOne();

    if (weatherData) {
      weatherCard = [weatherData.weather, JSON.parse(weatherData.temperature)];
    }

    res.send({
      data: {
        issueCard,
        birthCard,
        deathCard,
        musicCard,
        movieCard,
        weatherCard,
      },
    });
  } catch {
    res.status(400).send({ message: "something wrong" });
  }
};
