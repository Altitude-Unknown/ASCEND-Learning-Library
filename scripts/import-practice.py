"""Curate the supplied practice banks without altering the intake originals.
Run from the repository root. Generated JSON and audit files are committed;
Cloudflare builds do not need the ignored intake folder or Python.
"""
import collections, copy, csv, hashlib, json, pathlib, re, shutil
ROOT = pathlib.Path(__file__).resolve().parents[1]
INTAKE = ROOT / 'Hosted-Website-Files'
SOURCE = INTAKE / 'whisky-alpha-fullsite-with-figlinks-v4'
OUT = ROOT / 'public/assets/practice'
REVIEW = ROOT / 'editorial/practice'
DATE = '2026-09-24'
FAA = 'https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/remote_pilot_study_guide.pdf'
CFR = 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-107'
REGISTER = 'https://www.faa.gov/uas/getting_started/register_drone'
AIRSPACE = 'https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap3_section_2.html'
patches = {}
def fix(id, reason, source='', **fields):
    patches[id] = dict(reason=reason, source=source, fields=fields)
# Editorial holds prevent unresolved or underspecified questions being scored.
holds = {
 'airspace_0018': 'TFR question lacks the actual restriction and effective times; generic ATC permission is not a sufficient answer.',
 'airspace_0021': 'Holton Head is not the charted airport name; location and operating altitude are ambiguous. Requires author clarification.',
 'airspace_0026': 'Near Anderson Airport does not specify a location or altitude sufficient to determine authorization.',
 'loading_0030': 'Incomplete fatigue-recognition wording; the keyed phrase does not supply a clear answer.',
 'loading_0035': 'Malformed medication question (will almost affect); several choices can impair performance.',
 'loading_0036': 'Manned-flight altitude explanation does not establish the cause of dehydration for a ground-based remote pilot.',
 'weather_0005': 'Thermal-current key selects the Lake Drummond area; the intended land-surface comparison needs clarification.',
 'weather_0038': 'Question ranks thunderstorm hazards without a defined scenario; lightning key needs subject-matter review.',
 'weather_0041': 'Squall altitude question is underspecified and its at-any-altitude key needs subject-matter review.',
 'weather_0063': 'Supplied Figure 15 mixes date groups; forecast date and interval need clarification before grading this question.',
 'regulations_0010': 'All civil operations is overbroad: Part 107 has exclusions. Needs a specific operation.',
 'regulations_0012': 'Generic manned-aircraft ATC clearance wording needs a precise Part 107 authorization scenario.',
 'regulations_0027': 'Maximum penalty claim omits other consequences and conflates administrative and criminal sanctions.',
 'regulations_0040': 'Only primary-power lithium batteries is overly restrictive; equipment batteries and hazardous-material rules need a scoped question.',
 'regulations_0042': 'Obsolete sunrise-only launch limit; current night operations are possible subject to requirements.',
 'regulations_0051': 'Automatic immediate certificate revocation claim is not a reliably stated enforcement rule.',
 'regulations_0058': 'Concert question omits aircraft category and the hazard posed by dropped objects; cannot grade a blanket prohibition.',
 'regulations_0059': 'Delivery question conflates VLOS, moving vehicles, waivers, and air-carrier operations; requires a defined scenario.',
 'regulations_0067': 'Night-lighting question has no clearly supported safe answer among the supplied options.',
 'regulations_0074': 'Responsibility for markings/declaration wording conflates applicant and operating responsibilities.',
 'operations_0009': 'Radio example suggests requesting Part 107 airspace authorization by tower radio; needs a clearly scoped communications exercise.',
 'operations_0011': 'Best interference mitigation depends on equipment and site; spectral-analyzer answer needs an operational context.'
}
fix('airspace_0003', 'Distinguish the 10 NM charted shelf from the 20 NM service outer area.', AIRSPACE,
    prompt='1305 What is the typical outer radius of the charted Class C shelf?', answerIndex=0,
    choices=['10 NM', '20 NM', '30 NM'])
