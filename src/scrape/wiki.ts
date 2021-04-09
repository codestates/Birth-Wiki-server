import axios from "axios";
import cheerio from "cheerio";

const wiki = async (mm: number, dd: number): Promise<any> => {
  const trimData = (arr: string[]): (string | string[])[] => {
    return arr.map((el: string) => {
      let target: string[] = el.split(" - ");

      if (target.length === 1 && target[0].length <= 8) {
        const yearIdx: number = target[0].indexOf("년");
        target[0] = target[0].slice(0, yearIdx + 1);
      }

      return target;
    });
  };

  const mergeData = (arr: (string | string[])[]): (string | string[])[][] => {
    let result: (string | string[])[][] = [];
    let combinedData: undefined | (string | string[])[];
    let contentsData: undefined | string[];

    arr.forEach((el, idx) => {
      if (el.length === 1 && el[0].length > 5) {
        contentsData ? contentsData.push(el[0]) : (contentsData = [el[0]]);
      } else {
        if (combinedData) {
          combinedData.push(contentsData);
          result.push(combinedData);
          combinedData = undefined;
          contentsData = undefined;
        }

        el.length === 2
          ? result.push([el[0], [el[1]]])
          : (combinedData = [el[0]]);
      }

      idx === arr.length - 1 && combinedData && result.push(combinedData);
    });

    return result;
  };

  const date = encodeURI(`${mm}월_${dd}일`);

  const data = await axios.get(`https://ko.wikipedia.org/wiki/${date}`);

  const result = [];
  const $ = cheerio.load(data.data);
  $("ul", ".mw-parser-output").each((idx, el) => {
    if (!isNaN(Number($(el).text()[0]))) {
      result.push($(el).text());
    }
  });

  let issue = mergeData(trimData(result[1].split("\n")));
  let culture = mergeData(trimData(result[2].split("\n")));
  let birth = mergeData(trimData(result[3].split("\n")));
  let death = mergeData(trimData(result[4].split("\n")));

  return { issue, culture, birth, death };
};

export = wiki