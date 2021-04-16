import { createConnection } from "typeorm";
import wiki from "./wiki";
import weather from "./weather";
import KMovie from "./koreaMovie";
import WMovie from "./worldMovie";
import KMusic from "./koreaMusic";
import WMusic from "./worldMusic";
import coverImg from "./coverImg";
import { image } from "../types";

const seed = async () => {
  try {
    const connection = await createConnection();
    console.log("connected");

    let curYear = new Date().getFullYear();
    let curMonth = new Date().getMonth() + 1;
    let curDay = new Date().getDate();
    let lastWeek = new Date(curYear, curMonth - 1, curDay - 7).getTime();

    let publicIMG: image[] = await coverImg();

    for (let i = 1; i < 367; i++) {
      await wiki(i, publicIMG[i - 1]);
      await new Promise((resolve) => setTimeout(resolve, 1));
    }

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

    for (let i = 1977; i > -1; i++) {
      if (i > curYear) {
        break;
      } else {
        await WMovie(i);
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
    }

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

    console.log("func escape");
    await connection.close();
    console.log("disconnected");
  } catch (e) {
    console.log(e);
  }
};

seed();
