import { S3Client, ListBucketsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

interface Credentials {
  accessKeyId: string;
  secretAccessKey: string;
}

export class SpacesService {
  private client: S3Client | null = null;

  initialize(credentials: Credentials) {
    this.client = new S3Client({
      endpoint: "https://nyc3.digitaloceanspaces.com",
      region: "us-east-1",
      credentials
    });
  }

  async listBuckets() {
    if (!this.client) throw new Error("Client not initialized");
    const command = new ListBucketsCommand({});
    const response = await this.client.send(command);
    return response.Buckets || [];
  }

  async listObjects(bucket: string, prefix: string = "") {
    if (!this.client) throw new Error("Client not initialized");
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix
    });
    const response = await this.client.send(command);
    return response.Contents || [];
  }
}