fix('airspace_0030', 'Duplicate of corrected Class C shelf question.', AIRSPACE,
    prompt='1305 What is the typical outer radius of the charted Class C shelf?', answerIndex=0)
fix('airspace_0014', 'CSV incorrectly stored part of the prompt as a choice; JS retained an out-of-range answer index.',
    'https://www.faa.gov/about/office_org/headquarters_offices/ato/service_units/systemops/fs', answerIndex=2,
    choices=['By reviewing only the airport diagram.', 'By contacting the FAA district office.', 'By obtaining a Flight Service briefing that includes the applicable NOTAMs.'])
fix('airspace_0025', 'Specify the airspace immediately above the airport, not a blanket five-mile area.',
    '/assets/practice/figures/26.jpg', prompt='1083 (Refer to Figure 26, Area 5.) Immediately above Barnes County Airport, which airspace extends from the surface to the overlying Class E airspace?')
fix('airspace_0029', 'The supplied chart shows surface Class G at Fentress; remove the misleading area marker.',
    '/assets/practice/figures/20.jpg', prompt='1328 (Refer to Figure 20.) What class of airspace is immediately above the surface at Fentress NALF Airport (NFE), as depicted?', answerIndex=2)
fix('airspace_0032', 'Correct airport spelling and distinguish AGL floor from MSL ceiling.',
    '/assets/practice/figures/26.jpg', prompt='1295 (Refer to Figure 26, Area 1.) What is the Class E airspace floor above Tomlinson Airport?',
    choices=['18,000 feet MSL.', '1,200 feet AGL.', '700 feet AGL.'])
fix('airspace_0034', 'Specify low-altitude flight for the Class G route answer.',
    '/assets/practice/figures/78.jpg', prompt='1321 (Refer to Figure 78.) For an inspection below 400 feet AGL along the railroad from Blencoe to Onawa, does the depicted airspace require ATC authorization?')
fix('airspace_0040', 'A three-digit MTR includes at least one segment above 1,500 feet AGL; not necessarily the entire route.',
    'https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap3_section_5.html',
    choices=['An IFR military training route with at least one segment above 1,500 feet AGL.', 'A VFR military training route entirely above 1,500 feet AGL.', 'A VFR military training route entirely at or below 1,500 feet AGL.'])
fix('airspace_0045', 'Original choices 700 AGL and 3,823 MSL describe the same floor; request AGL and remove the equivalent distractor.',
    '/assets/practice/figures/71.jpg', prompt='1093 (Refer to Figure 71, Area 1.) In feet AGL, what is the floor of Class E airspace above Georgetown Airport (E36)?',
    choices=['The surface.', '700 feet AGL.', '1,200 feet AGL.'], answerIndex=1)
fix('loading_0031', 'Specify duration: physical/mental is also a valid classification of fatigue.', FAA,
    prompt='1257 By duration, fatigue is classified as which two types?')
fix('operations_0053', 'CSV marks acute/chronic with weight 1; JS incorrectly keyed the first choice. Also a duplicate.', FAA,
    prompt='1257 By duration, fatigue is classified as which two types?', answerIndex=2)
for id in ['loading_0037','operations_0054']:
    fix(id, 'Original wording reversed the cause and effect of hyperventilation.', FAA,
        prompt='1273 Excessive breathing during hyperventilation can produce which change in the blood?')
fix('loading_0039', 'Replace absolute removal of personal stress with a realistic mitigation.', FAA,
    choices=['Ignoring signs of stress.', 'Reducing avoidable stressors and using healthy coping strategies.', 'Increasing workload when already fatigued.'])
fix('weather_0014', 'Clarify the boundary between air masses.', FAA,
    prompt='1277 What is the boundary between air masses with different temperature and moisture characteristics called?')
fix('weather_0025', 'Specify cloud altitude above the operating terrain and ordinary Part 107 cloud clearance.', CFR+'#p-107.51(d)',
    prompt='1271 A cloud base is 800 feet above the terrain at your operating location. Without a waiver, what is the highest altitude that maintains the required vertical cloud clearance?')
