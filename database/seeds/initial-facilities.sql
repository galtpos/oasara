-- Initial seed data for OASARA Medical Marketplace
-- Top 50 JCI-certified facilities across major medical tourism destinations

-- Thailand
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Bumrungrad International Hospital', 'Thailand', 'Bangkok', 13.7372, 100.5642, true, ARRAY['Cardiology', 'Oncology', 'Orthopedics', 'Cosmetic Surgery'], ARRAY['English', 'Thai', 'Arabic', 'Japanese'], 4.6, 8500, 'international@bumrungrad.com', '30 mins from BKK', '[{"name": "Hip Replacement", "price_range": "$12,000 - $15,000", "wait_time": "1 week"}, {"name": "Heart Bypass", "price_range": "$15,000 - $22,000", "wait_time": "1-2 weeks"}]'),

('Bangkok Hospital', 'Thailand', 'Bangkok', 13.7563, 100.5018, true, ARRAY['Neurology', 'Cardiology', 'Fertility', 'Dental'], ARRAY['English', 'Thai', 'Chinese'], 4.5, 6200, 'info@bangkokhospital.com', '35 mins from BKK', '[{"name": "IVF Treatment", "price_range": "$4,000 - $6,000", "wait_time": "2-4 weeks"}, {"name": "Dental Implants", "price_range": "$1,200 - $2,000", "wait_time": "3-5 days"}]'),

('Samitivej Hospital', 'Thailand', 'Bangkok', 13.7453, 100.5712, true, ARRAY['Pediatrics', 'Cardiology', 'Oncology'], ARRAY['English', 'Thai'], 4.7, 4800, 'contact@samitivej.co.th', '28 mins from BKK', '[{"name": "Cancer Treatment", "price_range": "$8,000 - $25,000", "wait_time": "1-2 weeks"}]');

-- India
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Apollo Hospitals', 'India', 'Chennai', 13.0569, 80.2091, true, ARRAY['Cardiology', 'Oncology', 'Transplants', 'Orthopedics'], ARRAY['English', 'Hindi', 'Tamil'], 4.4, 12000, 'international@apollohospitals.com', '20 mins from MAA', '[{"name": "Liver Transplant", "price_range": "$30,000 - $50,000", "wait_time": "2-4 weeks"}, {"name": "Knee Replacement", "price_range": "$7,000 - $9,000", "wait_time": "1 week"}]'),

('Fortis Healthcare', 'India', 'Delhi', 28.5494, 77.2001, true, ARRAY['Cardiology', 'Neurology', 'Oncology', 'Orthopedics'], ARRAY['English', 'Hindi'], 4.3, 9500, 'international@fortishealthcare.com', '25 mins from DEL', '[{"name": "Brain Surgery", "price_range": "$12,000 - $18,000", "wait_time": "1-2 weeks"}]'),

('Manipal Hospital', 'India', 'Bangalore', 12.9141, 77.6101, true, ARRAY['Cardiology', 'Nephrology', 'Orthopedics'], ARRAY['English', 'Hindi', 'Kannada'], 4.5, 7200, 'info@manipalhospitals.com', '35 mins from BLR', '[{"name": "Kidney Transplant", "price_range": "$15,000 - $20,000", "wait_time": "3-6 weeks"}]'),

('Max Healthcare', 'India', 'Delhi', 28.5355, 77.2652, true, ARRAY['Cardiology', 'Oncology', 'Orthopedics', 'Neurology'], ARRAY['English', 'Hindi'], 4.6, 8900, 'international@maxhealthcare.com', '30 mins from DEL', '[{"name": "Spine Surgery", "price_range": "$8,000 - $12,000", "wait_time": "1-2 weeks"}]');

-- Turkey
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Acibadem Healthcare Group', 'Turkey', 'Istanbul', 41.0082, 29.0909, true, ARRAY['Oncology', 'Cardiology', 'Ophthalmology', 'Orthopedics'], ARRAY['English', 'Turkish', 'Arabic', 'Russian'], 4.7, 15000, 'international@acibadem.com', '40 mins from IST', '[{"name": "LASIK Surgery", "price_range": "$1,500 - $2,500", "wait_time": "2-3 days"}, {"name": "Hair Transplant", "price_range": "$2,000 - $4,000", "wait_time": "1 week"}]'),

