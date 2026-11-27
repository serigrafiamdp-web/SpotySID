-- TEST432 / Cloudflare D1 / SpotySID: exact 104-entry Thunder cleanup.
-- The only user-approved permanent records are 13 RICO + 3 Uctumi (16).
-- Execute AUDIT before this script; expected: total 120, thunder 104, other 16, conflicts 0.
-- This script DOES NOT delete GitHub binary files: remove those only AFTER D1 cleanup verified.
-- Existing historical playlist_backup_versions remain untouched (append-only journal).
-- D1 SQL execution may require statements to be run in order; NEVER skip the guard check.

CREATE TABLE IF NOT EXISTS test432_thunder_ids (sid_id TEXT PRIMARY KEY);
DELETE FROM test432_thunder_ids;
INSERT INTO test432_thunder_ids(sid_id) VALUES
('015e0eabc3d174d12523ca768e63c99c264bf66211cd7741ece897fd4c041788'),
('017af28f50f95e6e6bd02ff3b1e6207bba9a1eadccc037c8ffb0f820df325edf'),
('06664f2e5a5d5360c412d487e15f402c8c5cf0d287e7ab88bfcf679914119237'),
('07aedac86d708dd7605dcc7f794e07a9ea67db524d0855e668f9e080b2c87052'),
('0963375c18cfbea80a8b453ad782a5a73733c4d699c2957da681ffa60bdb156c'),
('0b9cd9c042252e280d1494a5e88b639abe08d8256c4452204a4c8b5b29dbe234'),
('0ea53d6fbadfa41d8eebc4969161e4284936f4808352a5db106fecacf46b8fe6'),
('1c0b3008b896f98a07bf675d79d3eee533f0df23bd91c8f1477138ba68fcf904'),
('21c8441f757f70eaa38aee68231b953d1a0614c8e972a2bb1bed69ec79a88b42'),
('25a848d8e2a0c73f38bb8c7c59d7a03fd40ace8b11fb77590fffab297db9b767'),
('26d9a0b0a04778ce88dcc68ea6b09a5c0cb31cf4a650f68245e9e91f0a09e950'),
('271cbb3d99071266b4a008cc8674356b0cf245b06ff578225cc2222b33d987e3'),
('2b073391013cfce1b7a159bacc82cf2a319ce3daf273347a7c62defc6a28f976'),
('2b80e484e0b4be56b1b97830407c4c4fb35bd7d9518f21804e66cd9b46954cff'),
('2e45bb0bafc0504177610d2e41a20edde41509421890e83ff3c36c44e5593890'),
('2eec231b5bdf78dcadba59e4e8b82504565246469af3062991faca99a0f4540d'),
('2f098d39f0771b6119110b56c1860d9223b428d95203808e2520911f594c756c'),
('303334597e136e3c283f7533a02fd745bda52931e7885bf1c2722c9dbd0e17fb'),
('317b2ef80841cfb857a700f0ce407562004b5c3d3c6053b1195dc5c72dc75f54'),
('318c866b89483cebc09ebd1c96a488d802dc2320df29f54138905e3ab87893ce'),
('3238ccbbea1ce662e1b5cd74482300abaf8a32e7293e1a72f55aa38879b5716d'),
('34b4e4f26efa7d22551c6336a38092b4e7b33b85ea034166a6cd0a253573c1e9'),
('359774eefa987c835198d36a66e87e86f7482cc36ed95aee6be9e69e3007f9e6'),
('3dd2c6684bc99b93757398bc9690a3ad3466dae792c81b8835f24281a469fb3b'),
('4cc8d84149f8a076460b8da6cd98fb8aef1a3f00c0ffcf56979c625ae708aa80'),
('4e115e88afde54bcdb898376fc45f169b74fb30c9b4c00f404dca3cac0effa40'),
('50195700ee49526cf95e7b10825662966d4c1a8ae0e7d6fb017cd18f5f2809e1'),
('51c6da9cd708c26681c338f461d65ab8cc4d8d99be364a90dd1fd409b2cb8667'),
('52ffca8fbd5836e51bd7025d6babc51abcd4612e8a456c147c486726ad482978'),
('55302a4f425f8fbc6066545f43d30360ed1cc6ce351e5a532a74cbf628b9f7ed'),
('577ad0656ae26741f7c84a238a75af4c7e621d7cc21b9af2a441cd66e472bcaf'),
('5959ad52ec7b7f75fd5abae76bfa10b8dbc42240d5c74df58dd9ad7da5e7c7b1'),
('5bad525b264ce0368e8f024a7c9e6f9fde9bc64bd8aa7cca8380fc11e2f6810b'),
('5e07d9053c1ff8ae25623a10f0bc1d192cbbd77cbc7dfeb1bb976ab11a9b4a60'),
('5f613377ce114e3705a76c93df1153b355bbef48a3b0e85501f9c7c253ccdee1'),
('627b22e8b01c1cf3fc11343d060ea91f59da3946d2b53f0450b0f7778ea84951'),
('642cbcb2276db6abf45c8f0532f618f100a111418d65c138f608dd88fc45a928'),
('6a17b0c95452162cb66318edc77ee95d35713d15eb0f0aa8a1c430ae8b85dd66'),
('70750faf09963cb6e23753bf10068e6b728e385322bbd66d0d5fd02218220e91'),
('72c9f370a7df2600bd2f50e593fb34734beb179b387d80c0661f1632b72c7b2e'),
('7544dded04de37733a0237d030ae1503ceff31ec151f4ce3c178288d87444d58'),
('766d02cfdbeac4c296aec71fd66b3778400b7fbd96a3ac888aa68c3913a89b15'),
('77f6abb5efd1cddbd420aa1ff83e9fee605a565fd4d3c0760cd3c181732de458'),
('7a1728ea09fb7e3f441799fb18c2233ac8cb5ee5f891013759c7f5f6c5534ac9'),
('7c0d85e034977ce41e6c9537753afcacac31c7c08feb09b28c23090574b8c3d4'),
('7e6e6ad4933f76ef05a024e19c4f5789da30c8d85b4d75d8be3a5b1a5aab5a55'),
('7e92e9521ede458eb72053dd8656a6ae59cda3892efabba0ca0404a2665e1270'),
('811e146924611d16a17ab087ac613eba9bf13efd428ae7e2d38885a75615bfd6'),
('86d7fb4acd91564efe9393e5714516ed89ce63508070db50342745d68aaf478e'),
('8abea2e784f76bd48707b5e62f48623395245246fe3d041260ccbcc88b51fee2'),
('8ca4202aec86409f974b65356f422dcf96ec5dcfddaf755269307d0dca26c48c'),
('8d96f175fea78071ee19be571d1cfc1ad9805a1262249566358e9c0e9a58d96c'),
('930b626d5a048fbf033a705455d7a0371229b8019707d1502eae467481f403b9'),
('9342d22e037ab1ea74c5a58f0d7dfbd65a0136394c03050e70ccd1378be4c004'),
('93da2ebb278632b656b1eed3591d943f39e60648674e808d49475c82c0ad0bd6'),
('948accf921b55df7267a22497455901241bc740962be7b941a35196ea21cff8a'),
('970fe040f9ab002228156013fc7d5504915a755304698abaf1c2946174a2a5c6'),
('9830ab5bfae25cfd3805a7169569e74142a2f15274bb449d0d9b277d0dde7c10'),
('990b1dd8b7eb8e7ec6e83d7a63e8eab6b5f806d5e88625fb15dbede89d366d7a'),
('9efdec33061ed0fe16691965279fdf76a38486f511d8af41da08d7cb9c5181d0'),
('9f771af263e0285301c41ee80bdfa5bd857079d624b7e3a461411b5a61866996'),
('a3a2614f13b58e243d673830d293a03ad7768cced3e95b98008315fde478c460'),
('a3cc46c0e8a79e3c3055621a8b2a937b998e8500971e9943300d4b9eefae52f7'),
('a5ed2b40c97d38f22581983038db53750230c080797ed1886b5e7eaa1aa2831c'),
('aa98ae8febc95ebee2feaaa71ff2078f4f150f8ddf6db89763d8b9843ec4577d'),
('abd86a0f1ebff3fa98f7aeb33f38e58eb0a28b36aa2edd3ff3d4c0c8c284d70c'),
('ac573c2df6705393c9070ed8965a66b8414debc019bd4da4b2b4008c4eb590ef'),
('ae57ef0b2c019ba9914cd949763c757fd52d443224a1a8eed9b80c2e3702fc9b'),
('af33f604ecba70cd5ceb1a87ba8adc5dc0e4ddc098dded4a61cb08f67b9569a1'),
('b018cfeaddaa84e2c43e8f0e59510a7da987b361acfb3a1d4e8dbaa106c7e69a'),
('b465101bf80b45efb88da2f73701291fa7ec7a3d30506bfe6b9a904bf8d10223'),
('b488b0108724cc774f5328025f499589ee9e7dcd5ba67f81023cc7f7ea9873db'),
('b5c00ec578504d45139c98d6092e9acc83266f21ce331928bb233bbef58621f7'),
('b682b20f83fc5a99cbbbde0ce7f301c529701588255c9558576d04cfa9b683d6'),
('b794f861756900da64c7ffcd165284e37c609ccbd19b5c45942aad77f8e23ecb'),
('bc2321eecf86795aac4a86e906068cc938d13bee2c9e6bde7d5461d37fcd30f9'),
('c0276933aef5ece22d712c3d35e195de892cb9168f786db62426bcd997c63550'),
('c2b7869902d0724ebc88fec9e18995c30444fd528ed66643b444e9c6947d2b8d'),
('c70d67aadefad000ffe1e5e9b46e8411fa8475474ed11db917472a73f768ecc6'),
('ca713ef92d6a8273af4f46b94eb208dd7a35235364487ca94064ef8caf75b540'),
('cae84577f4cdc4db5a9c15a8fbf253753088a2adec8af877ecf9d116b099edef'),
('cb77027ea6224d239727f5128e0466b70a9c541e26db091af69e8082ab51efd3'),
('cb9a13b87da9b4de9c905069c604753d40f6bf98a1268a96e5070f8cc5a3b85c'),
('cced4201dc6ff2ea81e6be6b48752b4afd31bc41859ed4a66f64679b967952ed'),
('ce210671dc83403368b888f333dd35e170fc406e6201252b04428fe1f943628f'),
('d33d8dc9167905d3e33943a8e217208d29841599c71d306a509f62bae8db653e'),
('d4cf12ef179f300595b2a655f041f599b4ca6517609e998f1a406c5606191ee5'),
('d50b0e1e4864ae08caea804b9e5239baff8fe04ac1b5b6a910c24fff29a06871'),
('d995f303bce2cc7d57c7171948a17d91a908445c7be2d2f09f25c1442933c510'),
('dbefbc94a21fa7a441adc1a16a09d55f0f79986c536e8e331394c086eedb46c1'),
('dcff9b7bb0e9557b4857875c3241629f57ae45d5626f821f43e147d3bba81fec'),
('e082468c28d12064ef49566d9aeac50c6ae12beccae44524996be28de27c14d3'),
('e5b3d92caa08da9ed632d94359a490e32fd0d8de1f4fd3bedd64f0f6ea0c8e91'),
('e613719abc9e968e84c457f4a41a458bb7a21924376fa61dc269a99a5c908e42'),
('ecf4a6569ce7d6b776c4767222d9a5e499edafa2285f6cac51e64c60aff6e7ff'),
('f55e01264419780420bbb7da33352e0958d7186e439b37331076088ea3cefb87'),
('f6ac6f42e09388ec927b899a464e01f49d5f345b2c6e0f36951cedfe91ea7fc6'),
('f783420de8257a622e007169f4ad9622ddaf9d5541c1fd4cb81860335032c39c'),
('f9b8b0b919a1d4d14720f59a437302cedd8f56204b06cf60cb32ad46ce3de5e3'),
('f9cc0c8a34c504ad7b02bc30f4a71520d4398198880776baca8be1e26ba17f21'),
('f9ef4f64914dd779b9d336e6930c2342130587dedd768cf0f57624198cbc2579'),
('fccbd763872d2af7db2a9c1b294de347a1da8a5001bcd4071122efa3c7ab3f05'),
('fdb02ccb5ddc4f5f92c070fd21dac2965699f08c2b0d05b7b60adc4692dd58e8'),
('fdcc0f123c21f6bc21d8a3bea43dd59abaded7a62a0ef4403ec96683527de8dd');

