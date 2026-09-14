# Panduan deploy ke publik (Robinhood Chain mainnet)

Urutan: **kontrak → indexer → keeper → website**. Semua langkah yang butuh tanda tangan wallet, login akun, atau private key dijalankan sendiri oleh pemilik proyek. Jangan pernah membagikan private key atau seed phrase ke siapa pun, termasuk ke asisten AI.

> ⚠️ Kontrak belum diaudit. Deploy ke mainnet berarti uang sungguhan bisa hilang karena bug. Pertimbangkan audit eksternal dan batasi promosi sampai audit selesai.

## 0. Yang perlu disiapkan

| Kebutuhan | Keterangan |
|---|---|
| Wallet deployer | Berisi ± **0,006 ETH** di Robinhood Chain (deploy ~0,005 ETH) |
| `OWNER` | Alamat multisig (mis. Safe) yang akan memiliki registry & factory |
| `GUARDIAN` | Alamat multisig kedua, hanya bisa pause |
| `TREASURY` | Alamat penerima fee protokol, fee launch, fee redeem |
| `KEEPER` | Wallet **baru khusus keeper** (hot wallet) berisi ± 0,01 ETH untuk gas update harga |
| Akun | GitHub, [Vercel](https://vercel.com) (website), [Railway](https://railway.com) (indexer + keeper + Postgres) |
| Opsional | WalletConnect Cloud project id, webhook Discord/Slack untuk alert keeper, Pinata JWT untuk audit trail di IPFS |

Tools lokal: Node 22+, pnpm, Foundry (`~/.foundry/bin`).

## 1. Deploy kontrak

```bash
pnpm install
cd contracts && forge build && cd ..

# 1a. Ambil harga pembuka dari sumber live yang disepakati.
#     Gagal = sumber belum sepakat (mis. Steam vs Skinport); tunggu lalu ulangi. Jangan isi harga manual.
pnpm --filter @rwa/keeper seed

# 1b. Simpan wallet deployer ke keystore Foundry (akan diminta private key + password, hanya di terminal kamu)
cast wallet import deployer --interactive

# 1c. Simulasi dulu (tanpa broadcast). Di Windows, jalankan proxy RPC di terminal lain:
#     node contracts/script/rpc-proxy.mjs
cd contracts
export OWNER=0x... GUARDIAN=0x... KEEPER=0x... TREASURY=0x...
forge script script/DeployMainnet.s.sol --fork-url http://127.0.0.1:8548 --sender $(cast wallet address --account deployer)

# 1d. Broadcast (sungguhan)
forge script script/DeployMainnet.s.sol --rpc-url http://127.0.0.1:8548 --account deployer --broadcast --slow
```

Hasil: `contracts/deployments/mainnet.json`. **Commit file ini** — indexer dan website membacanya.

Setelah itu, dari multisig `OWNER`, panggil `acceptOwnership()` pada `AssetRegistry` dan `LaunchFactory` (alamat ada di `mainnet.json`).

Verifikasi (opsional): `forge verify-contract` ke Blockscout Robinhood Chain untuk tiap kontrak.

## 2. Push ke GitHub

```bash
git remote add origin git@github.com:<kamu>/<repo>.git
git push -u origin master
```

## 3. Indexer (Railway)

1. Railway → **New Project** → **Deploy from GitHub repo** → pilih repo.
2. Tambah **PostgreSQL** ke project.
3. Pada service repo: Settings → **Config file path** = `indexer/railway.json`, Root directory = `/` (root repo).
4. Variables:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
   - `PONDER_RPC_URL` = `https://rpc.mainnet.chain.robinhood.com` (atau RPC privat jika kena rate limit)
   - `DEPLOYMENTS_FILE` = `../contracts/deployments/mainnet.json`
5. Settings → Networking → **Generate Domain**. Catat URL-nya, mis. `https://rwa-indexer.up.railway.app` → cek `/ready` dan `/stats`.

## 4. Keeper (Railway, service kedua di project yang sama)

1. **New** → GitHub repo yang sama → Config file path = `keeper/railway.json`.
2. Variables:
   - `RPC_URL` = `https://rpc.mainnet.chain.robinhood.com`
   - `KEEPER_PRIVATE_KEY` = private key wallet **KEEPER** (isi sendiri, sebagai secret)
   - `REGISTRY`, `PRICE_WALL`, `FACTORY`, `BUYBACK_VAULT` = dari `mainnet.json`
   - `ASSETS_FILE` = `assets.json`
   - `ALERT_WEBHOOK` = webhook Discord/Slack (disarankan)
   - `PINATA_JWT` = (opsional) agar audit trail tersimpan di IPFS
3. Pantau log: setiap loop menulis `price moved` / `price update skipped` / `price not agreed`.

Keeper **tidak butuh** port publik. Isi wallet keeper secukupnya saja.

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

## 6. Cek setelah live

- Board menampilkan underlying di ticker tape dan halaman **Underlyings** menampilkan harga yang sama dengan `pnpm --filter @rwa/keeper probe`.
- Launch koin kecil (first buy ~5 USDG) dari wallet uji → muncul di board dalam ± 1 menit.
- Beli & jual kecil, klaim fee di Portfolio.
- Keeper log: tidak ada `error` berulang.

## Menambah underlying baru nanti

Aset di `keeper/assets.pending.json` (Big Mac, Charizard) butuh sumber kedua dulu. Setelah ada:

1. Dari multisig `OWNER`: jalankan `script/AddAsset.s.sol` (lihat header skrip) atau panggil `AssetRegistry.addAsset`.
2. Pindahkan entrinya ke `keeper/assets.json` dengan `assetId` yang diberikan registry, lalu redeploy keeper.
