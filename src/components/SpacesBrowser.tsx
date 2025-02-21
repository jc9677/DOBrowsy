import { useState } from 'react';
import { SpacesService } from '../services/SpacesService';

const spacesService = new SpacesService();

type RegionId = 'nyc3' | 'sfo3' | 'ams3' | 'sgp1';

interface Region {
  id: RegionId;
  name: string;
}

const REGIONS: Region[] = [
  { id: 'nyc3', name: 'New York (NYC3)' },
  { id: 'sfo3', name: 'San Francisco (SFO3)' },
  { id: 'ams3', name: 'Amsterdam (AMS3)' },
  { id: 'sgp1', name: 'Singapore (SGP1)' },
];

export function SpacesBrowser() {
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [region, setRegion] = useState<RegionId>('nyc3');
  const [buckets, setBuckets] = useState<any[]>([]);
  const [currentBucket, setCurrentBucket] = useState('');
  const [objects, setObjects] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      spacesService.initialize({ accessKeyId, secretAccessKey, region });
      const bucketList = await spacesService.listBuckets();
      setBuckets(bucketList);
      setError('');
    } catch (err) {
      setError('Failed to connect: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleSelectBucket = async (bucket: string) => {
    try {
      setCurrentBucket(bucket);
      const objectList = await spacesService.listObjects(bucket);
      setObjects(objectList);
      setError('');
    } catch (err) {
      setError('Failed to list objects: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="spaces-browser">
      <form onSubmit={handleConnect}>
        <div>
          <input
            type="text"
            placeholder="Access Key ID"
            value={accessKeyId}
            onChange={(e) => setAccessKeyId(e.target.value)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Secret Access Key"
            value={secretAccessKey}
            onChange={(e) => setSecretAccessKey(e.target.value)}
          />
        </div>
        <div>
          <select 
            value={region} 
            onChange={(e) => setRegion(e.target.value as RegionId)}
            className="region-select"
          >
            {REGIONS.map(region => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Connect</button>
      </form>

      {error && <div className="error">{error}</div>}

      {buckets.length > 0 && (
        <div className="buckets">
          <h2>Your Spaces</h2>
          <ul>
            {buckets.map((bucket) => (
              <li key={bucket.Name}>
                <button onClick={() => handleSelectBucket(bucket.Name)}>
                  {bucket.Name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {currentBucket && (
        <div className="objects">
          <h2>Contents of {currentBucket}</h2>
          <ul>
            {objects.map((obj) => (
              <li key={obj.Key}>
                {obj.Key} ({Math.round(obj.Size / 1024)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}