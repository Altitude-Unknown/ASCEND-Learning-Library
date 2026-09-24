import {readFileSync, existsSync} from 'node:fs';
import {resolve} from 'node:path';
export const localPreview = process.env.ASCEND_LOCAL_MATERIALS === '1';
export const materials = JSON.parse(readFileSync(new URL('../content/_data/materials.json', import.meta.url)));
export const materialSource = asset => resolve(asset.derived ? 'artifacts/reading-copies' : 'ASCEND-Materials', asset.source);
export const formatSize = bytes => bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MiB` : `${Math.max(1, Math.round(bytes / 1024))} KiB`;
export function assetFiles(ids = []) {
 return ids.map(id => {
  const asset = materials.find(a => a.id === id);
  if (!asset) throw new Error(`Unknown material asset: ${id}`);
  if (asset.publicUrl && !asset.publicUrl.startsWith('https://')) throw new Error(`Expected public HTTPS URL for ${id}`);
  const local = localPreview && existsSync(materialSource(asset));
  const url = asset.hostedLocally ? '/' + asset.localPath : asset.publicUrl || (local ? '/' + asset.localPath : '');
  return {...asset, url, fileSize: formatSize(asset.bytes), previewOnly: !asset.hostedLocally && !asset.publicUrl && !!url};
 });
}
export function availability(resource) {
 const data = resource.data || resource;
 if (data.delivery === 'web') return data.status || 'Available';
 return data.assetIds?.length ? (assetFiles(data.assetIds).some(a => a.url) ? 'Available' : 'Downloads coming soon') : data.status;
}
