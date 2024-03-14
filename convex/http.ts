import { httpRouter } from "convex/server";
import { postHttp } from "./board";

const http = httpRouter();

http.route({
  path: "/post",
  method: "POST",
  handler: postHttp,
});

export default http;
