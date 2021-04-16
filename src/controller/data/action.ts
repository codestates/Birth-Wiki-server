import { getRepository } from "typeorm";
import { Wiki_weather } from "../../entity/Wiki_weather";
import { Wiki_movie } from "../../entity/Wiki_movie";
import { RecordCard } from "../../entity/RecordCard";
import { Wiki_birth } from "../../entity/Wiki_birth";
import { Wiki_daily } from "../../entity/Wiki_daily";
import { Wiki_death } from "../../entity/Wiki_death";
import { Wiki_issue } from "../../entity/Wiki_issue";
import { Wiki_music } from "../../entity/Wiki_music";
import { User } from "../../entity/User";
import coverImg from "../../scrape/dailyImg";

export = async (req, res) => {
  const { nickName, accessToken } = req.body;

  const getData = async (likeIdArr, field) => {
    if (likeIdArr.length === 0) {
      return null;
    }

    let repo;
    let card: [string?, string[]?] = [];
    let cards: [string, [string?, string[]?]?] = [likeIdArr[0]];
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
        case "music":
        repo = Wiki_music;
        break;
        case "movie":
        repo = Wiki_movie;
        break;
    }

    try {
      for (let i = 1; i < likeIdArr.length; i++) {
        const stone: any[] = await getRepository(repo)
          .createQueryBuilder(`wiki_${field}`)
          .where(`wiki_${field}.date = :date`, { date: likeIdArr[i] })
          .getMany();
        if (stone) {
          stone.forEach((event) => {
            card.push([event.year, JSON.parse(event.event)]);
          });
          cards.push(card);
          card = [];
        }
      }
      return cards;
    } catch {
      console.log("데이터 조회 에러");
    }
  };

  const dailyLikeId = await getRepository(User)
    .createQueryBuilder("user")
    .where("user.nickName = :nickName", { nickName })
    .leftJoinAndSelect("user.dailys", "wiki_daily")
    .getOne();

  const likeIssue = [];
  const likeBirth = [];
  const likeDeath = [];
  const likeMusic = [];
  const likeMovie = [];

  dailyLikeId.dailys.forEach((date) => {
    switch (date.fieldName) {
      case "issue":
        likeIssue[0] = date.image;
        likeIssue.push(date.id);
        break;
      case "birth":
        likeBirth[0] = date.image;
        likeBirth.push(date.id);
        break;
      case "death":
        likeDeath[0] = date.image;
        likeDeath.push(date.id);
        break;
      case "music":
        likeMusic[0] = date.image;
        likeMusic.push(date.id);
        break;
      case "movie":
        likeMovie[0] = date.image;
        likeMovie.push(date.id);
        break;
    }
  });

  const issueCards = await getData(likeIssue, "issue");
  const birthCards = await getData(likeBirth, "birth");
  const deathCards = await getData(likeDeath, "death");
  //const musicCards = await getData(likeMusic, "music");
  //const movieCards = await getData(likeMovie, "movie");

  const recordCards = await getRepository(User)
    .createQueryBuilder("user")
    .where("user.nickName = :nickName", { nickName })
    .leftJoinAndSelect("user.cards", "action_card")
    .getOne();

  //issue birth death 배열 만들기 [img, dateID, dateID, ...]
  //반복문 - dateID로 해당 카드 정보 가져오기
  //위키 아이디랑 필드명을 가지고 또 검색??을 해야한다
  res.send({
    issueCards,
    birthCards,
    deathCards,
    //musicCards,
    //movieCards,
    recordCards: recordCards.cards,
  });
};
