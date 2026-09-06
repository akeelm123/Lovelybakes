BEGIN;
-- Existing UAT creations retain sample prices until reviewed by the owner.
INSERT INTO product (product_id, name, description, category, image_path, image_alternative_text, price_cents, status) VALUES
('9f263e79-b28f-5e11-ab3b-47b5a7c1064e', 'Vintage Pink', 'A celebration in pink, with intricate piping and floral details.', 'Celebration', '/lovelybakes/vintage-pink.jpg', 'Lovelybakes pink vintage cake with piped swags, flowers and a gold birthday topper', 6800, 'published'),
('0c3c8832-b192-5f75-a4b2-3872dbc0a08b', 'Floral Marble', 'Soft roses meet a striking grey marbled finish.', 'Celebration', '/lovelybakes/floral-marble.jpg', 'Lovelybakes grey marble cake decorated with pale roses', 7200, 'published'),
('a9b3b047-0f20-52e1-b837-7423b758620a', 'Written in the Stars', 'Midnight blue, golden stars and a telescope topper.', 'Celebration', '/lovelybakes/celestial.jpg', 'Lovelybakes blue and gold astronomy birthday cake with a telescope topper', 7600, 'published'),
('97953e0f-8f31-5315-a57e-797387915ff5', 'A Little Character', 'Colourful birthday details with a handmade character topper.', 'Celebration', '/lovelybakes/character.jpg', 'Lovelybakes turquoise birthday cake with a handmade mouse character and yellow stars', 7600, 'published'),
('3a4d8b08-bc5b-59fe-b057-d52b1506def5', 'Chocolate & Butterflies', 'Purple piping, a chocolate drip and a playful chocolate topping.', 'Celebration', '/lovelybakes/chocolate-drip.jpg', 'Lovelybakes purple cake with chocolate drip, chocolates and butterfly decorations', 7200, 'published'),
('ef428379-cb78-5c70-94ce-b4497798972e', 'Little Celebrations', 'A box of cupcakes finished with deep red swirls and golden details.', 'Cupcakes', '/lovelybakes/cupcakes.jpg', 'Box of Lovelybakes cupcakes with burgundy frosting and gold sprinkles', 3200, 'published')
ON CONFLICT (product_id) DO NOTHING;
COMMIT;
