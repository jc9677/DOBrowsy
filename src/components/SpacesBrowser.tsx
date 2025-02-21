import { useState } from 'react';
import { SpacesService, type S3Object } from '../services/SpacesService';

interface Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
}

export function SpacesBrowser() {
  const [objects, setObjects] = useState<S3Object[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Config>({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'tor1',
    bucketName: ''
  });
  const [isConfigured, setIsConfigured] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const service = new SpacesService();
    
    try {
      service.initialize(config);
      const objectList = await service.listObjects(config.bucketName);
      setObjects(objectList);
      setIsConfigured(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load objects');
      setObjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div>Loading objects...</div>;
  
  return (
    <div className="spaces-browser">
      <h2>DigitalOcean Spaces Browser</h2>
      
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
          <div>
            <label htmlFor="bucketName">Bucket Name:</label>
            <input
              type="text"
              id="bucketName"
              name="bucketName"
              value={config.bucketName}
              onChange={handleChange}
              required
            />
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
          ) : objects.length === 0 ? (
            <div>
              No objects found in bucket
              <button onClick={() => setIsConfigured(false)}>Reconfigure</button>
            </div>
          ) : (
            <>
              <button onClick={() => setIsConfigured(false)} className="reconfigure-btn">
                Reconfigure
              </button>
              <ul className="bucket-list">
                {objects.map(obj => (
                  <li key={obj.Key} className="bucket-item">
                    {obj.Key}
                    {obj.LastModified && (
                      <span className="object-date"> - {new Date(obj.LastModified).toLocaleString()}</span>
                    )}
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