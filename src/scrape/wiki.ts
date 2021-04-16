import axios from "axios";
import cheerio from "cheerio";
import { getRepository } from "typeorm";
import { Wiki_birth } from "../entity/Wiki_birth";
import { Wiki_daily } from "../entity/Wiki_daily";
import { Wiki_death } from "../entity/Wiki_death";
import { Wiki_issue } from "../entity/Wiki_issue";

const wiki = async (date: number) => {
  const trimData = (arr: string[]): string[][] => {
    let result: string[][] = [];

    arr.forEach((el: string, idx: number) => {
      let target: string[];
      const yearIdx = el.indexOf("년");

      if (el.length === 0) {
        return false;
      } else if (el.includes("년 - ") && el.length > yearIdx + 4) {
        target = [el.slice(0, yearIdx + 1), el.slice(yearIdx + 4)];
      } else if (el.includes("년 - ") && el.length === yearIdx + 4) {
        target = [el.slice(0, yearIdx + 1)];
      } else if (el.includes("년- ") && el.length > yearIdx + 3) {
        target = [el.slice(0, yearIdx + 1), el.slice(yearIdx + 3)];
      } else if (el.includes("년- ") && el.length === yearIdx + 3) {
        target = [el.slice(0, yearIdx + 1)];
      } else if (el.includes("년-") && el.length > yearIdx + 2) {
        target = [el.slice(0, yearIdx + 1), el.slice(yearIdx + 2)];
      } else if (el.includes("년-") && el.length === yearIdx + 2) {
        target = [el.slice(0, yearIdx + 1)];
      } else if (el.includes("년 -") && el.length > yearIdx + 3) {
        target = [el.slice(0, yearIdx + 1), el.slice(yearIdx + 3)];
      } else if (el.includes("년 -") && el.length === yearIdx + 3) {
        target = [el.slice(0, yearIdx + 1)];
      } else if (
        el.includes("년 ") &&
        yearIdx <= 8 &&
        el.length > yearIdx + 2
      ) {
        if (el[0] + el[1] === "기원" || !isNaN(Number(el[0]))) {
          target = [el.slice(0, yearIdx + 1), el.slice(yearIdx + 2)];
        } else {
          target = [el];
        }
      } else if (
        el.includes("년 ") &&
        yearIdx <= 8 &&
        el.length === yearIdx + 2
      ) {
        target = [el.slice(0, yearIdx + 1)];
      } else if (el.includes("년") && yearIdx <= 8 && el.length > yearIdx + 1) {
        target = [el.slice(0, yearIdx + 1), el.slice(yearIdx + 1)];
      } else if (
        el.includes("년") &&
        yearIdx <= 8 &&
        el.length === yearIdx + 1
      ) {
        target = [el.slice(0, yearIdx + 1)];
      } else {
        target = [el];
      }
      result.push(target);
    });

    return result;
  };

  const mergeData = (arr: string[][]): [string?, string[]?][] => {
    let result: [string?, string[]?][] = [];
    let combinedData: undefined | [string?, string[]?];
    let contentsData: undefined | string[];

    for (let i = 0; i < arr.length; i++) {
      if (arr[i].length === 1 && arr[i][0].length <= 9) {
        combinedData = [arr[i][0]];
      } else if (arr[i].length === 1 && arr[i][0].length > 9) {
        contentsData
          ? contentsData.push(arr[i][0])
          : (contentsData = [arr[i][0]]);
      } else if (arr[i].length !== 1) {
        if (combinedData && combinedData[0] === arr[i][0]) {
          contentsData
            ? contentsData.push(arr[i][1])
            : (contentsData = [arr[i][1]]);
          continue;
        } else if (combinedData) {
          combinedData.push(contentsData);
          result.push(combinedData);
          combinedData = undefined;
          contentsData = undefined;
        }

        combinedData = [arr[i][0]];
        contentsData = [arr[i][1]];
      }

      if (i === arr.length - 1) {
        if (contentsData) {
          combinedData.push(contentsData);
          result.push(combinedData);
        }
      }
    }

    return result;
  };

  const saveData = async (
    eventArr: [string?, string[]?][],
    dateId: Wiki_daily,
    category: string
  ) => {
    try {
      for (let yearly of eventArr) {
        const year: string = yearly[0];
        const events: string = JSON.stringify(yearly[1]);

        let oneCase;
        switch (category) {
          case "issue":
            oneCase = new Wiki_issue();
            break;
          case "birth":
            oneCase = new Wiki_birth();
            break;
          case "death":
            oneCase = new Wiki_death();
            break;
        }
        oneCase.year = year;
        oneCase.event = events;
        oneCase.date = dateId;
        await oneCase.save();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const curMonth = new Date(2020, 0, date).getMonth() + 1;
  const curDate = new Date(2020, 0, date).getDate();
  const targetDate = encodeURI(`${curMonth}월_${curDate}일`);

  const result = [];

  try {
    const wiki_scrape = await axios.get(
      `https://ko.wikipedia.org/wiki/${targetDate}`
    );

    let $ = cheerio.load(wiki_scrape.data);

    $("ul", ".mw-parser-output").each((idx, el) => {
      let isYear =
        !isNaN(Number($(el).text()[0])) &&
        $(el).text().indexOf("년") >= 0 &&
        $(el).text().indexOf("년") <= 4;
      let isBC = $(el).text()[0] + $(el).text()[1] === "기원";
      if (isYear || isBC) {
        if (
          result.length === 0 ||
          !result[result.length - 1].includes($(el).text())
        ) {
          result.push($(el).text());
        }
      }
    });

    let issue = undefined;

    if (result[result.length - 4]) {
      issue = mergeData(trimData(result[result.length - 4].split("\n")));
    }

    let culture = mergeData(trimData(result[result.length - 3].split("\n")));
    let birth = mergeData(trimData(result[result.length - 2].split("\n")));
    let death = mergeData(trimData(result[result.length - 1].split("\n")));
    let issue_culture: [string?, string[]?][] = [];

    if (issue) {
      let i = 0,
        j = 0;

      while (i < issue.length || j < culture.length) {
        let issueYear: number = Number.MAX_SAFE_INTEGER;
        let cultureYear: number = Number.MAX_SAFE_INTEGER;

        if (i === issue.length) {
          cultureYear = Number(
            culture[j][0].slice(0, culture[j][0].length - 1)
          );
        } else if (j === culture.length) {
          issueYear = Number(issue[i][0].slice(0, issue[i][0].length - 1));
        } else {
          issueYear = Number(issue[i][0].slice(0, issue[i][0].length - 1));
          cultureYear = Number(
            culture[j][0].slice(0, culture[j][0].length - 1)
          );
        }

        if (issueYear < cultureYear) {
          issue_culture.push(issue[i]);
          i++;
        } else if (issueYear > cultureYear) {
          issue_culture.push(culture[j]);
          j++;
        } else {
          issue_culture.push([issue[i][0], issue[i][1].concat(culture[j][1])]);
          i++;
          j++;
        }
      }
    } else {
      issue_culture = culture.slice();
    }

    const dailyIssue = await getRepository(Wiki_daily)
      .createQueryBuilder("wiki_daily")
      .where("wiki_daily.date = :date", { date: `${curMonth}-${curDate}` })
      .andWhere("wiki_daily.fieldName = :fieldName", { fieldName: "issue" })
      .getOne();

    const dailyBirth = await getRepository(Wiki_daily)
      .createQueryBuilder("wiki_daily")
      .where("wiki_daily.date = :date", { date: `${curMonth}-${curDate}` })
      .andWhere("wiki_daily.fieldName = :fieldName", { fieldName: "birth" })
      .getOne();

    const dailyDeath = await getRepository(Wiki_daily)
      .createQueryBuilder("wiki_daily")
      .where("wiki_daily.date = :date", { date: `${curMonth}-${curDate}` })
      .andWhere("wiki_daily.fieldName = :fieldName", { fieldName: "death" })
      .getOne();

    await saveData(issue_culture, dailyIssue, "issue");
    await saveData(birth, dailyBirth, "birth");
    await saveData(death, dailyDeath, "death");

    console.log("completed seed wiki", date);
  } catch (e) {
    console.log("에러날짜", date);
    console.log(e);
    console.log("에러날짜", date);
  }
};

export = wiki;
