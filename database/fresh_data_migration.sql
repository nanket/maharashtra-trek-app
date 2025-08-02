-- FRESH DATA MIGRATION: Insert sample trek data
-- Run this AFTER running fresh_start.sql
-- This uses the simplified JSONB safety structure

-- Insert sample trek data with proper structure
INSERT INTO treks (
    id, name, category, location, difficulty, duration, elevation, description,
    starting_point_name, starting_point_latitude, starting_point_longitude,
    starting_point_facilities, starting_point_description,
    latitude, longitude, featured, rating, review_count,
    images, videos, image_key, best_time_to_visit,
    network_availability, food_and_water, accommodation, permits,
    safety, weather, trek_route, how_to_reach, local_contacts
) VALUES

-- Lohagad Fort (Easy, Popular)
(2, 'Lohagad Fort', 'fort', 'Pune District, Maharashtra', 'Easy', '2-3 hours (one way)', '1,033 meters', 
'Lohagad is a UNESCO World Heritage site and one of Maharashtra''s most accessible forts. Known for its massive gates, fortified ramparts, and the distinctive ''Vinchu Kata'' (scorpion''s tail) extension, Lohagad was historically an important outpost for Chhatrapati Shivaji Maharaj. The route is well-marked and suited for beginners and families.',
'Lohagadwadi Village', 18.7104, 73.4763, 
ARRAY['Ample parking', 'Eateries', 'Basic shops', 'Local guides', 'Public toilets'], 
'Lohagadwadi is the main base village, directly connected by road from Malavli/Lonavala. Offers essential amenities, food, and paid parking.',
18.7104, 73.4763, true, 4.7, 321,
ARRAY['https://res.cloudinary.com/dworlkdn8/image/upload/v1754044854/treks/lohagad/lohagad_1.jpg', 'https://res.cloudinary.com/dworlkdn8/image/upload/v1754044854/treks/lohagad/lohagad_2.jpg'],
ARRAY['https://res.cloudinary.com/dworlkdn8/video/upload/v1754044854/treks/lohagad/lohagad_scenic.mp4'],
'lohagad', 'June to February (monsoon and post-monsoon/winter months)',
'{"baseVillage":{"airtel":"Good","jio":"Good","vodafone":"Good","bsnl":"Good"},"duringTrek":{"airtel":"Fair","jio":"Fair","vodafone":"Fair","bsnl":"Fair"},"atSummit":{"airtel":"Good","jio":"Good","vodafone":"Fair","bsnl":"Fair"},"emergencyContact":"108 (ambulance); 112 (emergency). All networks generally work at base and summit."}'::jsonb,
'{"atBase":{"restaurants":["Shree Ganesh Dhaba","Lohagadwadi Snacks Centre","Tea & Bhajiya Shops"],"shops":["General stores","Water bottles","Basic snacks"],"waterSources":["Village wells","Packaged water available"]},"duringTrek":{"waterSources":["Seasonal springs en route (monsoon/post-monsoon)","Carry 2L minimum per person"],"foodOptions":["Packaged food/snacks available at stalls en route (seasonal)"],"recommendations":["Light snacks","Energy bars","Hydration pack"]},"atSummit":{"facilities":["Seasonal snacks and tea stalls (monsoon and weekends)","Ancient cistern (water not always potable)"],"recommendations":["Carry water in dry season","Enjoy local lemon sherbet during monsoon"]}}'::jsonb,
'{"camping":{"allowed":true,"locations":["Fort summit area","Near Ganesh Darwaja"],"facilities":["Open terraces","Basic shelter in fort rooms"],"cost":"Free (own tent/sleeping gear required)"},"nearbyStays":[{"name":"Lohagadwadi Homestay","distance":"At base village","cost":"₹600-900 per person","contact":"+91 8390944643","facilities":["Simple rooms","Home-cooked meals","Parking"]},{"name":"MTDC Resort","distance":"8 km (Lonavala)","cost":"₹2,000-4,500 per room","contact":"+91 2114-273055","facilities":["AC/Non-AC rooms","Restaurant"]}]}'::jsonb,
'{"required":false,"forestDepartment":"Not required","entry":"Free entry","timings":"Open sunrise to sunset; camping allowed"}'::jsonb,
'{"riskLevel":"Low","commonRisks":["Slippery steps during monsoon","Crowds on weekends/holidays","Loose stones on some sections"],"precautions":["Wear grippy shoes in wet season","Avoid railings during heavy wind/rains","Hydrate and pace yourself"],"rescuePoints":["Lohagadwadi base","Ganesh Darwaja (main gate)","Fort summit"],"nearestHospital":{"name":"Rural Hospital Lonavala","distance":"12 km","contact":"+91 2114-273055"},"emergencyNumbers":{"ambulance":"108","police":"112"}}'::jsonb,
'{"monsoon":{"months":"June-September","conditions":"Heavy rain, lush green, clouds/mist, very slippery steps","recommendation":"Very popular—carry rainwear and prepare for crowds"},"winter":{"months":"December-February","conditions":"Cool, clear skies, ideal for families","recommendation":"Best trekking weather"},"summer":{"months":"March-May","conditions":"Warm mid-day, lesser crowds, dry path","recommendation":"Start early morning; carry extra water"}}'::jsonb,
'{"totalDistance":"5 km (round trip from base to summit)","ascent":"350 meters","difficulty":"Easy (well-paved steps, some steeper sections)","waypoints":[{"name":"Lohagadwadi Village","elevation":"800m","description":"Base with parking, shops, food"},{"name":"Ganesh Darwaja","elevation":"950m","description":"First major entry, iconic stone arch"},{"name":"Narayan Darwaja","elevation":"990m","description":"Second major gate on route"},{"name":"Main Fort Entrance","elevation":"1025m","description":"Large flights of stone steps"},{"name":"Lohagad Summit","elevation":"1,033m","description":"Flag point, huge ramparts, Vinchu Kata"}]}'::jsonb,
'{"fromMumbai":{"byTrain":{"description":"Train to Lonavala or Malavli, then local transport","distance":"100 km","time":"3 hours","steps":["Train from Mumbai CST to Lonavala","Change for local train to Malavli","Share auto or trek to Lohagadwadi"]},"byBus":{"description":"ST or private bus to Lonavala, then taxi/auto","distance":"110 km","time":"3.5-4 hours","steps":["Bus to Lonavala","Local rickshaw to Malavli village/fort base"]},"byPrivateVehicle":{"description":"Drive via Mumbai–Pune Expressway to Malavli","distance":"100 km","time":"2.5-3 hours","steps":["Take Mumbai–Pune Expressway","Exit at Lonavala, follow signs to Malavli and Lohagadwadi"]}},"fromPune":{"byTrain":{"description":"Train from Pune to Malavli, then walk/auto","distance":"65 km","time":"1.5 hours","steps":["Board Pune–Lonavala local train, get down at Malavli","Share auto or trek to Lohagadwadi"]},"byBus":{"description":"Bus to Lonavala, then local auto","distance":"65 km","time":"2–2.5 hours","steps":["Pune to Lonavala by ST/private bus","Auto to Malavli/Lohagadwadi"]},"byPrivateVehicle":{"description":"Drive via Mumbai–Pune Expressway or old highway","distance":"70 km","time":"1.5–2 hours","steps":["Take Expressway/Old Pune-Mumbai highway to Lonavala","Via Malavli to Lohagadwadi"]}}}'::jsonb,
'[{"name":"Ganpat Lohagadkar","phone":"+91 9766529833","service":"Local Guide, Homestay"},{"name":"Lohagadwadi Grampanchayat","phone":"+91 2114-222311","service":"Village Info, Assistance, Emergency"}]'::jsonb),

