import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { s3Config } from "../config";
import type { Readable } from "stream";

const { endpoint, accessKeyId, secretAccessKey, bucket } = s3Config;
const client = new S3Client({
  endpoint,
  region: "US",
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function upload(file: string, stream: Readable) {
  const req = new Upload({
    client,
    params: {
      Key: file,
      Bucket: bucket,
      Body: stream,
      ACL: "public-read",
      ContentType: "image/png",
    },
  });
  return req.done();
}
