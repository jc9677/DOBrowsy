import { useState, useEffect } from 'react';
import { SpacesService } from '../services/SpacesService';

interface Bucket {
  Name?: string;
  CreationDate?: string;
}

export function SpacesBrowser() {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const service = new SpacesService();
    
    const loadBuckets = async () => {
      try {
        service.initialize({
          accessKeyId: import.meta.env.VITE_DO_ACCESS_KEY_ID,
          secretAccessKey: import.meta.env.VITE_DO_SECRET_ACCESS_KEY
        });
        
        const bucketList = await service.listBuckets();
        setBuckets(bucketList);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load buckets');
        setBuckets([]);
      } finally {
        setLoading(false);
      }
    };

    loadBuckets();
  }, []);

  if (loading) return <div>Loading buckets...</div>;
  
  return (
    <div className="spaces-browser">
      <h2>DigitalOcean Spaces</h2>
      {error ? (
        <div className="error-message">{error}</div>
      ) : buckets.length === 0 ? (
        <div>No buckets found</div>
      ) : (
        <ul className="bucket-list">
          {buckets.map(bucket => (
            <li key={bucket.Name} className="bucket-item">
              {bucket.Name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}