-- Raigad Fort (Moderate, Historic)
(1, 'Raigad Fort', 'fort', 'Raigad District, Maharashtra', 'Moderate', '5-6 hours', '820 meters',
'Historic fort and capital of Maratha Empire under Chhatrapati Shivaji Maharaj. Features the famous ropeway, royal palace ruins, and Shivaji Maharaj''s samadhi. The fort offers stunning views of the Sahyadri mountains and Arabian Sea.',
'Raigad Peth', 18.2311, 73.4143,
ARRAY['Parking', 'Restaurants', 'Ropeway', 'Tourist facilities'],
'Base village with ropeway facility and tourist amenities. The ropeway provides easy access to the fort.',
18.2311, 73.4143, true, 4.8, 450,
ARRAY['https://res.cloudinary.com/dworlkdn8/image/upload/v1750749974/trekapp/raigads/raigad_main.jpg', 'https://res.cloudinary.com/dworlkdn8/image/upload/v1750749974/trekapp/raigads/raigad_palace.jpg'],
ARRAY['https://res.cloudinary.com/dworlkdn8/video/upload/v1750749974/trekapp/raigads/SnapInsta.to_AQP_uZXQ8dlkNpYT8a4K1VTHt8gNT-Xln9aRQo_3hlOggEMVwsVIx7jZeyxWO5phzS_16EcKIPvJjUDjfDmvOMq7DSF2X2nl9p66hNQ_whhkrq.mp4'],
'raigad', 'October to March',
'{"baseVillage":{"airtel":"Excellent","jio":"Excellent","vodafone":"Good","bsnl":"Good"},"duringTrek":{"airtel":"Good","jio":"Good","vodafone":"Fair","bsnl":"Fair"},"atSummit":{"airtel":"Good","jio":"Good","vodafone":"Good","bsnl":"Fair"},"emergencyContact":"108/112 available. Tourist police present during peak season."}'::jsonb,
'{"atBase":{"restaurants":["MTDC Restaurant","Local dhabas","Snack stalls"],"shops":["Souvenir shops","General stores","Water and snacks"],"waterSources":["Filtered water available","Packaged water"]},"duringTrek":{"waterSources":["Water available at fort","Carry 1-2L as backup"],"foodOptions":["Food stalls at fort (seasonal)","Carry snacks for backup"],"recommendations":["Light refreshments","Camera for historic sites"]},"atSummit":{"facilities":["Museum","Food stalls","Rest areas","Toilets"],"recommendations":["Visit museum","Explore palace ruins","Samadhi darshan"]}}'::jsonb,
'{"camping":{"allowed":false,"note":"Day visit only; accommodation available at base"},"nearbyStays":[{"name":"MTDC Resort Raigad","distance":"At base","cost":"₹1,500-3,000 per room","contact":"+91 2140-242348","facilities":["AC rooms","Restaurant","Tourist guide services"]},{"name":"Local homestays","distance":"In village","cost":"₹800-1,500 per person","facilities":["Basic rooms","Home food","Local guidance"]}]}'::jsonb,
'{"required":false,"forestDepartment":"Not required","entry":"Entry fee: ₹35 per person, Ropeway: ₹120 round trip","timings":"6:00 AM to 6:00 PM"}'::jsonb,
'{"riskLevel":"Low","commonRisks":["Crowded during festivals","Ropeway weather dependency","Steep steps to palace"],"precautions":["Book ropeway tickets in advance","Carry water","Wear comfortable shoes","Respect historic sites"],"rescuePoints":["Ropeway station","Fort entrance","Museum area"],"nearestHospital":{"name":"Mahad Civil Hospital","distance":"25 km","contact":"+91 2140-222222"},"emergencyNumbers":{"ambulance":"108","police":"112","tourist_helpline":"1363"}}'::jsonb,
'{"monsoon":{"months":"June-September","conditions":"Heavy rain, ropeway may be closed, lush greenery","recommendation":"Check ropeway status; beautiful but risky"},"winter":{"months":"October-February","conditions":"Pleasant weather, clear views, ideal for sightseeing","recommendation":"Best time to visit"},"summer":{"months":"March-May","conditions":"Hot during day, clear views","recommendation":"Visit early morning or evening"}}'::jsonb,
'{"totalDistance":"3 km (if trekking), Ropeway available","ascent":"400 meters from base","difficulty":"Moderate if trekking, Easy via ropeway","waypoints":[{"name":"Raigad Peth Base","elevation":"420m","description":"Ropeway station, parking, facilities"},{"name":"Fort Entrance","elevation":"750m","description":"Main gate, ticket counter"},{"name":"Shivaji Maharaj Samadhi","elevation":"800m","description":"Sacred memorial site"},{"name":"Royal Palace Ruins","elevation":"820m","description":"Historic palace complex with panoramic views"}]}'::jsonb,
'{"fromMumbai":{"byTrain":{"description":"Train to Panvel, then bus/taxi to Raigad","distance":"120 km","time":"4 hours","steps":["Local train Mumbai to Panvel","ST bus or taxi to Raigad Peth","Ropeway or trek to fort"]},"byBus":{"description":"Direct ST bus to Raigad","distance":"130 km","time":"4-5 hours","steps":["ST bus from Mumbai to Raigad","Walk to ropeway station"]},"byPrivateVehicle":{"description":"Drive via Panvel-Mahad route","distance":"120 km","time":"3-4 hours","steps":["Mumbai-Panvel-Mahad-Raigad","Parking available at base","Ropeway or trek option"]}},"fromPune":{"byTrain":{"description":"Train to Lonavala, then bus to Raigad","distance":"180 km","time":"5-6 hours","steps":["Train Pune to Lonavala","Bus to Mahad","Local transport to Raigad"]},"byBus":{"description":"Bus via Satara-Mahad route","distance":"200 km","time":"5-6 hours","steps":["Pune to Satara","Satara to Mahad","Mahad to Raigad"]},"byPrivateVehicle":{"description":"Drive via Pune-Satara-Mahad route","distance":"180 km","time":"4-5 hours","steps":["Pune-Satara highway","Satara-Mahad-Raigad","Parking at base"]}}}'::jsonb,
'[{"name":"MTDC Information Center","phone":"+91 2140-242348","service":"Tourist information, ropeway booking"},{"name":"Raigad Fort Guide Association","phone":"+91 9822334455","service":"Certified guides, historical tours"},{"name":"Local Transport Union","phone":"+91 9876543210","service":"Taxi, auto services from base"}]'::jsonb),

