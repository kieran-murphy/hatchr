import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  creatureImage: f({ image: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ file }) => {
      // Return the file URL so we can save it in the DB
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;