CREATE TABLE IF NOT EXISTS test432_keep_ids (sid_id TEXT PRIMARY KEY);
DELETE FROM test432_keep_ids;
INSERT INTO test432_keep_ids(sid_id) VALUES
('0d1bab81f0371a13fab1fbff83adf56485f0a985914a313791f61a5041b982ae'),
('0e2978ec9229481495f829829ed6484eca38d9d4b743c3ae712ef087f59b306b'),
('164266e3afcc903533f0f65f23633c174b0ca8d39363315390d6f92738068e9d'),
('16a5218a7c96d68258d66b769cfd4cdaa4055f601eeeebf794c3e8116d37232b'),
('36c4f644f02df11bb56de156210b3ac7ab93117b7ca6b51219e114c692e92d2e'),
('40379df77fbd72f82eb7f370deca1a88ce2d7d26d606539416be76c08bdb2a46'),
('472a60851fc218e49d489ee9baca7fec491621f19fcf977a8ce0b46f08cd179f'),
('5b57d84cfbc19326e856e7b7e63082fe7741a28ce5f60963802d26a8b19a33de'),
('72036d4c4426f9284b9e8052c5db916b7a5fb8ea842e0e1b824addb326466899'),
('85d6b1e1f80b3fca84e64579645db67652651fee5dc344d2f9561ee493fafa58'),
('95c3d9788d8ff3291d76ef1fa7b9a233ae36d45d833f8985d2383500e767c941'),
('a6d5e428666d2fab00ad408d02facc9b938c1bab5f148d79653d168f39519860'),
('b7e1f50acb8ed948b801fcbbaae2ebb57e5d712db3000ec2046f8f517748fe17'),
('f0015f99aefeceb081ecf56634f4f8416a1346c4816260caf31a8270df4f1efa'),
('f364bac4d588eb7357931280d166c389ffa0d08e35e4a97afdcc176357760542'),
('f9528b8576e011531286a9adfb52b570f23e78ddbac0fcf24c84e48e3ef68088');

