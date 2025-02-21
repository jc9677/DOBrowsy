import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

interface Credentials {
  accessKeyId: string;
  secretAccessKey: string;
}

export class SpacesService {
  private client: S3Client | null = null;

  initialize(credentials: Credentials) {
    this.client = new S3Client({
      endpoint: 'https://nyc3.digitaloceanspaces.com',
      region: 'us-east-1',
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
      forcePathStyle: true
    });
  }

  async listBuckets() {
    if (!this.client) throw new Error("Client not initialized");
    
    try {
      const command = new ListBucketsCommand({});
      const response = await this.client.send(command);
      return response.Buckets || [];
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('CORS')) {
          throw new Error('CORS error: Please check your Space settings');
        }
        if (error.message.includes('credential')) {
          throw new Error('Authentication failed: Please check your access key and secret');
        }
      }
      throw new Error('Failed to list buckets. Please try again.');
    }
  }
}