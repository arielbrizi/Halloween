"""Convert downloaded Overpass geometry into compact local, attributed game data.
Input raw files are obtained from the query documented in assets/maps/SOURCES.md.
No network is used by this converter or by the game.
"""
import json, math, pathlib, hashlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
SPOTS=[('recoleta',-34.5881,-58.393),('obelisco',-34.603738,-58.38157),('caminito',-34.63925,-58.3629)]
for name,lat,lon in SPOTS:
 raw=ROOT/'assets/maps'/f'{name}-raw.json'
 data=json.loads(raw.read_text())
 def project(p):return [round((p['lon']-lon)*111320*math.cos(math.radians(lat)),2),round(-(p['lat']-lat)*111320,2)]
 buildings=[]; roads=[]
 for e in data['elements']:
  tags=e.get('tags',{});pts=[project(p) for p in e.get('geometry',[]) if 'lon' in p]
  if len(pts)<2:continue
  if 'building' in tags and len(pts)>3 and pts[0]==pts[-1]:
   if tags['building']=='obelisk':continue
   height=None
   try:height=float(tags.get('height','').replace(' m','').split(';')[0])
   except ValueError:pass
   try:levels=float(tags.get('building:levels',''))
   except ValueError:levels=None
   buildings.append({'id':e['id'],'points':pts,'height':height or (levels*3.2 if levels else (9 if name=='caminito' else 22)),'heightEstimated':not bool(height),'name':tags.get('name',''),'color':tags.get('building:colour',tags.get('colour',''))})
  if 'highway' in tags:
   try:width=float(tags.get('width','').split(';')[0].replace(' m',''))
   except ValueError:
    try:width=float(tags.get('lanes','2'))*3.1
    except ValueError:width=6.2
    if tags['highway'] in ['footway','path','pedestrian','steps','cycleway']:width=2.2 if name=='recoleta' else 3
    elif tags['highway']=='service':width=4
   roads.append({'id':e['id'],'points':pts,'type':tags['highway'],'name':tags.get('name',''),'width':width})
 result={'name':name,'center':[lat,lon],'source':'OpenStreetMap contributors','license':'ODbL-1.0','url':f'https://www.openstreetmap.org/#map=18/{lat}/{lon}','timestamp':data.get('osm3s',{}).get('timestamp_osm_base'),'rawSha256':hashlib.sha256(raw.read_bytes()).hexdigest(),'buildings':buildings,'roads':roads}
 (ROOT/'assets/maps'/f'{name}.json').write_text(json.dumps(result,separators=(',',':'),ensure_ascii=False))
 print(name,len(buildings),'edificios',len(roads),'calles y senderos')
