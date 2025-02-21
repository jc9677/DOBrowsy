import { S3Client, ListBucketsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

type RegionId = 'nyc3' | 'sfo3' | 'ams3' | 'sgp1';

interface Credentials {
  accessKeyId: string;
  secretAccessKey: string;
  region?: RegionId;
}

export class SpacesService {
  private client: S3Client | null = null;
  private static readonly REGIONS: Record<RegionId, string> = {
    'nyc3': 'us-east-1',
    'sfo3': 'us-west-1',
    'ams3': 'eu-west-1',
    'sgp1': 'ap-southeast-1',
  };

  initialize(credentials: Credentials) {
    const region = credentials.region || 'nyc3';
    const s3Region = SpacesService.REGIONS[region];
    
    this.client = new S3Client({
      endpoint: `https://${region}.digitaloceanspaces.com`,
      region: s3Region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
      forcePathStyle: false // Required for proper CORS support
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