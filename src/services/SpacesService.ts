import { S3Client, ListBucketsCommand, ListObjectsV2Command, PutBucketCorsCommand } from "@aws-sdk/client-s3";

type RegionId = 'nyc3' | 'sfo3' | 'ams3' | 'sgp1' | 'tor1';

interface Credentials {
  accessKeyId: string;
  secretAccessKey: string;
  region?: RegionId;
}

export class SpacesService {
  private client: S3Client | null = null;
  private static readonly REGIONS: Record<RegionId, string> = {
    'tor1': 'ca-central-1',
    'nyc3': 'us-east-1',
    'sfo3': 'us-west-1',
    'ams3': 'eu-west-1',
    'sgp1': 'ap-southeast-1',
  };

  initialize(credentials: Credentials) {
    const region = credentials.region || 'tor1';
    const s3Region = SpacesService.REGIONS[region];
    
    // Create a client for all operations including ListBuckets
    this.client = new S3Client({
      endpoint: `https://${region}.digitaloceanspaces.com`,
      region: s3Region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
      forcePathStyle: false
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

  async setCorsConfiguration(bucket: string) {
    if (!this.client) throw new Error("Client not initialized");
    
    const corsConfig = {
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "DELETE", "POST", "HEAD"],
            AllowedOrigins: ["https://jc9677.github.io"],
            MaxAgeSeconds: 3000
          }
        ]
      }
    };

    const command = new PutBucketCorsCommand(corsConfig);
    await this.client.send(command);
  }
}