import * as maplibregl from 'maplibre-gl';
maplibregl.setWorkerUrl('/assets/data/dist/maplibre-gl-worker.mjs');
export const PALETTE=['#440154','#31688e','#35b779','#fde725'];
export function color(value,min,max){if(value==null)return '#66757b';return PALETTE[Math.min(3,Math.max(0,Math.floor((value-min)/((max-min)||1)*3.999)))];}
export function createMap(element,onPoint,onExtent,onMission) {
 let map;const markers=[];let pending=null;let ready=false;
 try {
  map=new maplibregl.Map({container:element,center:[-98,39],zoom:3,attributionControl:true,style:{version:8,sources:{land:{type:'geojson',data:'/assets/data/dist/land.geojson',attribution:'Natural Earth · public domain'}},layers:[{id:'water',type:'background',paint:{'background-color':'#e6eff3'}},{id:'land',type:'fill',source:'land',paint:{'fill-color':'#f5f4eb','fill-outline-color':'#a6b9b5'}}]}});
  map.addControl(new maplibregl.NavigationControl({showCompass:false}));
  map.getCanvas().setAttribute('aria-label','Mission map. Use arrow keys to pan and plus or minus to zoom. Observation table provides equivalent point selection.');
  map.on('load',()=>{
   ready=true;map.addSource('track',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
   map.addLayer({id:'track-lines',type:'line',source:'track',filter:['==',['geometry-type'],'LineString'],paint:{'line-color':['get','color'],'line-width':4}});
   map.addLayer({id:'track-points',type:'circle',source:'track',filter:['==',['geometry-type'],'Point'],paint:{'circle-color':['get','color'],'circle-radius':5,'circle-stroke-width':1,'circle-stroke-color':'#102f3a'}});
   map.on('click','track-points',e=>onPoint?.(Number(e.features[0].properties.index)));
   if(pending)draw(...pending);
  });
  let timer;map.on('moveend',()=>{clearTimeout(timer);timer=setTimeout(()=>onExtent?.(),300);});
  map.on('error',()=>{element.dataset.mapError='true';});
 }catch{element.textContent='Interactive map unavailable in this browser. Use the mission selector and observation table below.';}
 function draw(rows,parameter) {
  pending=[rows,parameter];if(!ready)return;
  const values=rows.map(r=>r.values[parameter]).filter(v=>v!=null),min=Math.min(...values),max=Math.max(...values);
  const features=[];
  rows.forEach((r,index)=>{
   if(r.latitude==null||r.longitude==null)return;
   const properties={index,color:color(r.values[parameter],min,max)};
   features.push({type:'Feature',properties,geometry:{type:'Point',coordinates:[r.longitude,r.latitude]}});
   const previous=rows[index-1];
   if(previous?.latitude!=null&&previous.longitude!=null&&previous.source_file_id===r.source_file_id&&r.source_row===previous.source_row+1&&!r.qc?.some(q=>['gps_jump','time_order'].includes(q.code)))features.push({type:'Feature',properties,geometry:{type:'LineString',coordinates:[[previous.longitude,previous.latitude],[r.longitude,r.latitude]]}});
  });
  map.getSource('track').setData({type:'FeatureCollection',features});
 }
 return {
  draw,
  extent(){if(!map)return null;const b=map.getBounds();return [Math.max(-180,b.getWest()),Math.max(-90,b.getSouth()),Math.min(180,b.getEast()),Math.min(90,b.getNorth())];},
  missions(list){markers.splice(0).forEach(m=>m.remove());if(!map)return;for(const m of list){if(m.longitude==null||m.latitude==null)continue;const button=document.createElement('button');button.type='button';button.className='mission-marker';button.textContent='●';button.setAttribute('aria-label',m.name);button.title=m.name;button.addEventListener('click',()=>onMission?.(m.id));markers.push(new maplibregl.Marker({element:button}).setLngLat([m.longitude,m.latitude]).addTo(map));}},
  focus(m){if(map&&m.longitude!=null&&m.latitude!=null)map.jumpTo({center:[m.longitude,m.latitude],zoom:m.platforms?.some(p=>p.type==='fixed_wing_uas')?10:7});},
  fit(rows){const valid=rows.filter(r=>r.latitude!=null&&r.longitude!=null);if(!map||!valid.length)return;const bounds=new maplibregl.LngLatBounds();valid.forEach(r=>bounds.extend([r.longitude,r.latitude]));map.fitBounds(bounds,{padding:40,maxZoom:13,duration:0});},
  reset(){map?.jumpTo({center:[-98,39],zoom:3});}
 };
}
