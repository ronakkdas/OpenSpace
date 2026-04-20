-- Seed data for OpenSpace: 6 Berkeley venues
-- Note: owner_id references a real business user; set to NULL for seed or use a known UUID.
-- Run this after schema.sql. You may need to update owner_id with a real user UUID.

INSERT INTO venues (id, name, description, type, address, lat, lng, hours_open, hours_close, max_capacity, current_count, popular_items, image_url, is_active)
VALUES
  (
    'a1b2c3d4-0001-0001-0001-000000000001',
    'Cafe Milano',
    'A beloved Berkeley institution on Bancroft Way. Exposed brick, warm lighting, and the best espresso near campus. Fills up fast between 10am and 2pm.',
    'cafe',
    '2522 Bancroft Way, Berkeley, CA 94704',
    37.8683,
    -122.2594,
    '07:00',
    '22:00',
    45,
    18,
    ARRAY['Cappuccino', 'Avocado Toast', 'Latte', 'Croissant', 'Cold Brew'],
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    true
  ),
  (
    'a1b2c3d4-0002-0002-0002-000000000002',
    'Cafe Strada',
    'Outdoor patio with views of the Campanile. Popular with graduate students and professors alike. Dog-friendly and always buzzing.',
    'cafe',
    '2300 College Ave, Berkeley, CA 94704',
    37.8697,
    -122.2549,
    '07:30',
    '23:00',
    60,
    32,
    ARRAY['Americano', 'Spinach Quiche', 'Chai Latte', 'Blueberry Scone', 'Matcha'],
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
    true
  ),
  (
    'a1b2c3d4-0003-0003-0003-000000000003',
    'Moffitt Library',
    'The undergraduate library at UC Berkeley. 24-hour access during finals. Multiple floors with collaborative and quiet zones. Robust WiFi throughout.',
    'library',
    '101 Doe Library, Berkeley, CA 94720',
    37.8726,
    -122.2602,
    '08:00',
    '24:00',
    350,
    142,
    ARRAY['Study Pods', 'Group Rooms', 'Printing', 'Whiteboards'],
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80',
    true
  ),
  (
    'a1b2c3d4-0004-0004-0004-000000000004',
    'Doe Library',
    'The main research library on campus. Grand reading rooms with high ceilings and natural light. Hushed atmosphere, strictly enforced. Laptop-friendly.',
    'library',
    '190 Doe Library, Berkeley, CA 94720',
    37.8728,
    -122.2598,
    '09:00',
    '21:00',
    200,
    88,
    ARRAY['Research Databases', 'Special Collections', 'Quiet Carrels', 'Microfilm'],
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80',
    true
  ),
  (
    'a1b2c3d4-0005-0005-0005-000000000005',
    'Free Speech Movement Cafe',
    'Historic cafe inside Moffitt Library. Named after the 1964 student movement. Great spot for a quick coffee between classes. Always lively.',
    'cafe',
    'Moffitt Library, UC Berkeley, CA 94720',
    37.8726,
    -122.2605,
    '08:00',
    '20:00',
    50,
    24,
    ARRAY['Drip Coffee', 'Sandwiches', 'Cookies', 'Smoothies', 'Tea'],
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
    true
  ),
  (
    'a1b2c3d4-0006-0006-0006-000000000006',
    'Brewed Awakening',
    'Cozy neighborhood coffee shop on Shattuck Avenue. Indie music, mismatched furniture, and a loyal local following. Power outlets at every seat.',
    'cafe',
    '2616 Durant Ave, Berkeley, CA 94704',
    37.8670,
    -122.2591,
    '07:00',
    '21:00',
    35,
    11,
    ARRAY['Pour Over', 'Breakfast Burrito', 'Oat Milk Latte', 'Banana Bread', 'Espresso'],
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Seed amenities
INSERT INTO venue_amenities (venue_id, label) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'WiFi'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Power Sockets'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Food Available'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'WiFi'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Outdoor Seating'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Food Available'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Pet Friendly'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'WiFi'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Power Sockets'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Quiet Zone'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Air Conditioning'),
  ('a1b2c3d4-0004-0004-0004-000000000004', 'WiFi'),
  ('a1b2c3d4-0004-0004-0004-000000000004', 'Quiet Zone'),
  ('a1b2c3d4-0004-0004-0004-000000000004', 'Air Conditioning'),
  ('a1b2c3d4-0005-0005-0005-000000000005', 'WiFi'),
  ('a1b2c3d4-0005-0005-0005-000000000005', 'Food Available'),
  ('a1b2c3d4-0006-0006-0006-000000000006', 'WiFi'),
  ('a1b2c3d4-0006-0006-0006-000000000006', 'Power Sockets'),
  ('a1b2c3d4-0006-0006-0006-000000000006', 'Food Available')
ON CONFLICT (venue_id, label) DO NOTHING;