fix('weather_0026', 'Specify Part 107 visibility rather than general manned VFR minima.', CFR+'#p-107.51(c)',
    prompt='1289 (Refer to Figure 23.) Without a waiver, what minimum flight visibility applies to Part 107 operations near Plantation Airport?')
fix('weather_0045', 'Original frost answer is internally contradictory; use the surface-temperature relationship.', FAA,
    choices=['The surface cools below freezing and below the dew point of the adjacent air.', 'The surface remains warmer than the dew point.', 'The surface remains above freezing.'])
fix('weather_0052', 'Performance depends on whether density altitude increases or decreases.', FAA,
    prompt='1173 All else equal, how does an increase in density altitude affect small unmanned aircraft performance?')
fix('regulations_0001', 'Part 48 is a registration rule, not the full operating framework for recreational flight.', REGISTER,
    prompt='1001 A 1,280 g (2.8 lb) recreational quadcopter is registered using the small-aircraft registration system. Which regulation governs that registration?')
fix('regulations_0004', 'Weight definition applies to the aircraft and its attached load at takeoff.', CFR+'#p-107.3',
    prompt='1004 Under Part 107, a small unmanned aircraft must weigh how much at takeoff, including everything on board or attached?')
fix('regulations_0006', 'Recreational exclusion requires compliance with the statutory exception.', CFR+'#p-107.1(b)(2)',
    choices=['Recreational flight meeting all requirements of 49 U.S.C. 44809.', 'Crop monitoring for an agricultural business.', 'UAS operation for a motion-picture filming business.'])
fix('regulations_0014', 'Use calendar-month recency wording.', CFR+'#p-107.65', choices=['Every 6 calendar months.', 'Every 12 calendar months.', 'Within the preceding 24 calendar months.'])
fix('regulations_0022', 'Correct apparent source-code typo and specify an uncertificated control manipulator.', CFR+'#p-107.12(a)(2)',
    prompt='1021 Which person must be directly supervised by a remote PIC who can immediately take control?',
    choices=['A certificated remote PIC acting alone.', 'A person manipulating the controls without the required remote pilot qualification.', 'Every visual observer, regardless of duties.'])
fix('regulations_0023', 'Supervision requires ability to immediately take direct control.', CFR+'#p-107.12(a)(2)',
    choices=['Under direct supervision of a qualified remote PIC who can immediately take direct control.', 'Only when visual observers participate in the operation.', 'Alone, if operating during daylight hours.'])
fix('regulations_0029', 'Not every accident meets the FAA reporting threshold.', CFR+'#p-107.9',
    prompt='1028 Within how many calendar days must an event meeting the reporting criteria of 14 CFR 107.9 be reported to the FAA?')
fix('regulations_0030', 'Overnight hospitalization alone does not define a serious injury; loss of consciousness is an explicit trigger.', CFR+'#p-107.9(a)',
    choices=['Any loss of consciousness.', 'Scrapes and cuts bandaged on site.', 'Minor bruises.'])
fix('regulations_0031', 'Limit the conclusion to FAA reporting under this section and state no injury.', CFR+'#p-107.9',
    prompt='1030 An sUAS damages an $800 awning that can be repaired for $400. Nobody is injured or loses consciousness, and there is no other property damage. Is an FAA report required under 14 CFR 107.9?',
    choices=['Yes, because the awning is worth more than $500.', 'Yes, because any property damage must be reported.', 'No, these facts do not meet the reporting thresholds in 107.9.'])
fix('regulations_0032', 'Remove manned-aircraft certificate storage wording and unnecessary crew requirement.', CFR+'#p-107.7(a)(1)',
    prompt='1031 When must a remote pilot have the remote pilot certificate and identification physically in their possession and readily accessible?',
    choices=['Only during launch and recovery.', 'Only when carrying a payload.', 'When exercising the privileges of the remote pilot certificate.'])
fix('regulations_0033', 'Correct the inspection authority and specify remote pilot credentials.', CFR+'#p-107.7(a)(2)',
    prompt='1032 Which of these may request inspection of a remote pilot certificate and identification under Part 107?',
    choices=['Any member of the public.', 'An authorized representative of the Department of State.', 'A federal, state, or local law enforcement officer.'], answerIndex=2)