('Memorial Hospital', 'Turkey', 'Istanbul', 41.0392, 29.0597, true, ARRAY['Oncology', 'Cardiology', 'IVF', 'Bariatric Surgery'], ARRAY['English', 'Turkish', 'Arabic'], 4.6, 10500, 'info@memorial.com.tr', '45 mins from IST', '[{"name": "Gastric Bypass", "price_range": "$6,000 - $9,000", "wait_time": "1 week"}]'),

('Liv Hospital', 'Turkey', 'Istanbul', 41.0543, 29.0312, true, ARRAY['Cardiology', 'Orthopedics', 'Neurology'], ARRAY['English', 'Turkish', 'German'], 4.5, 7800, 'contact@livhospital.com', '35 mins from IST', '[{"name": "Heart Valve Replacement", "price_range": "$12,000 - $18,000", "wait_time": "1-2 weeks"}]');

-- Singapore
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Mount Elizabeth Hospital', 'Singapore', 'Singapore', 1.3048, 103.8355, true, ARRAY['Cardiology', 'Oncology', 'Orthopedics', 'Neurology'], ARRAY['English', 'Mandarin', 'Malay'], 4.5, 5600, 'enquiries@mountelizabeth.com.sg', '20 mins from SIN', '[{"name": "Robotic Surgery", "price_range": "$20,000 - $35,000", "wait_time": "1-2 weeks"}]'),

('Raffles Hospital', 'Singapore', 'Singapore', 1.3000, 103.8559, true, ARRAY['Cardiology', 'Orthopedics', 'Gastroenterology'], ARRAY['English', 'Mandarin'], 4.6, 4200, 'international@rafflesmedical.com', '18 mins from SIN', '[{"name": "Colonoscopy", "price_range": "$1,500 - $2,500", "wait_time": "3-5 days"}]');

-- Malaysia
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Prince Court Medical Centre', 'Malaysia', 'Kuala Lumpur', 3.1319, 101.6841, true, ARRAY['Cardiology', 'Oncology', 'Orthopedics', 'Fertility'], ARRAY['English', 'Malay', 'Mandarin'], 4.6, 6800, 'enquiry@princecourt.com', '35 mins from KUL', '[{"name": "Cardiac Angioplasty", "price_range": "$8,000 - $12,000", "wait_time": "3-5 days"}]'),

('Gleneagles Hospital Kuala Lumpur', 'Malaysia', 'Kuala Lumpur', 3.1570, 101.7124, true, ARRAY['Oncology', 'Orthopedics', 'Neurology'], ARRAY['English', 'Malay', 'Mandarin'], 4.5, 5100, 'info@gleneagles.com.my', '32 mins from KUL', '[{"name": "Joint Replacement", "price_range": "$10,000 - $14,000", "wait_time": "1 week"}]');

-- South Korea
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Samsung Medical Center', 'South Korea', 'Seoul', 37.4881, 127.0859, true, ARRAY['Oncology', 'Cardiology', 'Organ Transplants'], ARRAY['English', 'Korean'], 4.7, 18000, 'international@samsung.com', '50 mins from ICN', '[{"name": "Cancer Proton Therapy", "price_range": "$40,000 - $60,000", "wait_time": "2-3 weeks"}]'),

('Asan Medical Center', 'South Korea', 'Seoul', 37.5268, 127.1086, true, ARRAY['Cardiology', 'Oncology', 'Transplants'], ARRAY['English', 'Korean', 'Chinese'], 4.6, 16500, 'global@amc.seoul.kr', '55 mins from ICN', '[{"name": "Heart Transplant", "price_range": "$80,000 - $120,000", "wait_time": "4-8 weeks"}]');

-- United Arab Emirates
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Cleveland Clinic Abu Dhabi', 'United Arab Emirates', 'Abu Dhabi', 24.5247, 54.4338, true, ARRAY['Cardiology', 'Oncology', 'Neurology', 'Orthopedics'], ARRAY['English', 'Arabic'], 4.7, 8900, 'international@clevelandclinicabudhabi.ae', '30 mins from AUH', '[{"name": "Complex Heart Surgery", "price_range": "$35,000 - $55,000", "wait_time": "1-2 weeks"}]'),