-- Preserve original metadata and references in DB before changes.
CREATE TABLE IF NOT EXISTS test432_backup_provenance AS SELECT * FROM sid_provenance WHERE 0;
INSERT INTO test432_backup_provenance SELECT p.* FROM sid_provenance p WHERE p.sid_id IN (SELECT sid_id FROM test432_thunder_ids) AND NOT EXISTS (SELECT 1 FROM test432_backup_provenance b WHERE b.sid_id=p.sid_id);
CREATE TABLE IF NOT EXISTS test432_backup_assets AS SELECT * FROM sid_assets WHERE 0;
INSERT INTO test432_backup_assets SELECT a.* FROM sid_assets a WHERE a.id IN (SELECT sid_id FROM test432_thunder_ids) AND NOT EXISTS (SELECT 1 FROM test432_backup_assets b WHERE b.id=a.id);
CREATE TABLE IF NOT EXISTS test432_backup_collection_tracks AS SELECT * FROM sid_collection_tracks WHERE 0;
INSERT INTO test432_backup_collection_tracks SELECT c.* FROM sid_collection_tracks c WHERE c.sid_id IN (SELECT sid_id FROM test432_thunder_ids) AND NOT EXISTS (SELECT 1 FROM test432_backup_collection_tracks b WHERE b.collection_id=c.collection_id AND b.position=c.position AND b.sid_id=c.sid_id);
CREATE TABLE IF NOT EXISTS test432_backup_playlists AS SELECT * FROM playlists WHERE 0;
INSERT INTO test432_backup_playlists SELECT p.* FROM playlists p WHERE EXISTS (SELECT 1 FROM json_each(p.payload,'$.tracks') j WHERE json_extract(j.value,'$.sidId') IN (SELECT sid_id FROM test432_thunder_ids)) AND NOT EXISTS (SELECT 1 FROM test432_backup_playlists b WHERE b.id=p.id);