fix('regulations_0036', 'Remove multiple plausible answers and cover Part 107 aircraft under 250 g.', REGISTER,
    prompt='1034 Which small unmanned aircraft used under Part 107 must be registered?',
    choices=['All of them, including aircraft weighing 0.55 pounds or less.', 'Only aircraft weighing more than 0.55 pounds.', 'Only aircraft used to carry cargo for payment.'])
fix('regulations_0037', 'Original key was wrong and omitted recreational-only conditions.', REGISTER,
    choices=['An aircraft weighing 0.55 pounds or less flown exclusively under the limited recreational exception.', 'An aircraft weighing more than 0.55 pounds used commercially.', 'Any aircraft weighing less than 55 pounds used under Part 107.'], answerIndex=0)
fix('regulations_0041', 'Specify the required anti-collision visibility rather than just any light.',
    'https://www.faa.gov/uas/commercial_operators/operations_over_people',
    choices=['Use of a transponder.', 'Anti-collision lighting visible for at least 3 statute miles, with a flash rate sufficient to avoid a collision.', 'Operation only in a rural area.'])
fix('regulations_0047', 'Scope protection of non-participants to operations without an applicable over-people authorization.',
    'https://www.faa.gov/uas/commercial_operators/operations_over_people',
    prompt='1050 For a flight that will not use an applicable category or waiver for operations over people, which plan protects non-participants?')
fix('regulations_0070', 'Duplicate of the scoped non-participant planning question.',
    'https://www.faa.gov/uas/commercial_operators/operations_over_people',
    prompt='1050 For a flight that will not use an applicable category or waiver for operations over people, which plan protects non-participants?')
fix('regulations_0052', '90 days is an FAA review target, not a guaranteed approval or blanket legal deadline.',
    'https://www.faa.gov/uas/commercial_operators/part_107_waivers',
    prompt='1066 The FAA aims to review and approve or disapprove a Part 107 waiver request within how many days of submission, although processing time varies?')
fix('regulations_0060', 'State the missing exception for closed/restricted-access sites.', CFR+'#p-107.145(b)',
    prompt='1274 During a Category 1 operation over occupied moving vehicles outside a closed- or restricted-access site, the small unmanned aircraft')
fix('regulations_0071', 'Weight is one requirement, not complete Category 1 eligibility.',
    'https://www.faa.gov/uas/commercial_operators/operations_over_people',
    prompt='1052 What is the maximum aircraft weight, including everything on board or attached, for Category 1 operations over people?')
fix('regulations_0075', 'State sparse population and clarify the question covers the moving-vehicle rule only.', CFR+'#p-107.25',
    prompt='1053 A wildlife photographer flies from a moving truck over sparsely populated wetlands. A separate driver performs no flight duties, and the aircraft carries no other person’s property for compensation or hire. Does this satisfy the moving-vehicle restriction in 107.25?',
    choices=['Yes.', 'No, land vehicles are always prohibited.', 'No, a visual observer must drive the truck.'])
fix('operations_0014', 'Monitor CTAF at a non-towered airport, not an approach facility by default.',
    'https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap4_section_1.html',
    prompt='1222 As standard operating practice, manned aircraft approaching a non-towered airport should monitor and communicate on the appropriate CTAF starting how far from the airport?')