('American Hospital Dubai', 'United Arab Emirates', 'Dubai', 25.1347, 55.2026, true, ARRAY['Cardiology', 'Oncology', 'Orthopedics', 'Maternity'], ARRAY['English', 'Arabic'], 4.6, 7500, 'info@ahdubai.com', '15 mins from DXB', '[{"name": "Maternity Package", "price_range": "$8,000 - $12,000", "wait_time": "As needed"}]');

-- Mexico
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Hospital Angeles Tijuana', 'Mexico', 'Tijuana', 32.5027, -117.0132, true, ARRAY['Bariatric Surgery', 'Dental', 'Cosmetic Surgery'], ARRAY['English', 'Spanish'], 4.5, 4200, 'info@hospitalangelestijuana.com', '20 mins from TIJ', '[{"name": "Gastric Sleeve", "price_range": "$4,500 - $7,000", "wait_time": "1 week"}, {"name": "Dental Veneers", "price_range": "$400 - $800 per tooth", "wait_time": "3-5 days"}]'),

('Hospital San Jose Tec de Monterrey', 'Mexico', 'Monterrey', 25.6866, -100.3161, true, ARRAY['Cardiology', 'Oncology', 'Orthopedics'], ARRAY['English', 'Spanish'], 4.6, 5800, 'international@hospitalsanjose.com', '25 mins from MTY', '[{"name": "Hip Replacement", "price_range": "$12,000 - $16,000", "wait_time": "1-2 weeks"}]');

-- Costa Rica
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('CIMA Hospital', 'Costa Rica', 'San Jose', 9.9647, -84.1235, true, ARRAY['Cardiology', 'Orthopedics', 'Cosmetic Surgery', 'Dental'], ARRAY['English', 'Spanish'], 4.7, 6100, 'international@hospitalcima.com', '20 mins from SJO', '[{"name": "Dental Implants Full Arch", "price_range": "$8,000 - $12,000", "wait_time": "1 week"}, {"name": "Facelift", "price_range": "$6,000 - $9,000", "wait_time": "1 week"}]'),

('Hospital Clinica Biblica', 'Costa Rica', 'San Jose', 9.9333, -84.0833, true, ARRAY['Cardiology', 'Oncology', 'Orthopedics'], ARRAY['English', 'Spanish'], 4.5, 4900, 'info@clinicabiblica.com', '18 mins from SJO', '[{"name": "Knee Arthroscopy", "price_range": "$5,000 - $7,000", "wait_time": "3-5 days"}]');

-- Spain
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Hospital Quironsalud Barcelona', 'Spain', 'Barcelona', 41.3926, 2.1406, true, ARRAY['Oncology', 'Cardiology', 'Neurology', 'Orthopedics'], ARRAY['English', 'Spanish', 'Catalan'], 4.6, 7200, 'international@quironsalud.es', '15 mins from BCN', '[{"name": "Minimally Invasive Spine Surgery", "price_range": "$15,000 - $22,000", "wait_time": "1-2 weeks"}]'),

('Hospital Universitario HM Monteprincipe', 'Spain', 'Madrid', 40.4637, -3.8223, true, ARRAY['Oncology', 'Cardiology', 'Fertility'], ARRAY['English', 'Spanish'], 4.7, 5600, 'info@hmhospitales.com', '30 mins from MAD', '[{"name": "IVF with PGD", "price_range": "$8,000 - $12,000", "wait_time": "1 month"}]');

-- Germany
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Charite University Hospital', 'Germany', 'Berlin', 52.5252, 13.3768, true, ARRAY['Oncology', 'Cardiology', 'Neurology', 'Transplants'], ARRAY['English', 'German'], 4.5, 9800, 'international@charite.de', '30 mins from BER', '[{"name": "Advanced Cancer Treatment", "price_range": "$25,000 - $45,000", "wait_time": "2-3 weeks"}]'),

('Munich Clinic', 'Germany', 'Munich', 48.1351, 11.5820, true, ARRAY['Orthopedics', 'Cardiology', 'Oncology'], ARRAY['English', 'German'], 4.6, 7400, 'info@munich-clinic.de', '40 mins from MUC', '[{"name": "Complex Joint Replacement", "price_range": "$18,000 - $25,000", "wait_time": "1-2 weeks"}]');

