import { createQueryBuilder, getRepository } from "typeorm";
import { BirthWiki_daily } from "../../entity/BirthWiki_daily";
import { BirthWiki_weekly } from "../../entity/BirthWiki_weekly";
import { ActionCard } from "../../entity/actionCard";
import { Wiki_birth } from "../../entity/Wiki_birth";
import { Wiki_date } from "../../entity/Wiki_date";
import { Wiki_death } from "../../entity/Wiki_death";
import { Wiki_issue } from "../../entity/Wiki_issue";
import { response } from "express";

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

  const getData = async (field: string, dateId: number, img: string) => {
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

  try {
    const year = date.split("-")[0];
    const month = date.split("-")[1];
    const day = date.split("-")[2];
    const weekly = weekCount(Number(year), Number(month), Number(day));

    const dateData = await getRepository(Wiki_date)
      .createQueryBuilder("wiki_date")
      .where("wiki_date.date = :date", { date: `${month}-${day}` })
      .getMany();

    const issueId = dateData[0]["id"];
    const birthId = dateData[1]["id"];
    const deathId = dateData[2]["id"];
    const musicId = dateData[3]["id"];
    const movieId = dateData[4]["id"];

    const issueData = await getData("issue", issueId, dateData[0]["image"]);
    const birthData = await getData("birth", birthId, dateData[1]["image"]);
    const deathData = await getData("death", deathId, dateData[2]["image"]);
    let musicData = null;
    let movieData = null;
    let weatherData = null;

    const weeklyData = await getRepository(BirthWiki_weekly)
      .createQueryBuilder("birth_wiki_weekly")
      .where("birth_wiki_weekly.weekly = :weekly", { weekly: weekly })
      .getOne();

    if (weeklyData) {
      musicData = [
        dateData[3]["image"],
        [weeklyData.WS_poster, weeklyData.WS_title, weeklyData.WS_singer],
        [weeklyData.KS_poster, weeklyData.KS_title, weeklyData.KS_singer],
      ];
      movieData = [
        dateData[4]["image"],
        [weeklyData.WM_poster, weeklyData.WM_title],
        [weeklyData.KM_poster, weeklyData.KM_title],
      ];
    }

    const dailyData = await getRepository(BirthWiki_daily)
      .createQueryBuilder("birth_wiki_daily")
      .where("birth_wiki_daily.date = :date", { date: date })
      .getOne();

    if (dailyData) {
      weatherData = [dailyData.weather, JSON.parse(dailyData.temperature)];
    }

    res.send({
      data: {
        issueData,
        birthData,
        deathData,
        musicData,
        movieData,
        weatherData,
      },
    });
  } catch {
    res.status(400).send({ message: "something wrong" });
  }
};
