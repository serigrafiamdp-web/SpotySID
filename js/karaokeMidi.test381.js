/* TEST381 — MIDI lyric timeline extracted from the user-supplied Karaoplay MIDI.
   Tempo 108 BPM, 120 ticks/quarter note, line break markers from MIDI 0x05.
   Each array position is one MIDI quarter note starting at tick 4440.
   Blank entries preserve pauses. This is source timing, not SID calibration.
   The karaoke UI owns formatting and synchronization separately.
*/
(function(){
  'use strict';
  var beats=[
"Si ","a ","tu corazón ","yo llego ","i","gu","a","l ~","todo ","siempre ","se ","podrá ","e","le","gir ~","no ","me ","escribas ","la ","p","a","r","e","d ~^","sólo ","quiero ","estar ","entre ","tu ","pi","e","l ~^","Y ","si ","acaso ","no ","brillara ","el ","s","o","l ~","y ","quedara ","yo ","atrapado ","a","qu","i ~","no ","veria ","la ","ra","zó","n ~","de ","seguir ","viviendo ","sin ","tu ","a","m","o","r ~","","","","~^","y ","hoy ","que ","enlo","quecido ","vuelvo ~^","buscan","do ","tu ","q","u","e","r","e","r ~^","no ","queda ","más ","que ","vi","en","t","o ~^","no ","queda ","mas ","que ","viento ~^","Y ","si ","acaso ","no ","brillara ","el ","s","o","l ~^","y ","quedara ","yo ","atrapado ","a","q","u","í ~","no ","veria ","la ","ra","z","ó","n ~","de ","seguir ","viviendo ","sin ","tu ","a","m","o","r ","","","","","","","","~","","","","","","","","","","","","","","","","","","","","","","","y ","hoy ","que ","enlo","quecido ","vuelvo ~^","buscan","do ","tu ","q","u","e","r","e","r ~^","no ","queda ","más ","que ","vi","en","to ~^","no ","queda ","mas ","que ","vi","en","t","o ~","","~","Y ","si ","acaso ","no ","brillara ","el ","s","o","l ~^","y ","quedara ","yo ","atrapado ","a","qu","í ~","no ","veria ","la ","ra","z","ó","n ~","de ","seguir ","viviendo ","sin ","tu ","a","m","o","r "
  ];
  // The source also has two consecutive empty timing beats in the long bridge.
  beats.splice(158,0,'','');
  // Original MIDI had 312 lyric meta-events including 89 empty markers.
  // The array above is a sparse, one-beat serialization of the 223 non-empty
  // lyric events; "~" separates lines and "^" marks a paragraph boundary.
  window.SpotySidKaraokeMidi={
    key:'uctumi-seguir-viviendo-sin-tu-amor',
    sidFile:'Seguir_Viviendo_Sin_Tu_Amor.sid',
    sidPack:'library/packs/musicians/U/Uctumi.zip',
    title:'Seguir viviendo sin tu amor',
    originalArtist:'Luis Alberto Spinetta',
    sidCoverBy:'Esteban Palladino (Uctumi)',
    // TEST383: real reference tempo from the supplied karaoke MIDI.
    karaokeBpm: 108,
    // TEST389: precomputed OFFLINE by rendering 120s of this actual Uctumi SID
    // with sidplayfp and analyzing the waveform in multiple intervals.
    // Across 5–110s the rhythmic autocorrelation peaked near 93–95 BPM.
    // This is an approximate fixed estimate, never measured while playing.
    sidBpmApprox: 94,
    // Use the SID tempo as the starting proposal for editable Karaoke BPM.
    // Source MIDI timing stays at exactly 108 BPM (secondsPerBeat below).
    initialKaraokeBpm: 94,
    secondsPerBeat: 60/108,
    firstBeat: 37,
    beats:beats
  };
})();