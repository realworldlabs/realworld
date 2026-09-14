import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

/** Contract addresses are baked in at build time from the deployments JSON written by the deploy scripts. */
function deployments(): string {
  if (process.env.NEXT_PUBLIC_DEPLOYMENTS) return process.env.NEXT_PUBLIC_DEPLOYMENTS;
  const file = path.resolve(process.env.DEPLOYMENTS_FILE ?? "../contracts/deployments/devnet.json");
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "{}";
}

const config: NextConfig = {
  transpilePackages: ["@rwa/abi"],
  reactStrictMode: true,
  env: { NEXT_PUBLIC_DEPLOYMENTS: deployments() },
  turbopack: {
    // The wagmi Base Account connector lazily imports @base-org/account, whose Node build pulls in
    // @coinbase/cdp-sdk and optional x402 packages that are not installed. Base Account is not offered here.
    resolveAlias: { "@base-org/account": "./src/lib/base-account-stub.ts" },
  },
};

export default config;
