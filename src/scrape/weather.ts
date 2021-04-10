import axios from "axios";
import cheerio from "cheerio";
import iconv from "iconv-lite";

const weather = async (yyyy: number, mm: number, dd: number): Promise<any> => {
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

  const W_scrape = await axios({
    url: `http://www.weather.go.kr/weather/climate/past_cal.jsp?${area}&yy=${yyyy}&mm=${mm}&obs=9`,
    method: "GET",
    responseType: "arraybuffer",
  });

  const T_scrape = await axios({
    url: `http://www.weather.go.kr/weather/climate/past_cal.jsp?${area}&yy=${yy}&mm=${mm}&obs=1`,
    method: "GET",
    responseType: "arraybuffer",
  });

  let W_stoneData = htmlDecode(W_scrape.data);
  let T_stoneData = htmlDecode(T_scrape.data);
  let refineData = [];

  for (let i = 0; i < W_stoneData.length; i = i + 2) {
    let date = W_stoneData[i].split("\n");
    let weat = W_stoneData[i + 1].split("\n");
    let temp = T_stoneData[i + 1].split("\n");

    date.forEach((el, idx) => {
      let date = el.trim();

      if (date !== "") {
        refineData.push([
          date,
          discWeather(weat[idx].trim()),
          discTemperature(temp[idx].trim()),
        ]);
      }
    });
  }
};

export = weather;
