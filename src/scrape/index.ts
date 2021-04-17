import { createConnection } from "typeorm";
import wiki from "./wiki";
import weather from "./weather";
import KMovie from "./koreaMovie";
import WMovie from "./worldMovie";
import KMusic from "./koreaMusic";
import WMusic from "./worldMusic";
import dailyImg from "./dailyImg";
import weeklyImg from "./weeklyImg";

const seed = async () => {
  try {
    let curYear = new Date().getFullYear();
    let curMonth = new Date().getMonth() + 1;
    let curDay = new Date().getDate();
    let lastWeek = new Date(curYear, curMonth - 1, curDay - 7).getTime();

    const connection1 = await createConnection();
    console.log("connected");
    console.log("start seed image");
    await dailyImg();
    await weeklyImg();
    console.log("completed seed image");
    await connection1.close();

    const connection2 = await createConnection();
    console.log("connected");
    console.log("start seed wiki");
    for (let i = 1; i < 367; i++) {
      await wiki(i);
      await new Promise((resolve) => setTimeout(resolve, 1));
    }
    console.log("completed seed wiki");
    await connection2.close();

    const connection3 = await createConnection();
    console.log("connected");
    console.log("start seed weather");
    for (let i = 0; i > -1; i++) {
      let targetYear = new Date(1960, i).getFullYear();
      let targetMonth = new Date(1960, i).getMonth() + 1;

      if (curYear === targetYear && curMonth + 1 === targetMonth) {
        break;
      } else {
        await weather(targetYear, targetMonth);
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
    }
    console.log("completed seed weather");
    await connection3.close();

    const connection4 = await createConnection();
    console.log("connected");
    console.log("start seed Kmovie");
    for (let i = 10; i > -1; i = i + 7) {
      let targetYear = new Date(2003, 11, i).getFullYear();
      let targetMonth = new Date(2003, 11, i).getMonth() + 1;
      let targetDay = new Date(2003, 11, i).getDate();

      if (lastWeek - new Date(2003, 11, i).getTime() < 0) {
        break;
      } else {
        await KMovie(targetYear, targetMonth, targetDay);
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
    }
    console.log("completed seed Kmovie");
    await connection4.close();

    const connection5 = await createConnection();
    console.log("connected");
    console.log("start seed Wmovie");
    for (let i = 1977; i > -1; i++) {
      if (i > curYear) {
        break;
      } else {
        await WMovie(i);
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
    }
    console.log("completed seed Wmovie");
    await connection5.close();

    const connection6 = await createConnection();
    console.log("connected");
    console.log("start seed Wmusic");
    for (let i = 4; i > -1; i = i + 140) {
      if (lastWeek - new Date(1958, 7, i).getTime() < 0) {
        break;
      }

      for (let j = 0; j < 20; j++) {
        let targetYear = new Date(1958, 7, i + j * 7).getFullYear();
        let targetMonth = new Date(1958, 7, i + j * 7).getMonth() + 1;
        let targetDay = new Date(1958, 7, i + j * 7).getDate();

        if (lastWeek - new Date(1958, 7, i + j * 7).getTime() < 0) {
          break;
        } else {
          await WMusic(targetYear, targetMonth, targetDay);
          await new Promise((resolve) => setTimeout(resolve, 1));
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 70000));
    }
    console.log("completed seed Wmovie");
    await connection6.close();

    const connection7 = await createConnection();
    console.log("connected");
    console.log("start seed Kmusic");
    for (let i = 1; i > -1; i = i + 7) {
      let targetYear = new Date(2010, 0, i).getFullYear();
      let targetMonth = new Date(2010, 0, i).getMonth() + 1;
      let targetDay = new Date(2010, 0, i).getDate();

      if (lastWeek - new Date(2010, 0, i).getTime() < 0) {
        break;
      } else {
        await KMusic(targetYear, targetMonth, targetDay);
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
    }
    console.log("completed seed Kmusic");
    await connection7.close();

    console.log("completed seed all");
  } catch (e) {
    console.log(e);
  }
};

//seed();