-- This CHECK gate prevents ANY removals unless the full 120=104+16 split is intact.
CREATE TABLE IF NOT EXISTS test432_gate(
 id INTEGER PRIMARY KEY CHECK(id=1),
 total INTEGER CHECK(total=120),
 thunder INTEGER CHECK(thunder=104),
 retained INTEGER CHECK(retained=16),
 preserved INTEGER CHECK(preserved=16),
 no_hvsc_thunder INTEGER CHECK(no_hvsc_thunder=104),
 asset_count INTEGER CHECK(asset_count=104),
 backed_up INTEGER CHECK(backed_up=104),
 backed_assets INTEGER CHECK(backed_assets=104),
 protected_conflicts INTEGER CHECK(protected_conflicts=0),
 overlapping_ids INTEGER CHECK(overlapping_ids=0),
 backups_of_playlists INTEGER CHECK(backups_of_playlists=0)
);
DELETE FROM test432_gate;
INSERT INTO test432_gate SELECT 1,
 (SELECT COUNT(*) FROM sid_provenance),
 (SELECT COUNT(*) FROM sid_provenance WHERE sid_id IN (SELECT sid_id FROM test432_thunder_ids)),
 (SELECT COUNT(*) FROM sid_provenance WHERE sid_id NOT IN (SELECT sid_id FROM test432_thunder_ids)),
 (SELECT COUNT(*) FROM sid_provenance WHERE sid_id IN (SELECT sid_id FROM test432_keep_ids)),
 (SELECT COUNT(*) FROM sid_collection_tracks WHERE collection_id='00000000-0000-4000-8000-000000000001' AND sid_id IN (SELECT sid_id FROM test432_thunder_ids)),
 (SELECT COUNT(*) FROM sid_assets WHERE id IN (SELECT sid_id FROM test432_thunder_ids)),
 (SELECT COUNT(*) FROM test432_backup_provenance),
 (SELECT COUNT(*) FROM test432_backup_assets),
 (SELECT COUNT(*) FROM sid_provenance WHERE sid_id IN (SELECT sid_id FROM test432_thunder_ids) AND (lower(author) LIKE '%rico%' OR lower(author) LIKE '%uctumi%')),
 (SELECT COUNT(*) FROM test432_thunder_ids WHERE sid_id IN (SELECT sid_id FROM test432_keep_ids)),
 ((SELECT COUNT(*) FROM playlists p WHERE EXISTS (SELECT 1 FROM json_each(p.payload,'$.tracks') j WHERE json_extract(j.value,'$.sidId') IN (SELECT sid_id FROM test432_thunder_ids))) - (SELECT COUNT(*) FROM test432_backup_playlists));
