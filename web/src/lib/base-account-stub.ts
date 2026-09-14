// Stand-in for @base-org/account. The wagmi Base Account connector imports it lazily, and its Node build drags in
// @coinbase/cdp-sdk with optional packages that are not installed. This app does not offer Base Account.
export function createBaseAccountSDK(): never {
  throw new Error("Base Account is not supported in this app");
}
