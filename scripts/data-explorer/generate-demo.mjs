import {mkdirSync,writeFileSync} from 'node:fs';
import {checksum,FIELDS,PARAMETERS,csvCell} from '../../src/data/core.js';
const directory='public/assets/data/demo';mkdirSync(directory,{recursive:true});
const missions=[],observations=[];const organizations=[{id:'10000000-0000-4000-8000-000000000001',name:'DEMO Western Institution'},{id:'10000000-0000-4000-8000-000000000002',name:'DEMO Central Institution'}];
const teams=organizations.map((o,i)=>({id:`20000000-0000-4000-8000-00000000000${i+1}`,name:`DEMO Team ${i+1}`,organization_id:o.id,institution:o.name}));
const specs=[['fixed_wing_uas','Fixed-wing survey',45.67,-111.05,1500,0],['hab','Balloon ascent',40.0,-105.25,1600,0],['radiosonde','Radiosonde profile',36.1,-97.5,350,1]];
for(const [index,spec] of specs.entries()){
 const [type,label,lat,lon,base,teamIndex]=spec,team=teams[teamIndex];
 const id=`30000000-0000-4000-8000-00000000000${index+1}`,fileId=`40000000-0000-4000-8000-00000000000${index+1}`;
 const mission={id,name:'DEMO / SYNTHETIC — '+label,mission_date:'2026-06-15',description:'Mathematically generated demonstration. Not real ASCEND measurements or participating institutions.',synthetic:true,latitude:lat,longitude:lon,team_id:team.id,team:team.name,organization_id:team.organization_id,institution:team.institution,data_license:'CC0-1.0 (synthetic demonstration only)',platforms:[{id:`50000000-0000-4000-8000-00000000000${index+1}`,type,name:'DEMO '+label}]};
 missions.push(mission);const rows=[];
 for(let i=0;i<90;i++) {
  const rise=type==='fixed_wing_uas'?80+20*Math.sin(i/8):i*(type==='hab'?250:180);
  const position=type==='fixed_wing_uas'?[lat+.015*Math.sin(i/10),lon+.025*Math.cos(i/10)]:[lat+i*.004,lon+i*.008];
  const temperature=15-.0065*rise;
  rows.push({id:String(index*1000+i+1),mission_id:id,mission:mission.name,synthetic:true,team_id:team.id,team:team.name,organization_id:team.organization_id,institution:team.institution,platform:mission.platforms[0].name,platform_type:type,sensor:'DEMO atmospheric sensor package',source_file_id:fileId,source_row:i+2,parser_version:'synthetic-generator/1.0.0',data_license:mission.data_license,timestamp_utc:new Date(Date.UTC(2026,5,15,12,index*10,i*60)).toISOString(),latitude:position[0],longitude:position[1],altitude_msl_m:base+rise,altitude_agl_m:rise,values:{pm1_ugm3:2+Math.sin(i/12),pm25_ugm3:5+3*Math.sin(i/12),pm10_ugm3:8+4*Math.sin(i/12),temperature_c:temperature,relative_humidity_pct:45+20*Math.sin(i/30),pressure_hpa:1013.25*Math.exp(-(base+rise)/8500),wind_speed_ms:4+rise/1500,wind_direction_deg:(180+i)%360},qc:[],raw:{}});
 }
 const csv=[FIELDS.join(','),...rows.map(r=>FIELDS.map(f=>csvCell(f==='project'?'ASCEND DEMO / SYNTHETIC':f==='qc_flag'?'SYNTHETIC':r.values[f]??r[f])).join(','))].join('\r\n')+'\r\n';
 const sha=await checksum(new TextEncoder().encode(csv));for(const r of rows)r.source_sha256=sha;
 writeFileSync(`${directory}/${type}.csv`,csv);observations.push(...rows);
}
writeFileSync(`${directory}/dataset.json`,JSON.stringify({synthetic:true,description:'DEMO / SYNTHETIC. No real ASCEND measurements.',organizations,teams,missions,parameters:PARAMETERS,observations},null,2)+'\n');
writeFileSync('public/assets/data/ascend-template.csv',FIELDS.join(',')+'\r\n');
console.log('Generated three clearly labeled synthetic missions and CSV template.');
