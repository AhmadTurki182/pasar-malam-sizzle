# Pasar Malam Sizzle

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/AhmadTurki182/pasar-malam-sizzle/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/AhmadTurki182/pasar-malam-sizzle/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Pasar Malam Sizzle** — game masak di warung kaki lima pasar malam. Di bawah lampu warna-warni dan tenda bergaris, pelanggan mengantre dengan bar kesabaran: pilih siapa yang dilayani, racik pesanannya dari bahan di counter, masak di stasiun yang tepat (wajan atau panggangan) dengan timing bar, lalu sajikan selagi panas sebelum mereka kabur. Nasi Goreng, Mie Goreng, Sate Ayam, dan Es Teh Manis — semua digambar di canvas, semua suara disintesis WebAudio, tanpa aset luar sama sekali.

Kompetisi: [Make the best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137) — total hadiah $250, 10 besar dibayar (juara 1 $60). AI judge membandingkan game dua-dua lewat screenshot dan outline source; makin sering dipilih, makin tinggi peringkat.

## Run it

```sh
node serve.ts
```

Lalu buka http://localhost:8080 — tanpa build step, tanpa network, file statis biasa.

Mode screenshot (dipakai untuk screenshot entry): `?shot=start`, `?shot=play`, `?shot=rush`, `?shot=serve`, masing-masing dengan `&seed=7` untuk adegan yang tetap.

## Screenshots

1. `1-start.jpg` — layar judul di depan warung, dua pelanggan menunggu.
2. `2-play.jpg` — tengah permainan: antrean pelanggan, papan pesanan, hidangan sedang diracik.
3. `3-rush.jpg` — momen genting: masak di wajan dengan timing bar, pelanggan hampir kabur.
4. `4-serve.jpg` — hidangan sempurna di piring saji, siap diantar.

## How it plays

- **Pelanggan:** mengantre di depan warung dengan gelembung pesanan di atas kepala dan bar kesabaran di bawahnya. Klik pelanggan (atau barisnya di papan pesanan) untuk memilih siapa yang dilayani.
- **Bahan:** klik mangkuk bahan di counter (atau tombol 1–8) untuk memasukkannya ke piring racikan. Klik bahan di piring untuk mengeluarkannya; tombol BUANG mengosongkan piring.
- **Masak:** kalau isi piring sama persis dengan resep pesanan terpilih, tombol MASAK menyala. Tekan Spasi — penanda bergerak di bar timing, tekan Spasi lagi di zona hijau. Berhenti di tengah zona = SEMPURNA (+Rp 5.000). Melenceng jauh = gosong, bahan terbuang. Es Teh Manis tidak perlu dimasak.
- **Sajikan:** hidangan matang mendarat di piring saji. Klik piring saji atau tombol SAJIKAN (Enter) untuk mengantar ke pelanggan terpilih. Hidangan yang tidak dipesan siapa pun tidak bisa disajikan.
- **Skor:** harga hidangan × pengali kombo + bonus sempurna + tip pelanggan sabar. Kombo naik tiap sajian beruntun, reset kalau pelanggan kabur atau masakan gosong. Tiga pelanggan kabur = warung tutup. Hari berlangsung 150 detik; tiap 6 sajian naik level dan pelanggan makin cepat datang.

## Controls

- Mouse: klik pelanggan, bahan, piring, tombol MASAK / SAJIKAN / BUANG.
- Keyboard: 1–8 pilih bahan, Spasi masak / berhenti, Enter sajikan, T buang isi piring, M suara nyala/mati, R main lagi.

## Layout

- `game/index.html` — halaman game (canvas 1280×720).
- `game/src/main.js` — loop, state, input, logika pelanggan dan masak.
- `game/src/render.js` — semua gambar: langit malam, tenda, pelanggan, stasiun masak.
- `game/src/dishes.js` — resep, bahan, harga, RNG deterministik.
- `game/src/audio.js` — suara WebAudio (klik, desis wajan, ding sajian).
- `game/src/shots.js` — adegan tetap untuk screenshot.
- `main.ts` — program penyerahan: menyalin game/ + screenshots/ ke output dan menulis dossier.json.
- `serve.ts` — server statis lokal untuk play-test.
- `shots.json` — daftar 4 screenshot entry.
