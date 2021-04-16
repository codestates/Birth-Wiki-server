import axios from "axios";
import cheerio from "cheerio";
import iconv from "iconv-lite";
import { Wiki_weather } from "../entity/Wiki_weather";

const weather = async (year: number, month: number): Promise<any> => {
  const area = `stn=108`;

  const discWeather = (text: string): string => {
    if (text.includes("햇무리")) {
      return "햇무리";
    } else if (text.includes("달무리")) {
      return "달무리";
    } else if (text.includes("채운")) {
      return "채운";
    } else if (text.includes("우박")) {
      return "우박";
    } else if (text.includes("진눈깨비")) {
      return "진눈깨비";
    } else if (text.includes("눈")) {
      return "눈";
    } else if (text.includes("뇌전") || text.includes("천둥")) {
      return "뇌전";
    } else if (text.includes("비")) {
      return "비";
    } else if (
      text.includes("연무") ||
      text.includes("박무") ||
      text.includes("안개")
    ) {
      return "안개";
    } else {
      return "맑음";
    }
  };

  const discTemperature = (text: string): object[] => {
    let result: object[] = [];

    text.split("℃").forEach((el, idx) => {
      if (idx < 3) {
        let target = el.split(":");
        let head: string = target[0];
        let body: string = target[1] + "℃";
        let obj = {};
        obj[head] = body;
        result.push(obj);
      }
    });
    return result;
  };

  const htmlDecode = (scrapeData: Buffer): string[] => {
    const decoded = iconv.decode(scrapeData, "EUC-KR");
    const $ = cheerio.load(decoded);
    const stoneData: string[] = [];

    $("tr", "tbody").each((idx, el) => {
      if (idx >= 3) {
        stoneData.push($(el).text());
      }
    });

    return stoneData;
  };

  const saveData = async (refineData: [string, string, object[]][]) => {
    let curYear = new Date().getFullYear();
    let curMonth = new Date().getMonth() + 1;
    let curDay = new Date().getDate();

    for (let i = 0; i < refineData.length; i++) {
      let day: string = refineData[i][0];
      let pheno: string = refineData[i][1];
      let tempStr: string = JSON.stringify(refineData[i][2]);

      if (`${year}-${month}-${day}` === `${curYear}-${curMonth}-${curDay}`) {
        break;
      }

      try {
        const oneCase = new Wiki_weather();
        oneCase.date = `${year}-${month}-${day}`;
        oneCase.weather = pheno;
        oneCase.temperature = tempStr;
        await oneCase.save();
      } catch {
        console.log("저장 중 에러");
      }
    }
  };

  try {
    const W_scrape = await axios({
      url: `http://www.weather.go.kr/weather/climate/past_cal.jsp?${area}&yy=${year}&mm=${month}&obs=9`,
      method: "GET",
      responseType: "arraybuffer",
    });

    const T_scrape = await axios({
      url: `http://www.weather.go.kr/weather/climate/past_cal.jsp?${area}&yy=${year}&mm=${month}&obs=1`,
      method: "GET",
      responseType: "arraybuffer",
    });

    let W_stoneData = htmlDecode(W_scrape.data);
    let T_stoneData = htmlDecode(T_scrape.data);
    let refineData: [string, string, object[]][] = [];

    for (let i = 0; i < W_stoneData.length; i = i + 2) {
      let monthly = W_stoneData[i].split("\n");
      let weat = W_stoneData[i + 1].split("\n");
      let temp = T_stoneData[i + 1].split("\n");

      monthly.forEach((el, idx) => {
        let date = el.trim();

        if (date !== "") {
          refineData.push([
            date.slice(0, date.length - 1),
            discWeather(weat[idx].trim()),
            discTemperature(temp[idx].trim()),
          ]);
        }
      });
    }

    await saveData(refineData);
    console.log("completed seed weather", year, month);
  } catch (e) {
    console.log("에러날짜", year, month);
    console.log(e);
    console.log("에러날짜", year, month);
  }
};

export = weather;
