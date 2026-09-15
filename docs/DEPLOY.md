# Panduan deploy ke publik (Robinhood Chain mainnet)

Urutan: **kontrak → indexer → keeper → website**. Semua langkah yang butuh tanda tangan wallet, login akun, atau private key dijalankan sendiri oleh pemilik proyek. Jangan pernah membagikan private key atau seed phrase ke siapa pun, termasuk ke asisten AI.

> ⚠️ Kontrak diluncurkan tanpa audit eksternal (keputusan pemilik proyek). Uang pengguna bisa hilang karena bug; mulai dengan jumlah kecil.

## 0. Yang perlu disiapkan

| Kebutuhan | Keterangan |
|---|---|
| 5 wallet | Dibuat oleh `contracts/script/generate-wallets.sh` (langkah 0a): deployer, owner, guardian, treasury, keeper |
| Akun | GitHub, [Vercel](https://vercel.com) (website), [Railway](https://railway.com) (indexer + keeper + Postgres) |
| Opsional | WalletConnect Cloud project id, webhook Discord/Slack untuk alert keeper, Pinata JWT untuk audit trail di IPFS |

Tools lokal: Node 22+, pnpm, Foundry (`~/.foundry/bin`).

### 0a. Buat semua wallet

Jalankan di terminalmu sendiri (interaktif):

```powershell
# PowerShell (Windows)
powershell -ExecutionPolicy Bypass -File contractsscriptgenerate-wallets.ps1
```

```bash
# Git Bash / macOS / Linux
bash contracts/script/generate-wallets.sh
```

Untuk tiap wallet kamu diminta password (input tersembunyi). Private key disimpan terenkripsi di `~/.foundry/keystores/underlying-<peran>` dan **tidak pernah ditampilkan**; alamatnya ditulis ke `contracts/deploy/wallets.env`.

**Backup** folder `~/.foundry/keystores/underlying-*` beserta password-nya (mis. di password manager + flashdisk offline). Kehilangan wallet `owner` = kehilangan hak admin protokol selamanya.

### 0b. Isi saldo (fund) di Robinhood Chain

| Wallet | Isi | Untuk |
|---|---|---|
| `DEPLOYER` | ± 0,006 ETH | deploy semua kontrak (~0,005 ETH) |
| `OWNER` | ± 0,002 ETH | `acceptOwnership`, menambah aset nanti |
| `GUARDIAN` | ± 0,001 ETH | pause darurat |
| `KEEPER` | ± 0,01 ETH, isi ulang berkala | update harga, graduation, buyback |
| `TREASURY` | tidak perlu | hanya menerima fee |

Cek saldo: `cast balance <alamat> --ether --rpc-url https://rpc.mainnet.chain.robinhood.com`

## 1. Deploy kontrak

```bash
pnpm install
cd contracts && forge build && cd ..

# 1a. Ambil harga pembuka dari sumber live yang disepakati.
#     Gagal = sumber belum sepakat (mis. Steam vs Skinport); tunggu lalu ulangi. Jangan isi harga manual.
pnpm --filter @rwa/keeper seed

# 1b. Simulasi dulu (tanpa broadcast). Di Windows, jalankan proxy RPC di terminal lain:
#     node contracts/script/rpc-proxy.mjs
cd contracts
set -a; source deploy/wallets.env; set +a
forge script script/DeployMainnet.s.sol --fork-url http://127.0.0.1:8548 --sender $DEPLOYER

# 1c. Broadcast (sungguhan). Minta password wallet deployer.
forge script script/DeployMainnet.s.sol --rpc-url http://127.0.0.1:8548 --account underlying-deployer --sender $DEPLOYER --broadcast --slow
```

Hasil: `contracts/deployments/mainnet.json`. **Commit file ini** — indexer dan website membacanya.

Setelah itu, wallet `OWNER` menerima kepemilikan (minta password wallet owner):

```bash
REGISTRY=$(node -e "console.log(require('./deployments/mainnet.json').assetRegistry)")
FACTORY=$(node -e "console.log(require('./deployments/mainnet.json').launchFactory)")
cast send $REGISTRY "acceptOwnership()" --account underlying-owner --rpc-url http://127.0.0.1:8548
cast send $FACTORY "acceptOwnership()" --account underlying-owner --rpc-url http://127.0.0.1:8548
cast call $REGISTRY "owner()(address)" --rpc-url http://127.0.0.1:8548   # harus sama dengan OWNER
```

Verifikasi (opsional): `forge verify-contract` ke Blockscout Robinhood Chain untuk tiap kontrak.

## 2. Push ke GitHub

```bash
git remote add origin git@github.com:<kamu>/<repo>.git
git push -u origin master
```

## 3–4. Indexer + keeper (Railway)

Railway menghapus Config-as-code untuk service baru, jadi setiap service memakai Dockerfile-nya sendiri (`indexer/Dockerfile`, `keeper/Dockerfile`, build context = root repo). Semuanya bisa dibuat dari CLI setelah `railway login`:

```bash
railway link                       # pilih project (harus sudah punya database Postgres)
railway add --service indexer --repo realworldlabs/realworld \
  --variables RAILWAY_DOCKERFILE_PATH=indexer/Dockerfile \
  --variables 'DATABASE_URL=${{Postgres.DATABASE_URL}}' \
  --variables RPC_URL=<URL RPC, mis. QuickNode> \
  --variables LOG_RANGE=5 \
  --variables DEPLOYMENTS_FILE=../contracts/deployments/mainnet.json
railway domain --service indexer   # URL publik indexer

railway add --service keeper --repo realworldlabs/realworld \
  --variables RAILWAY_DOCKERFILE_PATH=keeper/Dockerfile \
  --variables RPC_URL=https://rpc.mainnet.chain.robinhood.com \
  --variables REGISTRY=<assetRegistry> --variables PRICE_WALL=<priceWall> \
  --variables FACTORY=<launchFactory> --variables BUYBACK_VAULT=<buybackVault> \
  --variables ASSETS_FILE=assets.json
```

Lalu di dashboard Railway → service **keeper** → Variables, tambah `KEEPER_PRIVATE_KEY` (private key wallet keeper; tempel langsung, jangan simpan di file). Opsional: `ALERT_WEBHOOK`, `PINATA_JWT`.

Sukses kalau `https://<domain-indexer>/ready` menjawab 200 dan `/stats` menampilkan jumlah aset, dan log keeper (`railway logs --service keeper`) menulis `keeper started`.

## 5. Website (Vercel)

1. Vercel → **Add New Project** → import repo.
2. **Root Directory** = `web`. Framework = Next.js (terdeteksi otomatis). Biarkan "Include files outside the root directory" aktif.
3. Environment Variables:
   - `NEXT_PUBLIC_INDEXER_URL` = URL indexer dari langkah 3
   - `NEXT_PUBLIC_RPC_URL` = `https://rpc.mainnet.chain.robinhood.com`
   - `DEPLOYMENTS_FILE` = `../contracts/deployments/mainnet.json`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` = (opsional) dari cloud.reown.com
   - `ENABLE_EXPERIMENTAL_COREPACK` = `1` (agar Vercel memakai pnpm 11 sesuai `packageManager`)
   - **Jangan** set `NEXT_PUBLIC_DEVNET`
4. Deploy. Tambahkan domain sendiri di Settings → Domains bila ada.

Catatan Vercel:
- Jangan tandai `DEPLOYMENTS_FILE` sebagai *sensitive*: `vercel build` lokal menerima nilai `[SENSITIVE]` dan build gagal (sengaja, lihat `web/next.config.ts`). Deploy dari CLI: `cd web && NEXT_PUBLIC_DEVNET= DEPLOYMENTS_FILE=<path absolut mainnet.json> vercel build --prod && vercel deploy --prebuilt --prod` (`vercel build` ikut membaca `web/.env.local`, jadi variabel devnet harus dikosongkan eksplisit).
- Hobby plan memblokir deployment jika email author commit tidak cocok dengan akun GitHub yang terhubung. Pakai `git config user.email "<id>+<username>@users.noreply.github.com"`.

## 6. Cek setelah live

- Board menampilkan underlying di ticker tape dan halaman **Underlyings** menampilkan harga yang sama dengan `pnpm --filter @rwa/keeper probe`.
- Launch koin dari wallet uji (first buy opsional; cukup 0.0005 ETH launch fee + gas) → muncul di board dalam ± 1 menit.
- Beli & jual kecil, klaim fee di Portfolio.
- Keeper log: tidak ada `error` berulang.

## Redeploy seluruh stack (mis. setelah perubahan kontrak RWA)

1. Isi wallet deployer (± 0,006 ETH).
2. Jalankan proxy RPC di terminal lain: `node contracts\script\rpc-proxy.mjs`.
3. `powershell -ExecutionPolicy Bypass -File contracts\script\deploy-mainnet.ps1` (menjalankan seed harga lalu `DeployMainnet.s.sol`; minta password keystore `deployer`). Hasilnya `contracts/deployments/mainnet.json` — **periksa `startBlock`**: `block.number` di skrip bisa mengembalikan nomor blok L1 (mis. 25980808); ganti dengan blok tx pertama dari `broadcast/DeployMainnet.s.sol/4663/run-latest.json`. Lalu commit & push.
4. Railway → service indexer → Variables: perbarui `REGISTRY`, `PRICE_WALL`, `FACTORY`, `BUYBACK_VAULT` ke alamat baru. Indexer otomatis menghapus data lama saat melihat registry berbeda dan sync ulang dari `startBlock` baru.
5. Build & deploy web ulang (lihat catatan Vercel di atas).
6. Wallet `OWNER`: `acceptOwnership` di AssetRegistry dan LaunchFactory baru.

## Menambah underlying baru nanti

Aset di `keeper/assets.pending.json` (Big Mac, Charizard) butuh sumber kedua dulu. Setelah ada:

1. Dari multisig `OWNER`: jalankan `script/AddAsset.s.sol` (lihat header skrip) atau panggil `AssetRegistry.addAsset`.
2. Pindahkan entrinya ke `keeper/assets.json` dengan `assetId` yang diberikan registry, lalu redeploy keeper.
