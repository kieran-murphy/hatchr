import { createRouteHandler } from "uploadthing/server";
import { ourFileRouter } from "$lib/server/uploadthing";

const handlers = createRouteHandler({
  router: ourFileRouter,
});

export const GET = handlers;
export const POST = handlers;