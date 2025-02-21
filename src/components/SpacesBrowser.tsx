import { useState } from 'react';
import { SpacesService, type Bucket } from '../services/SpacesService';

interface Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

export function SpacesBrowser() {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Config>({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'tor1' // Updated default region to tor1
  });
  const [isConfigured, setIsConfigured] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const service = new SpacesService();
    
    try {
      service.initialize(config);
      const bucketList = await service.listBuckets();
      setBuckets(bucketList);
      setIsConfigured(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load buckets');
      setBuckets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div>Loading buckets...</div>;
  
  return (
    <div className="spaces-browser">
      <h2>DigitalOcean Spaces</h2>
      
      {!isConfigured ? (
        <form onSubmit={handleSubmit} className="config-form">
          <div>
            <label htmlFor="accessKeyId">Access Key ID:</label>
            <input
              type="password"
              id="accessKeyId"
              name="accessKeyId"
              value={config.accessKeyId}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="secretAccessKey">Secret Access Key:</label>
            <input
              type="password"
              id="secretAccessKey"
              name="secretAccessKey"
              value={config.secretAccessKey}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="region">Region:</label>
            <select
              id="region"
              name="region"
              value={config.region}
              onChange={handleChange}
              required
            >
              <option value="tor1">Toronto (TOR1)</option>
              <option value="nyc3">New York (NYC3)</option>
              <option value="ams3">Amsterdam (AMS3)</option>
              <option value="sgp1">Singapore (SGP1)</option>
              <option value="sfo3">San Francisco (SFO3)</option>
              <option value="fra1">Frankfurt (FRA1)</option>
            </select>
          </div>
          <button type="submit">Connect</button>
        </form>
      ) : (
        <>
          {error ? (
            <div className="error-message">
              {error}
              <button onClick={() => setIsConfigured(false)}>Reconfigure</button>
            </div>
          ) : buckets.length === 0 ? (
            <div>
              No buckets found
              <button onClick={() => setIsConfigured(false)}>Reconfigure</button>
            </div>
          ) : (
            <>
              <button onClick={() => setIsConfigured(false)} className="reconfigure-btn">
                Reconfigure
              </button>
              <ul className="bucket-list">
                {buckets.map(bucket => (
                  <li key={bucket.Name} className="bucket-item">
                    {bucket.Name}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}