-- Must return 1 row with 120,104,16,16,104,104,104,104,0,0,0, or STOP here.
SELECT * FROM test432_gate;

-- Archive existing affected public playlists before updating their track arrays.
INSERT INTO playlist_backup_versions(playlist_id,payload,event,captured_at,track_count)
 SELECT p.id,p.payload,'test432-pre-purge',CAST(unixepoch('now')*1000 AS INTEGER),p.track_count
 FROM playlists p WHERE EXISTS(SELECT 1 FROM test432_gate) AND EXISTS (
  SELECT 1 FROM json_each(p.payload,'$.tracks') j
  WHERE json_extract(j.value,'$.sidId') IN (SELECT sid_id FROM test432_thunder_ids));

-- Keep remaining SID order in every public playlist while removing only exact hashes.
UPDATE playlists
 SET track_count=(SELECT COUNT(*) FROM json_each(playlists.payload,'$.tracks') j
   WHERE json_extract(j.value,'$.sidId') NOT IN (SELECT sid_id FROM test432_thunder_ids) OR json_extract(j.value,'$.sidId') IS NULL),
 payload=json_set(payload,'$.tracks',json((SELECT json_group_array(json(x.value)) FROM (
   SELECT j.value AS value FROM json_each(playlists.payload,'$.tracks') j
   WHERE json_extract(j.value,'$.sidId') NOT IN (SELECT sid_id FROM test432_thunder_ids) OR json_extract(j.value,'$.sidId') IS NULL
   ORDER BY CAST(j.key AS INTEGER)) x)))
 WHERE EXISTS(SELECT 1 FROM test432_gate) AND EXISTS (
  SELECT 1 FROM json_each(playlists.payload,'$.tracks') j WHERE json_extract(j.value,'$.sidId') IN (SELECT sid_id FROM test432_thunder_ids));

-- Remove archive and contributed collection references. Preserve the other 16 SID.
DELETE FROM sid_collection_tracks WHERE sid_id IN (SELECT sid_id FROM test432_thunder_ids) AND EXISTS(SELECT 1 FROM test432_gate);
UPDATE sid_collections SET track_count=(SELECT COUNT(*) FROM sid_collection_tracks WHERE collection_id=sid_collections.id)
 WHERE EXISTS(SELECT 1 FROM test432_gate) AND id IN (SELECT DISTINCT collection_id FROM test432_backup_collection_tracks);
DELETE FROM sid_provenance WHERE sid_id IN (SELECT sid_id FROM test432_thunder_ids) AND EXISTS(SELECT 1 FROM test432_gate);
DELETE FROM sid_assets WHERE id IN (SELECT sid_id FROM test432_thunder_ids) AND EXISTS(SELECT 1 FROM test432_gate);

-- Expected result after applying: 16 metadata, 16 in NO HVSC, 0 Thunder references.
SELECT
 (SELECT COUNT(*) FROM sid_provenance) AS no_hvsc_remaining,
 (SELECT COUNT(*) FROM sid_collection_tracks WHERE collection_id='00000000-0000-4000-8000-000000000001') AS collection_remaining,
 (SELECT COUNT(*) FROM sid_provenance WHERE sid_id IN (SELECT sid_id FROM test432_keep_ids)) AS protected_remaining,
 (SELECT COUNT(*) FROM sid_provenance WHERE sid_id IN (SELECT sid_id FROM test432_thunder_ids)) AS thunder_remaining;
