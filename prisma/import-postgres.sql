-- Generated from MySQL dump for PostgreSQL
BEGIN;
SET standard_conforming_strings = off;
TRUNCATE "account", "amenities", "cartitem", "cart", "customorder", "orderitem", "order", "passwordresettoken", "payment", "reservation", "roomamenities", "room", "user" CASCADE;
INSERT INTO "user" ("id", "name", "email", "username", "password", "emailVerified", "image", "role", "phone", "createdAt", "updatedAt") VALUES
('cmjwl1r1b0000bn2knd28pxv3', 'lana', 'lanabintang54@gmail.com', 'lana', '$2b$10$SDEdRYf1xOvLMMVUcXv7SOhxUyodlCA2i8UHDTG3gQO30G/zO0Wba', NULL, NULL, 'ADMIN', '085749379253', '2026-01-02 07:59:05.760', '2026-01-02 07:59:05.760'),
('cmjwm16tv0003bn2kb82vh2dy', 'andre', 'andreasnath@gmail.com', 'andre', '$2b$10$2o3mJ3O4UhpfnQdcpPiaxOknfLH9ARRVKY4.PrWY0qch7GprsiTxy', NULL, NULL, 'OWNER', '085771753354', '2026-01-02 08:26:39.187', '2026-01-02 08:26:39.187'),
('cmjwuubzc0000bnvs5ekp3r0j', 'arip', 'dwyarifpra@gmail.com', 'arip', '$2b$10$qC6ktjI.dUGrEi0.4xDWS.x.zK9/i2Id9ULNTvgKn0WnQmlPUea2.', NULL, NULL, 'CUSTOMER', '082139722928', '2026-01-02 12:33:15.817', '2026-01-02 12:33:15.817'),
('cmjwvdu6m0001bnvsend0ve5v', 'dwy', 'dwy@gmail.com', 'dwy', '$2b$10$YO2RH2uqsVme7ZlfOKhP4.2GcXELdlokyA8y0kpTVhRMgdFp2pSKC', NULL, NULL, 'CUSTOMER', '08123456773', '2026-01-02 12:48:25.870', '2026-01-02 12:48:25.870');
INSERT INTO "room" ("id", "name", "description", "image", "price", "capacity", "createdAt", "updatedAt") VALUES
('cmjwlxkvd0001bn2knjvhb4po', 'Meja Kerja', 'Tes Produk 1 edit\r\n', '/uploads/1767342230756-meja-kerja.jpg', 1250000, 10, '2026-01-02 08:23:50.761', '2026-01-02 12:27:21.683'),
('cmjwlykti0002bn2k8eim7d34', 'Set Kursi Tamu', 'tes produk 2\r\n', '/uploads/1767342277344-set-kursi-tamu.jpeg', 2500000, 19, '2026-01-02 08:24:37.350', '2026-01-02 08:24:37.350');
INSERT INTO "cart" ("id", "userId", "createdAt", "updatedAt") VALUES
('cmjwmayqv0005bn2kxgkgfr57', 'cmjwm16tv0003bn2kb82vh2dy', '2026-01-02 08:34:15.271', '2026-01-02 08:34:15.271'),
('cmjwvegf60003bnvs4wngw11o', 'cmjwvdu6m0001bnvsend0ve5v', '2026-01-02 12:48:54.691', '2026-01-02 12:48:54.691');
INSERT INTO "cartitem" ("id", "cartId", "roomId", "quantity", "price", "createdAt", "updatedAt") VALUES
('cmjwvegfg0005bnvswclkvqm6', 'cmjwvegf60003bnvs4wngw11o', 'cmjwlykti0002bn2k8eim7d34', 1, 2500000, '2026-01-02 12:48:54.701', '2026-01-02 12:48:54.701');
INSERT INTO "order" ("id", "orderCode", "userId", "paymentStatus", "shippingStatus", "grossAmount", "recipientName", "recipientPhone", "addressLine", "city", "province", "postalCode", "createdAt", "updatedAt") VALUES
('cmjwmbsi3000bbn2kxawjxp0e', 'KM-1767342893829', 'cmjwm16tv0003bn2kb82vh2dy', 'PAID', 'DELIVERED', 3750000, 'lana', '085749379253', 'jalan angsa', 'malang', 'jawa timur', '65111', '2026-01-02 08:34:53.835', '2026-01-02 08:36:44.564');
INSERT INTO "orderitem" ("id", "orderId", "roomId", "quantity", "price", "name", "image", "createdAt", "updatedAt") VALUES
('cmjwmbsi3000dbn2keo08qypg', 'cmjwmbsi3000bbn2kxawjxp0e', 'cmjwlxkvd0001bn2knjvhb4po', 1, 1250000, 'Meja Kerja', '/uploads/1767342230756-meja-kerja.jpg', '2026-01-02 08:34:53.835', '2026-01-02 08:34:53.835'),
('cmjwmbsi3000ebn2k1j8k2981', 'cmjwmbsi3000bbn2kxawjxp0e', 'cmjwlykti0002bn2k8eim7d34', 1, 2500000, 'Set Kursi Tamu', '/uploads/1767342277344-set-kursi-tamu.jpeg', '2026-01-02 08:34:53.835', '2026-01-02 08:34:53.835');
COMMIT;