-- Brazil
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Hospital Israelita Albert Einstein', 'Brazil', 'São Paulo', -23.5989, -46.7145, true, ARRAY['Oncology', 'Cardiology', 'Orthopedics', 'Neurology'], ARRAY['English', 'Portuguese'], 4.7, 11500, 'international@einstein.br', '35 mins from GRU', '[{"name": "Stem Cell Therapy", "price_range": "$15,000 - $30,000", "wait_time": "2-4 weeks"}]'),

('Hospital Sirio-Libanes', 'Brazil', 'São Paulo', -23.5629, -46.6544, true, ARRAY['Oncology', 'Cardiology', 'Neurology'], ARRAY['English', 'Portuguese'], 4.6, 9200, 'info@hsl.org.br', '30 mins from GRU', '[{"name": "Robotic Prostatectomy", "price_range": "$12,000 - $18,000", "wait_time": "1-2 weeks"}]');

-- Colombia
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Fundacion Santa Fe de Bogota', 'Colombia', 'Bogotá', 4.6586, -74.0640, true, ARRAY['Cardiology', 'Oncology', 'Orthopedics', 'Cosmetic Surgery'], ARRAY['English', 'Spanish'], 4.6, 8100, 'international@fsfb.org.co', '35 mins from BOG', '[{"name": "Brazilian Butt Lift", "price_range": "$4,000 - $7,000", "wait_time": "1 week"}, {"name": "Rhinoplasty", "price_range": "$3,500 - $5,500", "wait_time": "1 week"}]'),

('Clinica El Bosque', 'Colombia', 'Bogotá', 4.6906, -74.0440, true, ARRAY['Cardiology', 'Orthopedics', 'Plastic Surgery'], ARRAY['English', 'Spanish'], 4.5, 6400, 'info@clinicaelbosque.com', '30 mins from BOG', '[{"name": "Liposuction", "price_range": "$3,000 - $5,000", "wait_time": "3-5 days"}]');

-- Czech Republic
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Na Homolce Hospital', 'Czech Republic', 'Prague', 50.0755, 14.3975, true, ARRAY['Cardiology', 'Neurology', 'Orthopedics'], ARRAY['English', 'Czech', 'German'], 4.6, 5200, 'international@homolka.cz', '25 mins from PRG', '[{"name": "Cardiac Surgery", "price_range": "$18,000 - $28,000", "wait_time": "1-2 weeks"}]'),

('Motol University Hospital', 'Czech Republic', 'Prague', 50.0766, 14.3405, true, ARRAY['Oncology', 'Pediatrics', 'Neurology'], ARRAY['English', 'Czech'], 4.5, 4800, 'info@fnmotol.cz', '20 mins from PRG', '[{"name": "Pediatric Surgery", "price_range": "$12,000 - $20,000", "wait_time": "1-3 weeks"}]');

-- Israel
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Sheba Medical Center', 'Israel', 'Tel Aviv', 32.0588, 34.8010, true, ARRAY['Oncology', 'Cardiology', 'Neurology', 'Rehabilitation'], ARRAY['English', 'Hebrew', 'Russian'], 4.7, 13200, 'international@sheba.health.gov.il', '15 mins from TLV', '[{"name": "Advanced Cancer Immunotherapy", "price_range": "$30,000 - $50,000", "wait_time": "2-3 weeks"}]'),

('Tel Aviv Sourasky Medical Center', 'Israel', 'Tel Aviv', 32.0719, 34.7872, true, ARRAY['Cardiology', 'Oncology', 'Orthopedics'], ARRAY['English', 'Hebrew'], 4.6, 10800, 'info@tlvmc.gov.il', '18 mins from TLV', '[{"name": "Minimally Invasive Heart Surgery", "price_range": "$25,000 - $38,000", "wait_time": "1-2 weeks"}]');

