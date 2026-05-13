import { onRequest, onRequestPost } from "../functions/api/admin.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/admin") {
      if (request.method === "POST") {
        return onRequestPost({ request, env });
      }

      return onRequest({ request, env });
    }

    return env.ASSETS.fetch(request);
  },
};
