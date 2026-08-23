import { type Data } from "./types";
// 默认数据
export const DEFAULT_DATA: Data = {
  user: {
    position: "",
    name: "",
    birthday: "",
    phone: "",
    email: "",
    workTime: "",
    sex: "",
  },
  account: [],
  skill: "",
  education: [
    {
      name: "",
      education: "",
      post: "",
      time: ["", ""],
      content: "",
      mode: "",
    },
  ],
  work: [
    {
      name: "",
      post: "",
      time: ["", ""],
      content: "",
    },
  ],
  project: [
    {
      name: "",
      post: "",
      time: ["", ""],
      content: "",
    },
  ],
};