-- Jordan
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('King Hussein Cancer Center', 'Jordan', 'Amman', 31.9907, 35.8664, true, ARRAY['Oncology', 'Hematology'], ARRAY['English', 'Arabic'], 4.8, 7600, 'international@khcc.jo', '35 mins from AMM', '[{"name": "Bone Marrow Transplant", "price_range": "$40,000 - $70,000", "wait_time": "3-5 weeks"}]'),

('Arab Medical Center', 'Jordan', 'Amman', 31.9639, 35.8663, true, ARRAY['Cardiology', 'Orthopedics', 'Fertility'], ARRAY['English', 'Arabic'], 4.6, 5900, 'info@amc.jo', '32 mins from AMM', '[{"name": "IVF Treatment", "price_range": "$5,000 - $8,000", "wait_time": "1 month"}]');

-- Taiwan
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Taipei Medical University Hospital', 'Taiwan', 'Taipei', 25.0330, 121.5654, true, ARRAY['Oncology', 'Cardiology', 'Neurology'], ARRAY['English', 'Mandarin'], 4.5, 8700, 'international@tmuh.org.tw', '40 mins from TPE', '[{"name": "Minimally Invasive Surgery", "price_range": "$10,000 - $18,000", "wait_time": "1 week"}]'),

('Chang Gung Memorial Hospital', 'Taiwan', 'Taipei', 25.0618, 121.3754, true, ARRAY['Transplants', 'Cardiology', 'Oncology'], ARRAY['English', 'Mandarin'], 4.6, 12400, 'info@cgmh.org.tw', '20 mins from TPE', '[{"name": "Liver Transplant", "price_range": "$35,000 - $55,000", "wait_time": "4-8 weeks"}]');

-- Panama
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Punta Pacifica Hospital', 'Panama', 'Panama City', 8.9662, -79.5259, true, ARRAY['Cardiology', 'Oncology', 'Orthopedics'], ARRAY['English', 'Spanish'], 4.7, 5400, 'international@puntapacifica.com', '20 mins from PTY', '[{"name": "Cardiac Catheterization", "price_range": "$8,000 - $12,000", "wait_time": "3-5 days"}]'),

('Hospital Nacional', 'Panama', 'Panama City', 9.0087, -79.5155, true, ARRAY['Orthopedics', 'Neurology', 'Cardiology'], ARRAY['English', 'Spanish'], 4.5, 4600, 'info@hospitalnacional.com', '18 mins from PTY', '[{"name": "Spinal Fusion", "price_range": "$15,000 - $22,000", "wait_time": "1-2 weeks"}]');

-- Hungary
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Medicover Hospital', 'Hungary', 'Budapest', 47.4979, 19.0402, true, ARRAY['Orthopedics', 'Dental', 'Cardiology'], ARRAY['English', 'Hungarian', 'German'], 4.6, 4200, 'international@medicover.hu', '25 mins from BUD', '[{"name": "Full Mouth Dental Reconstruction", "price_range": "$8,000 - $15,000", "wait_time": "1 week"}]'),

('Semmelweis University Hospital', 'Hungary', 'Budapest', 47.4979, 19.0629, true, ARRAY['Cardiology', 'Oncology', 'Neurology'], ARRAY['English', 'Hungarian'], 4.5, 6800, 'info@semmelweis.hu', '30 mins from BUD', '[{"name": "Complex Cardiac Surgery", "price_range": "$20,000 - $32,000", "wait_time": "2-3 weeks"}]');

-- Lithuania
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Nordclinic Vilnius', 'Lithuania', 'Vilnius', 54.7104, 25.2797, true, ARRAY['Dental', 'Cosmetic Surgery', 'Orthopedics'], ARRAY['English', 'Lithuanian', 'Russian'], 4.7, 3800, 'info@nordclinic.lt', '12 mins from VNO', '[{"name": "Dental Implants", "price_range": "$800 - $1,500 per tooth", "wait_time": "3-5 days"}]'),

('Kardiolita Hospital', 'Lithuania', 'Vilnius', 54.6872, 25.2797, true, ARRAY['Cardiology', 'Orthopedics'], ARRAY['English', 'Lithuanian'], 4.6, 3200, 'international@kardiolita.lt', '15 mins from VNO', '[{"name": "Heart Valve Surgery", "price_range": "$15,000 - $25,000", "wait_time": "1-2 weeks"}]');