# Mechanical copyediting is logged separately for each affected question.
replacements = {
 '30NM':'30 NM', 'B$UFLY':'B4UFLY', 'Operation in Class B airspace are':'Operations in Class B airspace are',
 'class C':'Class C', 'class B':'Class B', '(refer to Figure':'(Refer to Figure', 'Area2':'Area 2',
 'Tominson':'Tomlinson', 'Gola Bend':'Gila Bend', 'SIOUX GATEWAY/COL DAT':'SIOUX GATEWAY/COL DAY',
 'Airport (SUR)':'Airport (SLR)', 'all operation will':'all operations will', 'This indicated':'This indicates',
 'Charts Supplements':'Chart Supplements', 'increase of the CG':'increase if the CG', 'An increased in load factor':'An increase in load factor',
 'principle goals':'principal goals', 'while maintain altitude':'while maintaining altitude', 'by a ability':'by an ability',
 'Wind Sheer':'Wind shear', 'microburst/':'microburst?', 'to insure':'to ensure', '15°C and 29.92 “Hg.':'15°C and 29.92 inHg.',
 '.35 “Hg.':'0.35 inHg.', 'using you sUAS':'using your sUAS', '600 feel AGL':'600 feet AGL', 'must”':'must:',
 'ensuring the there':'ensuring that there', 'undercover':'under cover', 'aircrafts navigation':'aircraft’s navigation',
 'manufacture’s':'manufacturer’s', 'the be authorized':'this be authorized', 'front door of customer':'front door of a customer',
 'is is':'is', 'Contract Elizabeth':'Contact Elizabeth', 'and ten back':'and then back',
 'attitude of characteristic':'attitude or characteristic', 'crew resources management':'crew resource management',
 'propellor':'propeller', 'Machoism':'Macho', '”FOUR':'“FOUR', '”Whitted':'“Whitted'
}
def clean(text):
    for a,b in replacements.items(): text=text.replace(a,b)
    return re.sub(r'\s+', ' ', text).strip()
def identity(q):
    text=re.sub(r'^\d+[.]?\s*','',q['prompt'])+' '+' '.join(q['choices'])
    return re.sub(r'[^a-z0-9]', '', text.lower())
names=[('A_airspace','airspace','Airspace'),('B_loading_performance','loading and performance','Loading and Performance'),('C_weather','weather','Weather'),('D_regulations','regulations','Regulations'),('E_operations','operations','Operations')]
questions=[]; audit=[]; seen={}; source_files=[]; csv_findings=[]
for filename,csvname,label in names:
    path=SOURCE/f'bank_{filename}.js'; text=path.read_text(); raw=json.loads(text[text.index('['):text.rindex(']')+1])
    for source in [path,INTAKE/'test-banks'/f'{csvname}.csv']:
        source_files.append({'path':str(source.relative_to(INTAKE)), 'sha256':hashlib.sha256(source.read_bytes()).hexdigest()})
    csv_questions=[]
    for row in csv.reader((INTAKE/'test-banks'/f'{csvname}.csv').open(encoding='utf-8-sig')):
        if not row: continue
        if row[0]=='NewQuestion': csv_questions.append({'type':row[1],'options':[]})
        elif row[0]=='Option': csv_questions[-1]['options'].append({'weight':float(row[1] or 0),'text':row[2]})
    assert len(raw)==len(csv_questions)
    for original, cq in zip(raw,csv_questions):
        q=copy.deepcopy(original); changes=[]; id=q['id']
        positives=[i for i,o in enumerate(cq['options']) if o['weight']>0]
        if positives!=[q['answerIndex']] or len(cq['options'])!=len(q['choices']) or cq['type']!='MC':
            csv_findings.append({'id':id,'csvType':cq['type'],'csvPositiveChoices':positives,'jsAnswerIndex':q['answerIndex'],'csvChoiceCount':len(cq['options']),'jsChoiceCount':len(q['choices'])})
        if id in patches:
            p=patches[id]; q.update(p['fields']); changes.append({'reason':p['reason'],'source':p['source']})
        before=copy.deepcopy(q); q['prompt']=clean(q['prompt']);q['choices']=[clean(c) for c in q['choices']]
        if q!=before: changes.append({'reason':'Correct spelling, punctuation, spacing, or capitalization.'})
        q['sourceCode']=re.match(r'^\d+',q['prompt'])[0]
        q['prompt']=re.sub(r'^\d+[.]?\s*','',q['prompt'])
        q['bank']=label
        q['figures']=list(dict.fromkeys(re.findall(r'figure\s+(\d+)',q['prompt'],re.I)))
        if id=='airspace_0044':changes.append({'reason':'Link previously unmapped Figure 71.'})
        if id=='operations_0016':changes.append({'reason':'Link both Figure 22 and Figure 31, including answer review.'})
        key=identity(q)
        if id in holds: disposition='held';reason=holds[id]
        elif key in seen: disposition='duplicate';reason=f'Duplicate of {seen[key]}; excluded from sampling.'
        else: disposition='included';reason='';seen[key]=id;questions.append(q)
        if changes or disposition!='included': audit.append({'id':id,'disposition':disposition,'reason':reason,'changes':changes,'original':original,'curated':q})
        assert isinstance(q['answerIndex'],int) and q['answerIndex'] in range(len(q['choices'])),id
        for figure in q['figures']: assert (SOURCE/'figures-jpg'/f'{figure}.jpg').is_file(),(id,figure)