-- Kalsubai Peak (Difficult, Highest peak)
(5, 'Kalsubai Peak', 'trek', 'Ahmednagar District, Maharashtra', 'Difficult', '6-8 hours', '1,646 meters',
'Kalsubai is the highest peak in Maharashtra, offering panoramic views of the Western Ghats. The trek involves steep climbs, iron ladders, and rocky terrain. The summit provides 360-degree views of the Sahyadri range and is considered a must-do for serious trekkers.',
'Bari Village', 19.5961, 73.7081,
ARRAY['Basic parking', 'Local guides', 'Tea stalls', 'Village homestays'],
'Small village at the base with basic facilities. Local guides are recommended for the challenging trek.',
19.5961, 73.7081, true, 4.6, 520,
ARRAY['https://res.cloudinary.com/dworlkdn8/image/upload/v1573202739/trekapp/trek%20images/kalsubai.jpg'],
NULL, 'kalsubai', 'October to February',
'{"baseVillage":{"airtel":"Fair","jio":"Fair","vodafone":"Weak","bsnl":"Fair"},"duringTrek":{"airtel":"Poor","jio":"Poor","vodafone":"No signal","bsnl":"No signal"},"atSummit":{"airtel":"Intermittent","jio":"Intermittent","vodafone":"No signal","bsnl":"No signal"},"emergencyContact":"108/112 when signal available. Inform locals before starting trek."}'::jsonb,
'{"atBase":{"restaurants":["Village tea stalls","Homestay meals (pre-arranged)"],"shops":["Basic provisions","Limited packaged water"],"waterSources":["Village wells (boil/filter recommended)"]},"duringTrek":{"waterSources":["Limited water sources; carry 3-4L per person","Natural springs (seasonal, treat before use)"],"foodOptions":["No food stalls on trek; carry packed meals"],"recommendations":["High-energy food","Dry fruits","Electrolyte drinks","Sufficient water"]},"atSummit":{"facilities":["Kalsubai temple","Basic shelter","No food/water stalls"],"recommendations":["Carry all supplies","Temple darshan","360-degree photography"]}}'::jsonb,
'{"camping":{"allowed":true,"locations":["Near summit temple","Designated camping areas"],"facilities":["Basic natural shelter","No amenities; fully self-sufficient required"],"cost":"Free (own equipment required)"},"nearbyStays":[{"name":"Bari Village Homestays","distance":"At base village","cost":"₹500-800 per person","contact":"+91 9423456789","facilities":["Basic rooms","Home-cooked meals","Guide arrangements"]},{"name":"Igatpuri Hotels","distance":"30 km","cost":"₹1,000-3,000 per room","facilities":["Hotels and resorts","All amenities"]}]}'::jsonb,
'{"required":false,"forestDepartment":"Not required","entry":"Free entry","timings":"Start early (4-5 AM recommended) due to long duration"}'::jsonb,
'{"riskLevel":"High","commonRisks":["Steep rocky terrain","Iron ladder sections","Weather changes","Limited rescue access","Dehydration risk"],"precautions":["Experienced trekkers only","Trek with guide","Proper trekking gear","Sufficient water and food","Weather check before starting","Inform family/friends about trek plan"],"rescuePoints":["Bari village","Midway rest points","Summit temple"],"nearestHospital":{"name":"Igatpuri Rural Hospital","distance":"30 km","contact":"+91 2553-244444"},"emergencyNumbers":{"ambulance":"108","police":"112","forest_dept":"1926"}}'::jsonb,
'{"monsoon":{"months":"June-September","conditions":"Heavy rain, slippery rocks, leeches, dangerous conditions","recommendation":"Avoid during monsoon; very risky"},"winter":{"months":"October-February","conditions":"Cool, clear skies, excellent visibility","recommendation":"Best time for trek; ideal weather"},"summer":{"months":"March-May","conditions":"Hot, water scarcity, harsh sun exposure","recommendation":"Start very early; carry extra water"}}'::jsonb,
'{"totalDistance":"14 km round trip","ascent":"1,100 meters","difficulty":"Difficult; steep climbs, iron ladders, rocky terrain","waypoints":[{"name":"Bari Village","elevation":"546m","description":"Base village, last point for supplies"},{"name":"Forest Trail Start","elevation":"700m","description":"Enter forest area, gradual climb"},{"name":"Iron Ladder Section","elevation":"1,200m","description":"Technical climbing with iron ladders"},{"name":"Final Rocky Ascent","elevation":"1,500m","description":"Steep rocky climb to summit"},{"name":"Kalsubai Summit & Temple","elevation":"1,646m","description":"Highest point in Maharashtra, temple, panoramic views"}]}'::jsonb,
'{"fromMumbai":{"byTrain":{"description":"Train to Kasara/Igatpuri, then taxi to Bari village","distance":"160 km","time":"5-6 hours","steps":["Train Mumbai to Kasara or Igatpuri","Taxi/jeep to Bari village (30 km)","Start trek from village"]},"byBus":{"description":"ST bus to Igatpuri, then local transport","distance":"170 km","time":"6-7 hours","steps":["ST bus Mumbai to Igatpuri","Local jeep/taxi to Bari village"]},"byPrivateVehicle":{"description":"Drive via Mumbai-Nashik highway to Bari","distance":"160 km","time":"4-5 hours","steps":["Mumbai-Nashik highway","Exit at Ghoti/Igatpuri","Drive to Bari village","Limited parking available"]}},"fromPune":{"byTrain":{"description":"Train to Igatpuri, then taxi to Bari","distance":"200 km","time":"6-7 hours","steps":["Train Pune to Igatpuri","Taxi to Bari village"]},"byBus":{"description":"Bus to Nashik/Igatpuri, then local transport","distance":"210 km","time":"7-8 hours","steps":["Bus Pune to Nashik","Local transport to Bari"]},"byPrivateVehicle":{"description":"Drive via Pune-Nashik highway","distance":"200 km","time":"5-6 hours","steps":["Pune-Nashik highway","Igatpuri-Bari road","Village parking"]}}}'::jsonb,
'[{"name":"Bari Village Guide Association","phone":"+91 9423456789","service":"Certified guides, trek planning"},{"name":"Kalsubai Trek Organizers","phone":"+91 9876543210","service":"Group treks, equipment rental"},{"name":"Emergency Contact - Village Sarpanch","phone":"+91 9988776655","service":"Local emergency assistance"}]'::jsonb);

-- Verify the data was inserted successfully
SELECT 
    category,
    COUNT(*) as count,
    COUNT(CASE WHEN featured = true THEN 1 END) as featured_count
FROM treks 
GROUP BY category
ORDER BY category;

-- Show total count
SELECT COUNT(*) as total_treks FROM treks;

-- Show sample data to verify structure
SELECT id, name, category, location, difficulty, featured, rating 
FROM treks 
ORDER BY category, name;

-- Test the search function
SELECT name, category, difficulty, rating 
FROM search_treks('fort') 
LIMIT 5;

-- Success message
SELECT 'Fresh data migration completed successfully!' as status;
