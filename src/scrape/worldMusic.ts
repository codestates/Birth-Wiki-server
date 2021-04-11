import axios from "axios";
import cheerio from "cheerio";

const WMusic = async (yyyy: number, mm: number, dd: number): Promise<any> => {
  let date = `${yyyy}-${mm}-${dd}`;
  let a:any = new Date(yyyy, mm, dd)
  let b:any = new Date(1958, 8, 2)
  if (a-b < 0) {
   // res.send("no data");
  } else {
    const M_scrape = await axios({
      url: `https://www.billboard.com/charts/hot-100/${date}`,
    });

    const $ = cheerio.load(M_scrape.data);
    const title = $(
      ".chart-element__information__song",
      ".chart-element__wrapper"
    ).html();
    const poster = $(".chart-element__wrapper").html();
    const posterURL = poster.split("</span>");
    const start = posterURL[posterURL.length - 2].indexOf("(") + 2;
    const end = posterURL[posterURL.length - 2].indexOf(")") - 1;
  }
};

export = WMusic;