OUT.mkdir(parents=True,exist_ok=True); (OUT/'figures').mkdir(exist_ok=True); REVIEW.mkdir(parents=True,exist_ok=True)
figures={}
for path in sorted((SOURCE/'figures-jpg').glob('*.jpg')):
    shutil.copyfile(path,OUT/'figures'/path.name)
    figures[path.stem]={'url':f'/assets/practice/figures/{path.name}','alt':f'FAA testing supplement, Figure {path.stem}. Open the full-size figure to inspect its details.','sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
# Faithful weather-report transcripts assist readers without revealing decoded answers.
figures['12']['transcript']='METAR KINK 121845Z 11012G18KT 15SM SKC 25/17 A3000\nMETAR KBOI 121854Z 13004KT 30SM SCT150 17/6 A3015\nMETAR KLAX 121852Z 25004KT 6SM BR SCT007 SCT250 16/15 A2991\nSPECI KMDW 121856Z 32005KT 1 1/2SM RA OVC007 17/16 A2980 RMK RAB35\nSPECI KJFK 121853Z 18004KT 1 1/2SM FG R04/2200 OVC005 20/18 A3006'
figures['15']['transcript']='KMEM 121720Z 1218/1324 20012KT 5SM HZ BKN030 PROB40 1220/1222 1SM TSRA OVC008CB\nFM122200 33015G20KT P6SM BKN015 OVC025 PROB40 1220/1222 3SM SHRA\nFM120200 35012KT OVC008 PROB40 1202/1205 2SM -RASN BECMG 1306/1308 02008KT BKN012\nBECMG 1310/1312 00000KT 3SM BR SKC TEMPO 1212/1214 1/2SM FG\nFM131600 VRB06KT P6SM SKC=\n\nKOKC 051130Z 0512/0618 14008KT 5SM BR BKN030 TEMPO 0513/0516 1 1/2SM BR\nFM051600 18010KT P6SM SKC BECMG 0522/0524 20013G20KT 4SM SHRA OVC020\nPROB40 0600/0606 2SM TSRA OVC008CB BECMG 0606/0608 21015KT P6SM SCT040='
(OUT/'questions.json').write_text(json.dumps({'reviewed':DATE,'banks':[n[2] for n in names],'figures':figures,'questions':questions},ensure_ascii=False,indent=2)+'\n')
report={'reviewed':DATE,'originalCount':296,'includedCount':len(questions),'counts':dict(collections.Counter(q['bank'] for q in questions)), 'heldCount':sum(a['disposition']=='held' for a in audit),'duplicateCount':sum(a['disposition']=='duplicate' for a in audit),'sourceFiles':source_files,'csvFindings':csv_findings,'changes':audit}
(REVIEW/'review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
# Portable corrected source banks for future authoring (positive weights always 100).
for _,csvname,label in names:
    with (REVIEW/(csvname.replace(' ','-')+'.csv')).open('w',newline='') as f:
        w=csv.writer(f, lineterminator="\n")
        for q in questions:
            if q['bank']!=label:continue
            w.writerows([['NewQuestion','MC',''],['Title',q['id'],''],['QuestionText',q['sourceCode']+' '+q['prompt'],''],['Points',1,''],['Difficulty',1,'']])
            for i,c in enumerate(q['choices']):w.writerow(['Option',100 if i==q['answerIndex'] else 0,c])
print(json.dumps({k:report[k] for k in ['originalCount','includedCount','counts','heldCount','duplicateCount']},indent=2))
