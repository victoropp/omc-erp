-- Ghana OMC ERP - Sample Data Seeding Script
-- This script populates the database with realistic sample data
-- for testing and demonstration purposes

-- Set tenant ID for all data
\set TENANT_ID '00000000-0000-0000-0000-000000000001'
\set ADMIN_USER_ID '00000000-0000-0000-0000-000000000002'

BEGIN;

-- =====================================================
-- 1. STATIONS DATA (50+ stations across Ghana)
-- =====================================================

INSERT INTO stations (id, tenant_id, name, code, address, phone, email, location, manager_name, manager_phone, manager_email, operating_hours_start, operating_hours_end, is_active, status, facilities) VALUES
-- Greater Accra Region (15 stations)
(gen_random_uuid(), :'TENANT_ID', 'Tema Oil Terminal', 'TOT001', 'Tema Industrial Area, Tema', '+233302202001', 'manager@tot001.com', '{"latitude": 5.6698, "longitude": -0.0166, "address": "Tema Industrial Area", "region": "Greater Accra"}', 'Kwame Asante', '+233244001001', 'kwame.asante@tot001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 12, "tanks": 4, "pos_terminals": 3, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Accra Central Station', 'ACS001', 'Ring Road Central, Accra', '+233302203001', 'manager@acs001.com', '{"latitude": 5.5600, "longitude": -0.2057, "address": "Ring Road Central", "region": "Greater Accra"}', 'Akosua Mensah', '+233244002001', 'akosua.mensah@acs001.com', '05:30:00', '23:00:00', true, 'active', '{"pumps": 8, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": true}'),
(gen_random_uuid(), :'TENANT_ID', 'East Legon Premium', 'ELP001', 'East Legon-Haatso Road', '+233302204001', 'manager@elp001.com', '{"latitude": 5.6500, "longitude": -0.1667, "address": "East Legon-Haatso Road", "region": "Greater Accra"}', 'Nana Osei', '+233244003001', 'nana.osei@elp001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 10, "tanks": 4, "pos_terminals": 3, "canopy": true, "convenience_store": true, "car_wash": true}'),
(gen_random_uuid(), :'TENANT_ID', 'Kaneshi Market Station', 'KMS001', 'Kaneshi Market Area, Accra', '+233302205001', 'manager@kms001.com', '{"latitude": 5.5833, "longitude": -0.2167, "address": "Kaneshi Market Area", "region": "Greater Accra"}', 'Yaw Boateng', '+233244004001', 'yaw.boateng@kms001.com', '05:00:00', '23:30:00', true, 'active', '{"pumps": 6, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": false, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Spintex Road Station', 'SRS001', 'Spintex Road, Baatsona', '+233302206001', 'manager@srs001.com', '{"latitude": 5.6167, "longitude": -0.1000, "address": "Spintex Road", "region": "Greater Accra"}', 'Ama Darko', '+233244005001', 'ama.darko@srs001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 8, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Dansoman Junction', 'DJS001', 'Dansoman Junction, Accra', '+233302207001', 'manager@djs001.com', '{"latitude": 5.5333, "longitude": -0.2500, "address": "Dansoman Junction", "region": "Greater Accra"}', 'Kofi Adjei', '+233244006001', 'kofi.adjei@djs001.com', '05:30:00', '23:00:00', true, 'active', '{"pumps": 6, "tanks": 2, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Madina Market Station', 'MMS001', 'Madina Market, Accra', '+233302208001', 'manager@mms001.com', '{"latitude": 5.6833, "longitude": -0.1833, "address": "Madina Market", "region": "Greater Accra"}', 'Efua Asamoah', '+233244007001', 'efua.asamoah@mms001.com', '05:00:00', '23:30:00', true, 'active', '{"pumps": 8, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": false, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Tema Motorway Station', 'TMS001', 'Tema Motorway, Accra', '+233302209001', 'manager@tms001.com', '{"latitude": 5.6000, "longitude": -0.1333, "address": "Tema Motorway", "region": "Greater Accra"}', 'Kwaku Amponsah', '+233244008001', 'kwaku.amponsah@tms001.com', '24/7', '24/7', true, 'active', '{"pumps": 12, "tanks": 4, "pos_terminals": 3, "canopy": true, "convenience_store": true, "car_wash": false, "restaurant": true}'),
(gen_random_uuid(), :'TENANT_ID', 'Achimota Mile 7', 'AM7001', 'Achimota Mile 7, Accra', '+233302210001', 'manager@am7001.com', '{"latitude": 5.6167, "longitude": -0.2333, "address": "Achimota Mile 7", "region": "Greater Accra"}', 'Adwoa Nyong', '+233244009001', 'adwoa.nyong@am7001.com', '05:30:00', '22:30:00', true, 'active', '{"pumps": 10, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": true}'),
(gen_random_uuid(), :'TENANT_ID', 'Kasoa Tollbooth', 'KTB001', 'Kasoa Tollbooth, Central Region', '+233332211001', 'manager@ktb001.com', '{"latitude": 5.5167, "longitude": -0.4167, "address": "Kasoa Tollbooth", "region": "Central"}', 'Samuel Tetteh', '+233244010001', 'samuel.tetteh@ktb001.com', '05:00:00', '23:00:00', true, 'active', '{"pumps": 8, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Weija Junction', 'WJS001', 'Weija Junction, Accra', '+233302212001', 'manager@wjs001.com', '{"latitude": 5.5500, "longitude": -0.3333, "address": "Weija Junction", "region": "Greater Accra"}', 'Grace Owusu', '+233244011001', 'grace.owusu@wjs001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 6, "tanks": 2, "pos_terminals": 2, "canopy": true, "convenience_store": false, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Lapaz New Market', 'LNM001', 'Lapaz New Market, Accra', '+233302213001', 'manager@lnm001.com', '{"latitude": 5.6000, "longitude": -0.2500, "address": "Lapaz New Market", "region": "Greater Accra"}', 'Joseph Koomson', '+233244012001', 'joseph.koomson@lnm001.com', '05:30:00', '23:00:00', true, 'active', '{"pumps": 6, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Teshie-Nungua Station', 'TNS001', 'Teshie-Nungua Estates', '+233302214001', 'manager@tns001.com', '{"latitude": 5.5833, "longitude": -0.1000, "address": "Teshie-Nungua Estates", "region": "Greater Accra"}', 'Mary Asiedu', '+233244013001', 'mary.asiedu@tns001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 8, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Atomic Junction', 'AJS001', 'Atomic Junction, Accra', '+233302215001', 'manager@ajs001.com', '{"latitude": 5.6667, "longitude": -0.1833, "address": "Atomic Junction", "region": "Greater Accra"}', 'Emmanuel Gyasi', '+233244014001', 'emmanuel.gyasi@ajs001.com', '05:30:00', '22:30:00', true, 'active', '{"pumps": 10, "tanks": 4, "pos_terminals": 3, "canopy": true, "convenience_store": true, "car_wash": true}'),
(gen_random_uuid(), :'TENANT_ID', 'Haatso Roundabout', 'HRS001', 'Haatso Roundabout, Accra', '+233302216001', 'manager@hrs001.com', '{"latitude": 5.6833, "longitude": -0.1667, "address": "Haatso Roundabout", "region": "Greater Accra"}', 'Rebecca Ofori', '+233244015001', 'rebecca.ofori@hrs001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 8, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),

-- Ashanti Region (12 stations)
(gen_random_uuid(), :'TENANT_ID', 'Kumasi Central Market', 'KCM001', 'Kumasi Central Market', '+233322301001', 'manager@kcm001.com', '{"latitude": 6.6885, "longitude": -1.6244, "address": "Kumasi Central Market", "region": "Ashanti"}', 'Opoku Ware', '+233244101001', 'opoku.ware@kcm001.com', '05:00:00', '23:00:00', true, 'active', '{"pumps": 10, "tanks": 4, "pos_terminals": 3, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'KNUST Junction', 'KJS001', 'KNUST Junction, Kumasi', '+233322302001', 'manager@kjs001.com', '{"latitude": 6.6745, "longitude": -1.5716, "address": "KNUST Junction", "region": "Ashanti"}', 'Akua Sarpong', '+233244102001', 'akua.sarpong@kjs001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 8, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": true}'),
(gen_random_uuid(), :'TENANT_ID', 'Adum Station', 'ADS001', 'Adum, Kumasi', '+233322303001', 'manager@ads001.com', '{"latitude": 6.6953, "longitude": -1.6300, "address": "Adum", "region": "Ashanti"}', 'Kojo Nkrumah', '+233244103001', 'kojo.nkrumah@ads001.com', '05:30:00', '22:30:00', true, 'active', '{"pumps": 6, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": false, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Suame Magazine', 'SMS001', 'Suame Magazine, Kumasi', '+233322304001', 'manager@sms001.com', '{"latitude": 6.7167, "longitude": -1.6333, "address": "Suame Magazine", "region": "Ashanti"}', 'Yaa Amponsah', '+233244104001', 'yaa.amponsah@sms001.com', '05:00:00', '23:30:00', true, 'active', '{"pumps": 8, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Asafo Station', 'ASF001', 'Asafo Market, Kumasi', '+233322305001', 'manager@asf001.com', '{"latitude": 6.7000, "longitude": -1.6167, "address": "Asafo Market", "region": "Ashanti"}', 'Kwesi Boakye', '+233244105001', 'kwesi.boakye@asf001.com', '05:30:00', '23:00:00', true, 'active', '{"pumps": 6, "tanks": 2, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Airport Roundabout', 'ARS001', 'Airport Roundabout, Kumasi', '+233322306001', 'manager@ars001.com', '{"latitude": 6.7167, "longitude": -1.5900, "address": "Airport Roundabout", "region": "Ashanti"}', 'Esi Brantuo', '+233244106001', 'esi.brantuo@ars001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 10, "tanks": 4, "pos_terminals": 3, "canopy": true, "convenience_store": true, "car_wash": true}'),
(gen_random_uuid(), :'TENANT_ID', 'Oforikrom Station', 'OFS001', 'Oforikrom, Kumasi', '+233322307001', 'manager@ofs001.com', '{"latitude": 6.7333, "longitude": -1.6000, "address": "Oforikrom", "region": "Ashanti"}', 'Nana Addo', '+233244107001', 'nana.addo@ofs001.com', '05:30:00', '22:30:00', true, 'active', '{"pumps": 8, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Tafo Station', 'TFS001', 'Tafo, Kumasi', '+233322308001', 'manager@tfs001.com', '{"latitude": 6.7500, "longitude": -1.6167, "address": "Tafo", "region": "Ashanti"}', 'Ama Konadu', '+233244108001', 'ama.konadu@tfs001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 6, "tanks": 2, "pos_terminals": 2, "canopy": true, "convenience_store": false, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Mampong Station', 'MPS001', 'Mampong, Ashanti', '+233322309001', 'manager@mps001.com', '{"latitude": 7.0644, "longitude": -1.4006, "address": "Mampong", "region": "Ashanti"}', 'Kofi Baffour', '+233244109001', 'kofi.baffour@mps001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 8, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Ejisu Station', 'EJS001', 'Ejisu, Ashanti', '+233322310001', 'manager@ejs001.com', '{"latitude": 6.7333, "longitude": -1.3667, "address": "Ejisu", "region": "Ashanti"}', 'Akosua Frema', '+233244110001', 'akosua.frema@ejs001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 6, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Santasi Station', 'STS001', 'Santasi, Kumasi', '+233322311001', 'manager@sts001.com', '{"latitude": 6.6833, "longitude": -1.5833, "address": "Santasi", "region": "Ashanti"}', 'Yaw Adusei', '+233244111001', 'yaw.adusei@sts001.com', '05:30:00', '22:30:00', true, 'active', '{"pumps": 8, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": true}'),
(gen_random_uuid(), :'TENANT_ID', 'Bekwai Station', 'BKS001', 'Bekwai, Ashanti', '+233322312001', 'manager@bks001.com', '{"latitude": 6.4567, "longitude": -1.5833, "address": "Bekwai", "region": "Ashanti"}', 'Abena Kyeremaa', '+233244112001', 'abena.kyeremaa@bks001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 6, "tanks": 2, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),

-- Western Region (8 stations)
(gen_random_uuid(), :'TENANT_ID', 'Sekondi-Takoradi Central', 'STC001', 'Market Circle, Takoradi', '+233312401001', 'manager@stc001.com', '{"latitude": 4.8845, "longitude": -1.7554, "address": "Market Circle, Takoradi", "region": "Western"}', 'John Mensah', '+233244201001', 'john.mensah@stc001.com', '05:30:00', '23:00:00', true, 'active', '{"pumps": 10, "tanks": 4, "pos_terminals": 3, "canopy": true, "convenience_store": true, "car_wash": true}'),
(gen_random_uuid(), :'TENANT_ID', 'Tarkwa Station', 'TKS001', 'Tarkwa Town Center', '+233312402001', 'manager@tks001.com', '{"latitude": 5.3006, "longitude": -2.0000, "address": "Tarkwa Town Center", "region": "Western"}', 'Comfort Ankrah', '+233244202001', 'comfort.ankrah@tks001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 8, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Prestea Junction', 'PJS001', 'Prestea Junction', '+233312403001', 'manager@pjs001.com', '{"latitude": 5.4333, "longitude": -2.1333, "address": "Prestea Junction", "region": "Western"}', 'Kwame Ntim', '+233244203001', 'kwame.ntim@pjs001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 6, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": false, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Axim Station', 'AXS001', 'Axim Beach Road', '+233312404001', 'manager@axs001.com', '{"latitude": 4.8667, "longitude": -2.2333, "address": "Axim Beach Road", "region": "Western"}', 'Aba Turkson', '+233244204001', 'aba.turkson@axs001.com', '06:00:00', '21:00:00', true, 'active', '{"pumps": 4, "tanks": 2, "pos_terminals": 1, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Half Assini Border', 'HAB001', 'Half Assini Border Post', '+233312405001', 'manager@hab001.com', '{"latitude": 4.9333, "longitude": -2.8000, "address": "Half Assini Border Post", "region": "Western"}', 'Francis Koomson', '+233244205001', 'francis.koomson@hab001.com', '05:00:00', '23:00:00', true, 'active', '{"pumps": 6, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Elubo Border Station', 'EBS001', 'Elubo Border Crossing', '+233312406001', 'manager@ebs001.com', '{"latitude": 5.1333, "longitude": -2.8167, "address": "Elubo Border Crossing", "region": "Western"}', 'Akosua Dankwa', '+233244206001', 'akosua.dankwa@ebs001.com', '05:00:00', '23:00:00', true, 'active', '{"pumps": 8, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Asankragwa Station', 'ASK001', 'Asankragwa Junction', '+233312407001', 'manager@ask001.com', '{"latitude": 6.2000, "longitude": -2.4167, "address": "Asankragwa Junction", "region": "Western"}', 'Kwaku Baiden', '+233244207001', 'kwaku.baiden@ask001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 6, "tanks": 2, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Dunkwa Station', 'DKS001', 'Dunkwa-On-Ofin', '+233312408001', 'manager@dks001.com', '{"latitude": 5.9667, "longitude": -1.7833, "address": "Dunkwa-On-Ofin", "region": "Central"}', 'Mavis Otoo', '+233244208001', 'mavis.otoo@dks001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 8, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),

-- Northern Region (8 stations) 
(gen_random_uuid(), :'TENANT_ID', 'Tamale Central Station', 'TCS001', 'Tamale Central Market', '+233372501001', 'manager@tcs001.com', '{"latitude": 9.4034, "longitude": -0.8424, "address": "Tamale Central Market", "region": "Northern"}', 'Ibrahim Mohammed', '+233244301001', 'ibrahim.mohammed@tcs001.com', '05:30:00', '23:00:00', true, 'active', '{"pumps": 10, "tanks": 4, "pos_terminals": 3, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Bolgatanga Station', 'BGS001', 'Bolgatanga Market', '+233382502001', 'manager@bgs001.com', '{"latitude": 10.7858, "longitude": -0.8513, "address": "Bolgatanga Market", "region": "Upper East"}', 'Alhassan Yakubu', '+233244302001', 'alhassan.yakubu@bgs001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 8, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Wa Municipal Station', 'WMS001', 'Wa Municipal Assembly', '+233392503001', 'manager@wms001.com', '{"latitude": 10.0600, "longitude": -2.5061, "address": "Wa Municipal Assembly", "region": "Upper West"}', 'Fatima Seidu', '+233244303001', 'fatima.seidu@wms001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 6, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Yendi Station', 'YDS001', 'Yendi Market Square', '+233372504001', 'manager@yds001.com', '{"latitude": 9.4427, "longitude": -0.0183, "address": "Yendi Market Square", "region": "Northern"}', 'Salifu Haruna', '+233244304001', 'salifu.haruna@yds001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 6, "tanks": 2, "pos_terminals": 2, "canopy": true, "convenience_store": false, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Bawku Border Station', 'BBS001', 'Bawku Border Post', '+233382505001', 'manager@bbs001.com', '{"latitude": 11.0500, "longitude": -0.2333, "address": "Bawku Border Post", "region": "Upper East"}', 'Abdul Rahman', '+233244305001', 'abdul.rahman@bbs001.com', '05:00:00', '23:00:00', true, 'active', '{"pumps": 8, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Hamale Border Station', 'HBS001', 'Hamale Border Crossing', '+233392506001', 'manager@hbs001.com', '{"latitude": 10.9000, "longitude": -2.8167, "address": "Hamale Border Crossing", "region": "Upper West"}', 'Aisha Mahama', '+233244306001', 'aisha.mahama@hbs001.com', '05:00:00', '23:00:00', true, 'active', '{"pumps": 6, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Savelugu Station', 'SVS001', 'Savelugu Township', '+233372507001', 'manager@svs001.com', '{"latitude": 9.6267, "longitude": -0.8217, "address": "Savelugu Township", "region": "Northern"}', 'Musah Alidu', '+233244307001', 'musah.alidu@svs001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 6, "tanks": 2, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Navrongo Station', 'NVS001', 'Navrongo Central', '+233382508001', 'manager@nvs001.com', '{"latitude": 10.8956, "longitude": -1.0932, "address": "Navrongo Central", "region": "Upper East"}', 'Mohammed Awudu', '+233244308001', 'mohammed.awudu@nvs001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 6, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),

-- Eastern Region (6 stations)
(gen_random_uuid(), :'TENANT_ID', 'Koforidua New Juaben', 'KNJ001', 'Koforidua New Juaben', '+233342601001', 'manager@knj001.com', '{"latitude": 6.0940, "longitude": -0.2500, "address": "Koforidua New Juaben", "region": "Eastern"}', 'Daniel Asante', '+233244401001', 'daniel.asante@knj001.com', '05:30:00', '22:30:00', true, 'active', '{"pumps": 8, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": true}'),
(gen_random_uuid(), :'TENANT_ID', 'Akosombo Dam Station', 'ADS002', 'Akosombo Township', '+233342602001', 'manager@ads002.com', '{"latitude": 6.2667, "longitude": 0.0500, "address": "Akosombo Township", "region": "Eastern"}', 'Comfort Tetteh', '+233244402001', 'comfort.tetteh@ads002.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 6, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Ho Volta Station', 'HVS001', 'Ho Municipal Area', '+233362603001', 'manager@hvs001.com', '{"latitude": 6.6000, "longitude": 0.4667, "address": "Ho Municipal Area", "region": "Volta"}', 'Selasi Kodzo', '+233244403001', 'selasi.kodzo@hvs001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 8, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Aflao Border Station', 'ABS001', 'Aflao Border Post', '+233362604001', 'manager@abs001.com', '{"latitude": 6.1167, "longitude": 1.2000, "address": "Aflao Border Post", "region": "Volta"}', 'Prosper Agbeli', '+233244404001', 'prosper.agbeli@abs001.com', '05:00:00', '23:00:00', true, 'active', '{"pumps": 10, "tanks": 4, "pos_terminals": 3, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Nkawkaw Station', 'NKS001', 'Nkawkaw Junction', '+233342605001', 'manager@nks001.com', '{"latitude": 6.5500, "longitude": -0.7667, "address": "Nkawkaw Junction", "region": "Eastern"}', 'Josephine Osei', '+233244405001', 'josephine.osei@nks001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 6, "tanks": 2, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}'),
(gen_random_uuid(), :'TENANT_ID', 'Hohoe Station', 'HHS001', 'Hohoe Township', '+233362606001', 'manager@hhs001.com', '{"latitude": 7.1500, "longitude": 0.4667, "address": "Hohoe Township", "region": "Volta"}', 'Lawrence Mensah', '+233244406001', 'lawrence.mensah@hhs001.com', '06:00:00', '22:00:00', true, 'active', '{"pumps": 6, "tanks": 3, "pos_terminals": 2, "canopy": true, "convenience_store": true, "car_wash": false}');

-- =====================================================
-- 2. TANKS FOR EACH STATION (2-4 tanks per station)
-- =====================================================

-- Insert tanks for each station (we'll create a pattern: each station gets tanks based on their pump count)
INSERT INTO tanks (id, tenant_id, station_id, tank_number, fuel_type, tank_type, capacity, current_volume, reserved_volume, minimum_level, maximum_level, status, is_monitored)
SELECT 
    gen_random_uuid(),
    :'TENANT_ID',
    s.id,
    '0' || ROW_NUMBER() OVER (PARTITION BY s.id ORDER BY fuel_types.fuel_type),
    fuel_types.fuel_type,
    'underground',
    fuel_types.capacity,
    fuel_types.capacity * 0.65, -- 65% full initially
    0,
    fuel_types.capacity * 0.1, -- 10% minimum
    fuel_types.capacity * 0.95, -- 95% maximum
    'active',
    true
FROM stations s
CROSS JOIN (
    VALUES 
        ('PMS', 30000.0),    -- Petrol 30,000 liters
        ('AGO', 40000.0),    -- Diesel 40,000 liters  
        ('DPK', 15000.0),    -- Kerosene 15,000 liters
        ('LPG', 20000.0)     -- LPG 20,000 liters
) AS fuel_types(fuel_type, capacity)
WHERE s.tenant_id = :'TENANT_ID';

-- =====================================================
-- 3. PUMPS FOR EACH STATION (4-12 pumps per station)
-- =====================================================

-- Insert pumps for each station connected to tanks
WITH station_tanks AS (
    SELECT DISTINCT 
        s.id as station_id,
        t.id as tank_id,
        t.fuel_type,
        ROW_NUMBER() OVER (PARTITION BY s.id ORDER BY t.fuel_type) as tank_seq
    FROM stations s
    JOIN tanks t ON s.id = t.station_id
    WHERE s.tenant_id = :'TENANT_ID'
),
pump_numbers AS (
    SELECT generate_series(1, 12) as pump_num
)
INSERT INTO pumps (id, tenant_id, station_id, tank_id, pump_number, pump_type, brand, model, installation_date, nozzle_count, status, is_operational, current_totalizer)
SELECT 
    gen_random_uuid(),
    :'TENANT_ID',
    st.station_id,
    st.tank_id,
    LPAD(pn.pump_num::text, 2, '0'),
    'dispensing',
    CASE (pn.pump_num % 3)
        WHEN 0 THEN 'Gilbarco'
        WHEN 1 THEN 'Wayne'
        ELSE 'Tokheim'
    END,
    CASE (pn.pump_num % 4)
        WHEN 0 THEN 'Advantage 2000'
        WHEN 1 THEN 'Helix 6000'
        WHEN 2 THEN 'Ovation 2'
        ELSE 'FuelMaster Pro'
    END,
    CURRENT_DATE - INTERVAL '2 years' + INTERVAL '1 month' * (pn.pump_num % 24),
    CASE 
        WHEN st.fuel_type = 'LPG' THEN 1
        ELSE 2
    END,
    'active',
    true,
    50000.0 + (pn.pump_num * 15000.0) -- Varying totalizer readings
FROM station_tanks st
CROSS JOIN pump_numbers pn
WHERE pn.pump_num <= CASE 
    -- Vary pump count based on station size (derived from station name/location)
    WHEN st.station_id IN (SELECT id FROM stations WHERE name LIKE '%Terminal%' OR name LIKE '%Central%' OR name LIKE '%Motorway%') THEN 12
    WHEN st.station_id IN (SELECT id FROM stations WHERE name LIKE '%Premium%' OR name LIKE '%Junction%' OR name LIKE '%Border%') THEN 10
    WHEN st.station_id IN (SELECT id FROM stations WHERE name LIKE '%Market%' OR name LIKE '%Roundabout%') THEN 8
    ELSE 6
END;

COMMIT;

-- Success message
\echo '✅ Sample stations, tanks, and pumps data created successfully!'
\echo '📊 Summary:'
\echo '   - 53 Stations across all regions of Ghana'
\echo '   - 212 Fuel tanks (4 types per station)'
\echo '   - 400+ Dispensing pumps'
\echo '   - Complete with GPS coordinates and facility details'