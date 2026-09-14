(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,10861,e=>{"use strict";var t=e.i(20145);let r={WC_NAME_SUFFIX:".reown.id",WC_NAME_SUFFIX_LEGACY:".wcn.id",BLOCKCHAIN_API_RPC_URL:"https://rpc.walletconnect.org",PULSE_API_URL:"https://pulse.walletconnect.org",W3M_API_URL:"https://api.web3modal.org",CONNECTOR_ID:{WALLET_CONNECT:"walletConnect",INJECTED:"injected",WALLET_STANDARD:"announced",COINBASE:"coinbaseWallet",COINBASE_SDK:"coinbaseWalletSDK",SAFE:"safe",LEDGER:"ledger",OKX:"okx",EIP6963:"eip6963",AUTH:"ID_AUTH"},CONNECTOR_NAMES:{AUTH:"Auth"},AUTH_CONNECTOR_SUPPORTED_CHAINS:["eip155","solana"],LIMITS:{PENDING_TRANSACTIONS:99},CHAIN:{EVM:"eip155",SOLANA:"solana",POLKADOT:"polkadot",BITCOIN:"bip122"},CHAIN_NAME_MAP:{eip155:"EVM Networks",solana:"Solana",polkadot:"Polkadot",bip122:"Bitcoin",cosmos:"Cosmos"},ADAPTER_TYPES:{BITCOIN:"bitcoin",SOLANA:"solana",WAGMI:"wagmi",ETHERS:"ethers",ETHERS5:"ethers5"},USDT_CONTRACT_ADDRESSES:["0xdac17f958d2ee523a2206206994597c13d831ec7","0xc2132d05d31c914a87c6611c10748aeb04b58e8f","0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7","0x919C1c267BC06a7039e03fcc2eF738525769109c","0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e","0x55d398326f99059fF775485246999027B3197955","0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"],HTTP_STATUS_CODES:{SERVICE_UNAVAILABLE:503,FORBIDDEN:403},UNSUPPORTED_NETWORK_NAME:"Unknown Network",SECURE_SITE_SDK_ORIGIN:(void 0!==t.default&&void 0!==t.default.env?t.default.env.NEXT_PUBLIC_SECURE_SITE_ORIGIN:void 0)||"https://secure.walletconnect.org"};e.s(["ConstantsUtil",0,r])},96212,e=>{"use strict";var t=e.i(10861);e.s(["NetworkUtil",0,{caipNetworkIdToNumber:e=>e?Number(e.split(":")[1]):void 0,parseEvmChainId(e){return"string"==typeof e?this.caipNetworkIdToNumber(e):e},getNetworksByNamespace:(e,t)=>e?.filter(e=>e.chainNamespace===t)||[],getFirstNetworkByNamespace(e,t){return this.getNetworksByNamespace(e,t)[0]},getNetworkNameByCaipNetworkId(e,r){if(!r)return;let a=e.find(e=>e.caipNetworkId===r);if(a)return a.name;let[o]=r.split(":");return t.ConstantsUtil.CHAIN_NAME_MAP?.[o]||void 0}}])},40368,e=>{"use strict";e.s(["getW3mThemeVariables",0,function(e,t){return"light"===t?{"--w3m-accent":e?.["--w3m-accent"]||"hsla(231, 100%, 70%, 1)","--w3m-background":"#fff"}:{"--w3m-accent":e?.["--w3m-accent"]||"hsla(230, 100%, 67%, 1)","--w3m-background":"#121313"}}])},1945,78644,e=>{"use strict";e.s(["AccountController",()=>m],1945),e.s(["BlockchainApiController",()=>w],78644);var t=e.i(20464),r=e.i(68119),a=e.i(97882),o=e.i(51351),i=e.i(66296),n=e.i(53519),s=e.i(55920),c=e.i(12906),l=e.i(54012);let u={purchaseCurrencies:[{id:"2b92315d-eab7-5bef-84fa-089a131333f5",name:"USD Coin",symbol:"USDC",networks:[{name:"ethereum-mainnet",display_name:"Ethereum",chain_id:"1",contract_address:"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"},{name:"polygon-mainnet",display_name:"Polygon",chain_id:"137",contract_address:"0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"}]},{id:"2b92315d-eab7-5bef-84fa-089a131333f5",name:"Ether",symbol:"ETH",networks:[{name:"ethereum-mainnet",display_name:"Ethereum",chain_id:"1",contract_address:"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"},{name:"polygon-mainnet",display_name:"Polygon",chain_id:"137",contract_address:"0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"}]}],paymentCurrencies:[{id:"USD",payment_method_limits:[{id:"card",min:"10.00",max:"7500.00"},{id:"ach_bank_account",min:"10.00",max:"25000.00"}]},{id:"EUR",payment_method_limits:[{id:"card",min:"10.00",max:"7500.00"},{id:"ach_bank_account",min:"10.00",max:"25000.00"}]}]},d=a.CoreHelperUtil.getBlockchainApiUrl(),p=(0,t.proxy)({clientId:null,api:new i.FetchUtil({baseUrl:d,clientId:null}),supportedChains:{http:[],ws:[]}}),w={state:p,async get(e){let{st:t,sv:r}=w.getSdkProperties(),a=c.OptionsController.state.projectId,o={...e.params||{},st:t,sv:r,projectId:a};return p.api.get({...e,params:o})},getSdkProperties(){let{sdkType:e,sdkVersion:t}=c.OptionsController.state;return{st:e||"unknown",sv:t||"unknown"}},async isNetworkSupported(e){if(!e)return!1;try{p.supportedChains.http.length||await w.getSupportedNetworks()}catch(e){return!1}return p.supportedChains.http.includes(e)},async getSupportedNetworks(){try{let e=await w.get({path:"v1/supported-chains"});return p.supportedChains=e,e}catch{return p.supportedChains}},async fetchIdentity({address:e,caipNetworkId:t}){if(!await w.isNetworkSupported(t))return{avatar:"",name:""};let r=n.StorageUtil.getIdentityFromCacheForAddress(e);if(r)return r;let o=await w.get({path:`/v1/identity/${e}`,params:{sender:s.ChainController.state.activeCaipAddress?a.CoreHelperUtil.getPlainAddress(s.ChainController.state.activeCaipAddress):void 0}});return n.StorageUtil.updateIdentityCache({address:e,identity:o,timestamp:Date.now()}),o},fetchTransactions:async({account:e,cursor:t,onramp:r,signal:a,cache:o,chainId:i})=>await w.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?w.get({path:`/v1/account/${e}/history`,params:{cursor:t,onramp:r,chainId:i},signal:a,cache:o}):{data:[],next:void 0},fetchSwapQuote:async({amount:e,userAddress:t,from:r,to:a,gasPrice:o})=>await w.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?w.get({path:"/v1/convert/quotes",headers:{"Content-Type":"application/json"},params:{amount:e,userAddress:t,from:r,to:a,gasPrice:o}}):{quotes:[]},fetchSwapTokens:async({chainId:e})=>await w.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?w.get({path:"/v1/convert/tokens",params:{chainId:e}}):{tokens:[]},fetchTokenPrice:async({addresses:e})=>await w.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?p.api.post({path:"/v1/fungible/price",body:{currency:"usd",addresses:e,projectId:c.OptionsController.state.projectId},headers:{"Content-Type":"application/json"}}):{fungibles:[]},fetchSwapAllowance:async({tokenAddress:e,userAddress:t})=>await w.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?w.get({path:"/v1/convert/allowance",params:{tokenAddress:e,userAddress:t},headers:{"Content-Type":"application/json"}}):{allowance:"0"},async fetchGasPrice({chainId:e}){let{st:t,sv:r}=w.getSdkProperties();if(!await w.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId))throw Error("Network not supported for Gas Price");return w.get({path:"/v1/convert/gas-price",headers:{"Content-Type":"application/json"},params:{chainId:e,st:t,sv:r}})},async generateSwapCalldata({amount:e,from:t,to:a,userAddress:o,disableEstimate:i}){if(!await w.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId))throw Error("Network not supported for Swaps");return p.api.post({path:"/v1/convert/build-transaction",headers:{"Content-Type":"application/json"},body:{amount:e,eip155:{slippage:r.ConstantsUtil.CONVERT_SLIPPAGE_TOLERANCE},projectId:c.OptionsController.state.projectId,from:t,to:a,userAddress:o,disableEstimate:i}})},async generateApproveCalldata({from:e,to:t,userAddress:r}){let{st:a,sv:o}=w.getSdkProperties();if(!await w.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId))throw Error("Network not supported for Swaps");return w.get({path:"/v1/convert/build-approve",headers:{"Content-Type":"application/json"},params:{userAddress:r,from:e,to:t,st:a,sv:o}})},async getBalance(e,t,r){let{st:a,sv:o}=w.getSdkProperties();if(!await w.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId))return l.SnackController.showError("Token Balance Unavailable"),{balances:[]};let i=`${t}:${e}`,c=n.StorageUtil.getBalanceCacheForCaipAddress(i);if(c)return c;let u=await w.get({path:`/v1/account/${e}/balance`,params:{currency:"usd",chainId:t,forceUpdate:r,st:a,sv:o}});return n.StorageUtil.updateBalanceCache({caipAddress:i,balance:u,timestamp:Date.now()}),u},lookupEnsName:async e=>await w.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?w.get({path:`/v1/profile/account/${e}`,params:{apiVersion:"2"}}):{addresses:{},attributes:[]},reverseLookupEnsName:async({address:e})=>await w.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?w.get({path:`/v1/profile/reverse/${e}`,params:{sender:m.state.address,apiVersion:"2"}}):[],getEnsNameSuggestions:async e=>await w.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?w.get({path:`/v1/profile/suggestions/${e}`,params:{zone:"reown.id"}}):{suggestions:[]},registerEnsName:async({coinType:e,address:t,message:r,signature:a})=>await w.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?p.api.post({path:"/v1/profile/account",body:{coin_type:e,address:t,message:r,signature:a},headers:{"Content-Type":"application/json"}}):{success:!1},generateOnRampURL:async({destinationWallets:e,partnerUserId:t,defaultNetwork:r,purchaseAmount:a,paymentAmount:o})=>await w.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?(await p.api.post({path:"/v1/generators/onrampurl",params:{projectId:c.OptionsController.state.projectId},body:{destinationWallets:e,defaultNetwork:r,partnerUserId:t,defaultExperience:"buy",presetCryptoAmount:a,presetFiatAmount:o}})).url:"",async getOnrampOptions(){if(!await w.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId))return{paymentCurrencies:[],purchaseCurrencies:[]};try{return await w.get({path:"/v1/onramp/options"})}catch(e){return u}},async getOnrampQuote({purchaseCurrency:e,paymentCurrency:t,amount:r,network:a}){try{if(!await w.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId))return null;return await p.api.post({path:"/v1/onramp/quote",params:{projectId:c.OptionsController.state.projectId},body:{purchaseCurrency:e,paymentCurrency:t,amount:r,network:a}})}catch(e){return{coinbaseFee:{amount:r,currency:t.id},networkFee:{amount:r,currency:t.id},paymentSubtotal:{amount:r,currency:t.id},paymentTotal:{amount:r,currency:t.id},purchaseAmount:{amount:r,currency:t.id},quoteId:"mocked-quote-id"}}},getSmartSessions:async e=>await w.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?w.get({path:`/v1/sessions/${e}`}):[],revokeSmartSession:async(e,t,r)=>await w.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?p.api.post({path:`/v1/sessions/${e}/revoke`,params:{projectId:c.OptionsController.state.projectId},body:{pci:t,signature:r}}):{success:!1},setClientId(e){p.clientId=e,p.api=new i.FetchUtil({baseUrl:d,clientId:e})}},g=(0,t.proxy)({currentTab:0,tokenBalance:[],smartAccountDeployed:!1,addressLabels:new Map,allAccounts:[]}),m=(0,o.withErrorBoundary)({state:g,replaceState(e){e&&Object.assign(g,(0,t.ref)(e))},subscribe:e=>s.ChainController.subscribeChainProp("accountState",t=>{if(t)return e(t)}),subscribeKey(e,t,r){let a;return s.ChainController.subscribeChainProp("accountState",r=>{if(r){let o=r[e];a!==o&&(a=o,t(o))}},r)},setStatus(e,t){s.ChainController.setAccountProp("status",e,t)},getCaipAddress:e=>s.ChainController.getAccountProp("caipAddress",e),setCaipAddress(e,t){let r=e?a.CoreHelperUtil.getPlainAddress(e):void 0;t===s.ChainController.state.activeChain&&(s.ChainController.state.activeCaipAddress=e),s.ChainController.setAccountProp("caipAddress",e,t),s.ChainController.setAccountProp("address",r,t)},setBalance(e,t,r){s.ChainController.setAccountProp("balance",e,r),s.ChainController.setAccountProp("balanceSymbol",t,r)},setProfileName(e,t){s.ChainController.setAccountProp("profileName",e,t)},setProfileImage(e,t){s.ChainController.setAccountProp("profileImage",e,t)},setUser(e,t){s.ChainController.setAccountProp("user",e,t)},setAddressExplorerUrl(e,t){s.ChainController.setAccountProp("addressExplorerUrl",e,t)},setSmartAccountDeployed(e,t){s.ChainController.setAccountProp("smartAccountDeployed",e,t)},setCurrentTab(e){s.ChainController.setAccountProp("currentTab",e,s.ChainController.state.activeChain)},setTokenBalance(e,t){e&&s.ChainController.setAccountProp("tokenBalance",e,t)},setShouldUpdateToAddress(e,t){s.ChainController.setAccountProp("shouldUpdateToAddress",e,t)},setAllAccounts(e,t){s.ChainController.setAccountProp("allAccounts",e,t)},addAddressLabel(e,t,r){let a=s.ChainController.getAccountProp("addressLabels",r)||new Map;a.set(e,t),s.ChainController.setAccountProp("addressLabels",a,r)},removeAddressLabel(e,t){let r=s.ChainController.getAccountProp("addressLabels",t)||new Map;r.delete(e),s.ChainController.setAccountProp("addressLabels",r,t)},setConnectedWalletInfo(e,t){s.ChainController.setAccountProp("connectedWalletInfo",e,t,!1)},setPreferredAccountType(e,t){s.ChainController.setAccountProp("preferredAccountTypes",{...g.preferredAccountTypes,[t]:e},t)},setPreferredAccountTypes(e){g.preferredAccountTypes=e},setSocialProvider(e,t){e&&s.ChainController.setAccountProp("socialProvider",e,t)},setSocialWindow(e,r){s.ChainController.setAccountProp("socialWindow",e?(0,t.ref)(e):void 0,r)},setFarcasterUrl(e,t){s.ChainController.setAccountProp("farcasterUrl",e,t)},async fetchTokenBalance(e){g.balanceLoading=!0;let t=s.ChainController.state.activeCaipNetwork?.caipNetworkId,o=s.ChainController.state.activeCaipNetwork?.chainNamespace,i=s.ChainController.state.activeCaipAddress,n=i?a.CoreHelperUtil.getPlainAddress(i):void 0;if(g.lastRetry&&!a.CoreHelperUtil.isAllowedRetry(g.lastRetry,30*r.ConstantsUtil.ONE_SEC_MS))return g.balanceLoading=!1,[];try{if(n&&t&&o){let e=(await w.getBalance(n,t)).balances.filter(e=>"0"!==e.quantity.decimals);return m.setTokenBalance(e,o),g.lastRetry=void 0,g.balanceLoading=!1,e}}catch(t){g.lastRetry=Date.now(),e?.(t),l.SnackController.showError("Token Balance Unavailable")}finally{g.balanceLoading=!1}return[]},resetAccount(e){s.ChainController.resetAccount(e)}})},76425,e=>{"use strict";e.s(["ApiController",()=>h]);var t=e.i(20464),r=e.i(35126),a=e.i(82869),o=e.i(97882),i=e.i(66296),n=e.i(93400),s=e.i(53519),c=e.i(4595),l=e.i(55920),u=e.i(68761),d=e.i(37292),p=e.i(12906);let w=o.CoreHelperUtil.getApiUrl(),g=new i.FetchUtil({baseUrl:w,clientId:null}),m=(0,t.proxy)({promises:{},page:1,count:0,featured:[],allFeatured:[],recommended:[],allRecommended:[],wallets:[],filteredWallets:[],search:[],isAnalyticsEnabled:!1,excludedWallets:[],isFetchingRecommendedWallets:!1}),h={state:m,subscribeKey:(e,t)=>(0,r.subscribeKey)(m,e,t),_getSdkProperties(){let{projectId:e,sdkType:t,sdkVersion:r}=p.OptionsController.state;return{projectId:e,st:t||"appkit",sv:r||"html-wagmi-4.2.2"}},_filterOutExtensions:e=>p.OptionsController.state.isUniversalProvider?e.filter(e=>!!(e.mobile_link||e.desktop_link||e.webapp_link)):e,async _fetchWalletImage(e){let t=`${g.baseUrl}/getWalletImage/${e}`,r=await g.getBlob({path:t,params:h._getSdkProperties()});c.AssetController.setWalletImage(e,URL.createObjectURL(r))},async _fetchNetworkImage(e){let t=`${g.baseUrl}/public/getAssetImage/${e}`,r=await g.getBlob({path:t,params:h._getSdkProperties()});c.AssetController.setNetworkImage(e,URL.createObjectURL(r))},async _fetchConnectorImage(e){let t=`${g.baseUrl}/public/getAssetImage/${e}`,r=await g.getBlob({path:t,params:h._getSdkProperties()});c.AssetController.setConnectorImage(e,URL.createObjectURL(r))},async _fetchCurrencyImage(e){let t=`${g.baseUrl}/public/getCurrencyImage/${e}`,r=await g.getBlob({path:t,params:h._getSdkProperties()});c.AssetController.setCurrencyImage(e,URL.createObjectURL(r))},async _fetchTokenImage(e){let t=`${g.baseUrl}/public/getTokenImage/${e}`,r=await g.getBlob({path:t,params:h._getSdkProperties()});c.AssetController.setTokenImage(e,URL.createObjectURL(r))},_filterWalletsByPlatform:e=>o.CoreHelperUtil.isMobile()?e?.filter(e=>!!e.mobile_link||e.id===n.CUSTOM_DEEPLINK_WALLETS.COINBASE.id||"solana"===l.ChainController.state.activeChain&&(e.id===n.CUSTOM_DEEPLINK_WALLETS.SOLFLARE.id||e.id===n.CUSTOM_DEEPLINK_WALLETS.PHANTOM.id)):e,fetchProjectConfig:async()=>(await g.get({path:"/appkit/v1/config",params:h._getSdkProperties()})).features,async fetchAllowedOrigins(){try{let{allowedOrigins:e}=await g.get({path:"/projects/v1/origins",params:h._getSdkProperties()});return e}catch(e){return[]}},async fetchNetworkImages(){let e=l.ChainController.getAllRequestedCaipNetworks(),t=e?.map(({assets:e})=>e?.imageId).filter(Boolean).filter(e=>!a.AssetUtil.getNetworkImageById(e));t&&await Promise.allSettled(t.map(e=>h._fetchNetworkImage(e)))},async fetchConnectorImages(){let{connectors:e}=u.ConnectorController.state,t=e.map(({imageId:e})=>e).filter(Boolean);await Promise.allSettled(t.map(e=>h._fetchConnectorImage(e)))},async fetchCurrencyImages(e=[]){await Promise.allSettled(e.map(e=>h._fetchCurrencyImage(e)))},async fetchTokenImages(e=[]){await Promise.allSettled(e.map(e=>h._fetchTokenImage(e)))},async fetchWallets(e){let t=e.exclude??[];h._getSdkProperties().sv.startsWith("html-core-")&&t.push(...Object.values(n.CUSTOM_DEEPLINK_WALLETS).map(e=>e.id));let r=await g.get({path:"/getWallets",params:{...h._getSdkProperties(),...e,page:String(e.page),entries:String(e.entries),include:e.include?.join(","),exclude:t.join(",")}});return{data:h._filterWalletsByPlatform(r?.data)||[],count:r?.count}},async fetchFeaturedWallets(){let{featuredWalletIds:e}=p.OptionsController.state;if(e?.length){let t={...h._getSdkProperties(),page:1,entries:e?.length??4,include:e},{data:r}=await h.fetchWallets(t),a=[...r].sort((t,r)=>e.indexOf(t.id)-e.indexOf(r.id)),o=a.map(e=>e.image_id).filter(Boolean);await Promise.allSettled(o.map(e=>h._fetchWalletImage(e))),m.featured=a,m.allFeatured=a}},async fetchRecommendedWallets(){try{m.isFetchingRecommendedWallets=!0;let{includeWalletIds:e,excludeWalletIds:t,featuredWalletIds:r}=p.OptionsController.state,a=[...t??[],...r??[]].filter(Boolean),o=l.ChainController.getRequestedCaipNetworkIds().join(","),{data:i,count:n}=await h.fetchWallets({page:1,entries:4,include:e,exclude:a,chains:o}),c=s.StorageUtil.getRecentWallets(),u=i.map(e=>e.image_id).filter(Boolean),d=c.map(e=>e.image_id).filter(Boolean);await Promise.allSettled([...u,...d].map(e=>h._fetchWalletImage(e))),m.recommended=i,m.allRecommended=i,m.count=n??0}catch{}finally{m.isFetchingRecommendedWallets=!1}},async fetchWalletsByPage({page:e}){let{includeWalletIds:t,excludeWalletIds:r,featuredWalletIds:a}=p.OptionsController.state,i=l.ChainController.getRequestedCaipNetworkIds().join(","),n=[...m.recommended.map(({id:e})=>e),...r??[],...a??[]].filter(Boolean),{data:s,count:c}=await h.fetchWallets({page:e,entries:40,include:t,exclude:n,chains:i}),u=s.slice(0,20).map(e=>e.image_id).filter(Boolean);await Promise.allSettled(u.map(e=>h._fetchWalletImage(e))),m.wallets=o.CoreHelperUtil.uniqueBy([...m.wallets,...h._filterOutExtensions(s)],"id").filter(e=>e.chains?.some(e=>i.includes(e))),m.count=c>m.count?c:m.count,m.page=e},async initializeExcludedWallets({ids:e}){let t={page:1,entries:e.length,include:e},{data:r}=await h.fetchWallets(t);r&&r.forEach(e=>{m.excludedWallets.push({rdns:e.rdns,name:e.name})})},async searchWallet({search:e,badge:t}){let{includeWalletIds:r,excludeWalletIds:a}=p.OptionsController.state,i=l.ChainController.getRequestedCaipNetworkIds().join(",");m.search=[];let n={page:1,entries:100,search:e?.trim(),badge_type:t,include:r,exclude:a,chains:i},{data:s}=await h.fetchWallets(n);d.EventsController.sendEvent({type:"track",event:"SEARCH_WALLET",properties:{badge:t??"",search:e??""}});let c=s.map(e=>e.image_id).filter(Boolean);await Promise.allSettled([...c.map(e=>h._fetchWalletImage(e)),o.CoreHelperUtil.wait(300)]),m.search=h._filterOutExtensions(s)},initPromise(e,t){let r=m.promises[e];return r||(m.promises[e]=t())},prefetch:({fetchConnectorImages:e=!0,fetchFeaturedWallets:t=!0,fetchRecommendedWallets:r=!0,fetchNetworkImages:a=!0}={})=>Promise.allSettled([e&&h.initPromise("connectorImages",h.fetchConnectorImages),t&&h.initPromise("featuredWallets",h.fetchFeaturedWallets),r&&h.initPromise("recommendedWallets",h.fetchRecommendedWallets),a&&h.initPromise("networkImages",h.fetchNetworkImages)].filter(Boolean)),prefetchAnalyticsConfig(){p.OptionsController.state.features?.analytics&&h.fetchAnalyticsConfig()},async fetchAnalyticsConfig(){try{let{isAnalyticsEnabled:e}=await g.get({path:"/getAnalyticsConfig",params:h._getSdkProperties()});p.OptionsController.setFeatures({analytics:e})}catch(e){p.OptionsController.setFeatures({analytics:!1})}},filterByNamespaces(e){if(!e?.length){m.featured=m.allFeatured,m.recommended=m.allRecommended;return}let t=l.ChainController.getRequestedCaipNetworkIds().join(",");m.featured=m.allFeatured.filter(e=>e.chains?.some(e=>t.includes(e))),m.recommended=m.allRecommended.filter(e=>e.chains?.some(e=>t.includes(e))),m.filteredWallets=m.wallets.filter(e=>e.chains?.some(e=>t.includes(e)))},clearFilterByNamespaces(){m.filteredWallets=[]},setFilterByNamespace(e){if(!e){m.featured=m.allFeatured,m.recommended=m.allRecommended;return}let t=l.ChainController.getRequestedCaipNetworkIds().join(",");m.featured=m.allFeatured.filter(e=>e.chains?.some(e=>t.includes(e))),m.recommended=m.allRecommended.filter(e=>e.chains?.some(e=>t.includes(e))),m.filteredWallets=m.wallets.filter(e=>e.chains?.some(e=>t.includes(e)))}}},55920,46328,79298,e=>{"use strict";let t;e.s(["ChainController",()=>z],55920),e.s(["ConnectionController",()=>N],46328),e.s(["SendController",()=>j],79298);var r=e.i(20464),a=e.i(35126),o=e.i(10861),i=e.i(96212),n=e.i(68119),s=e.i(97882),c=e.i(53519),l=e.i(51351),u=e.i(1945),d=e.i(68761),p=e.i(37292),w=e.i(35517),g=e.i(89344),m=e.i(22656),h=e.i(78644),C=e.i(12906),f=e.i(54012);let b=(0,r.proxy)({transactions:[],coinbaseTransactions:{},transactionsByYear:{},lastNetworkInView:void 0,loading:!1,empty:!1,next:void 0}),v=(0,l.withErrorBoundary)({state:b,subscribe:e=>(0,r.subscribe)(b,()=>e(b)),setLastNetworkInView(e){b.lastNetworkInView=e},async fetchTransactions(e,t){if(!e)throw Error("Transactions can't be fetched without an accountAddress");b.loading=!0;try{let r=await h.BlockchainApiController.fetchTransactions({account:e,cursor:b.next,onramp:t,cache:"coinbase"===t?"no-cache":void 0,chainId:z.state.activeCaipNetwork?.caipNetworkId}),a=v.filterSpamTransactions(r.data),o=v.filterByConnectedChain(a),i=[...b.transactions,...o];b.loading=!1,"coinbase"===t?b.coinbaseTransactions=v.groupTransactionsByYearAndMonth(b.coinbaseTransactions,r.data):(b.transactions=i,b.transactionsByYear=v.groupTransactionsByYearAndMonth(b.transactionsByYear,o)),b.empty=0===i.length,b.next=r.next?r.next:void 0}catch(r){let t=z.state.activeChain;p.EventsController.sendEvent({type:"track",event:"ERROR_FETCH_TRANSACTIONS",properties:{address:e,projectId:C.OptionsController.state.projectId,cursor:b.next,isSmartAccount:u.AccountController.state.preferredAccountTypes?.[t]===m.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}}),f.SnackController.showError("Failed to fetch transactions"),b.loading=!1,b.empty=!0,b.next=void 0}},groupTransactionsByYearAndMonth:(e={},t=[])=>(t.forEach(t=>{let r=new Date(t.metadata.minedAt).getFullYear(),a=new Date(t.metadata.minedAt).getMonth(),o=e[r]??{},i=(o[a]??[]).filter(e=>e.id!==t.id);e[r]={...o,[a]:[...i,t].sort((e,t)=>new Date(t.metadata.minedAt).getTime()-new Date(e.metadata.minedAt).getTime())}}),e),filterSpamTransactions:e=>e.filter(e=>!e.transfers.every(e=>e.nft_info?.flags.is_spam===!0)),filterByConnectedChain(e){let t=z.state.activeCaipNetwork?.caipNetworkId;return e.filter(e=>e.metadata.chain===t)},clearCursor(){b.next=void 0},resetTransactions(){b.transactions=[],b.transactionsByYear={},b.lastNetworkInView=void 0,b.loading=!1,b.empty=!1,b.next=void 0}},"API_ERROR"),A=(0,r.proxy)({connections:new Map,wcError:!1,buffering:!1,status:"disconnected"}),N=(0,l.withErrorBoundary)({state:A,subscribeKey:(e,t)=>(0,a.subscribeKey)(A,e,t),_getClient:()=>A._client,setClient(e){A._client=(0,r.ref)(e)},async connectWalletConnect(){if(s.CoreHelperUtil.isTelegram()||s.CoreHelperUtil.isSafari()&&s.CoreHelperUtil.isIos()){if(t){await t,t=void 0;return}if(!s.CoreHelperUtil.isPairingExpired(A?.wcPairingExpiry)){let e=A.wcUri;A.wcUri=e;return}t=N._getClient()?.connectWalletConnect?.().catch(()=>void 0),N.state.status="connecting",await t,t=void 0,A.wcPairingExpiry=void 0,N.state.status="connected"}else await N._getClient()?.connectWalletConnect?.()},async connectExternal(e,t,r=!0){await N._getClient()?.connectExternal?.(e),r&&z.setActiveNamespace(t)},async reconnectExternal(e){await N._getClient()?.reconnectExternal?.(e);let t=e.chain||z.state.activeChain;t&&d.ConnectorController.setConnectorId(e.id,t)},async setPreferredAccountType(e,t){w.ModalController.setLoading(!0,z.state.activeChain);let r=d.ConnectorController.getAuthConnector();r&&(u.AccountController.setPreferredAccountType(e,t),await r.provider.setPreferredAccount(e),c.StorageUtil.setPreferredAccountTypes(u.AccountController.state.preferredAccountTypes??{[t]:e}),await N.reconnectExternal(r),w.ModalController.setLoading(!1,z.state.activeChain),p.EventsController.sendEvent({type:"track",event:"SET_PREFERRED_ACCOUNT_TYPE",properties:{accountType:e,network:z.state.activeCaipNetwork?.caipNetworkId||""}}))},signMessage:async e=>N._getClient()?.signMessage(e),parseUnits:(e,t)=>N._getClient()?.parseUnits(e,t),formatUnits:(e,t)=>N._getClient()?.formatUnits(e,t),sendTransaction:async e=>N._getClient()?.sendTransaction(e),getCapabilities:async e=>N._getClient()?.getCapabilities(e),grantPermissions:async e=>N._getClient()?.grantPermissions(e),walletGetAssets:async e=>N._getClient()?.walletGetAssets(e)??{},estimateGas:async e=>N._getClient()?.estimateGas(e),writeContract:async e=>N._getClient()?.writeContract(e),getEnsAddress:async e=>N._getClient()?.getEnsAddress(e),getEnsAvatar:async e=>N._getClient()?.getEnsAvatar(e),checkInstalled:e=>N._getClient()?.checkInstalled?.(e)||!1,resetWcConnection(){A.wcUri=void 0,A.wcPairingExpiry=void 0,A.wcLinking=void 0,A.recentWallet=void 0,A.status="disconnected",v.resetTransactions(),c.StorageUtil.deleteWalletConnectDeepLink()},resetUri(){A.wcUri=void 0,A.wcPairingExpiry=void 0,t=void 0},finalizeWcConnection(){let{wcLinking:e,recentWallet:t}=N.state;e&&c.StorageUtil.setWalletConnectDeepLink(e),t&&c.StorageUtil.setAppKitRecent(t),p.EventsController.sendEvent({type:"track",event:"CONNECT_SUCCESS",properties:{method:e?"mobile":"qrcode",name:g.RouterController.state.data?.wallet?.name||"Unknown"}})},setWcBasic(e){A.wcBasic=e},setUri(e){A.wcUri=e,A.wcPairingExpiry=s.CoreHelperUtil.getPairingExpiry()},setWcLinking(e){A.wcLinking=e},setWcError(e){A.wcError=e,A.buffering=!1},setRecentWallet(e){A.recentWallet=e},setBuffering(e){A.buffering=e},setStatus(e){A.status=e},async disconnect(e){try{await N._getClient()?.disconnect(e)}catch(e){throw new l.AppKitError("Failed to disconnect","INTERNAL_SDK_ERROR",e)}},setConnections(e,t){A.connections.set(t,e)},switchAccount({connection:e,address:t,namespace:r}){if(d.ConnectorController.state.activeConnectorIds[r]===e.connectorId){let e=z.state.activeCaipNetwork;if(e){let a=`${r}:${e.id}:${t}`;u.AccountController.setCaipAddress(a,r)}else console.warn(`No current network found for namespace "${r}"`)}else{let t=d.ConnectorController.getConnector(e.connectorId);t?N.connectExternal(t,r):console.warn(`No connector found for namespace "${r}"`)}}});var y=e.i(79773),E="[big.js] ",k=E+"Invalid ",I=k+"decimal places",S=k+"rounding mode",_=E+"Division by zero",T={},x=void 0,U=/^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;function O(e,t,r,a){var o=e.c;if(r===x&&(r=e.constructor.RM),0!==r&&1!==r&&2!==r&&3!==r)throw Error(S);if(t<1)a=3===r&&(a||!!o[0])||0===t&&(1===r&&o[0]>=5||2===r&&(o[0]>5||5===o[0]&&(a||o[1]!==x))),o.length=1,a?(e.e=e.e-t+1,o[0]=1):o[0]=e.e=0;else if(t<o.length){if(a=1===r&&o[t]>=5||2===r&&(o[t]>5||5===o[t]&&(a||o[t+1]!==x||1&o[t-1]))||3===r&&(a||!!o[0]),o.length=t,a){for(;++o[--t]>9;)if(o[t]=0,0===t){++e.e,o.unshift(1);break}}for(t=o.length;!o[--t];)o.pop()}return e}function P(e,t,r){var a=e.e,o=e.c.join(""),i=o.length;if(t)o=o.charAt(0)+(i>1?"."+o.slice(1):"")+(a<0?"e":"e+")+a;else if(a<0){for(;++a;)o="0"+o;o="0."+o}else if(a>0)if(++a>i)for(a-=i;a--;)o+="0";else a<i&&(o=o.slice(0,a)+"."+o.slice(a));else i>1&&(o=o.charAt(0)+"."+o.slice(1));return e.s<0&&r?"-"+o:o}T.abs=function(){var e=new this.constructor(this);return e.s=1,e},T.cmp=function(e){var t,r=this.c,a=(e=new this.constructor(e)).c,o=this.s,i=e.s,n=this.e,s=e.e;if(!r[0]||!a[0])return r[0]?o:a[0]?-i:0;if(o!=i)return o;if(t=o<0,n!=s)return n>s^t?1:-1;for(i=(n=r.length)<(s=a.length)?n:s,o=-1;++o<i;)if(r[o]!=a[o])return r[o]>a[o]^t?1:-1;return n==s?0:n>s^t?1:-1},T.div=function(e){var t=this.constructor,r=this.c,a=(e=new t(e)).c,o=this.s==e.s?1:-1,i=t.DP;if(i!==~~i||i<0||i>1e6)throw Error(I);if(!a[0])throw Error(_);if(!r[0])return e.s=o,e.c=[e.e=0],e;var n,s,c,l,u,d=a.slice(),p=n=a.length,w=r.length,g=r.slice(0,n),m=g.length,h=e,C=h.c=[],f=0,b=i+(h.e=this.e-e.e)+1;for(h.s=o,o=b<0?0:b,d.unshift(0);m++<n;)g.push(0);do{for(c=0;c<10;c++){if(n!=(m=g.length))l=n>m?1:-1;else for(u=-1,l=0;++u<n;)if(a[u]!=g[u]){l=a[u]>g[u]?1:-1;break}if(l<0){for(s=m==n?a:d;m;){if(g[--m]<s[m]){for(u=m;u&&!g[--u];)g[u]=9;--g[u],g[m]+=10}g[m]-=s[m]}for(;!g[0];)g.shift()}else break}C[f++]=l?c:++c,g[0]&&l?g[m]=r[p]||0:g=[r[p]]}while((p++<w||g[0]!==x)&&o--)return!C[0]&&1!=f&&(C.shift(),h.e--,b--),f>b&&O(h,b,t.RM,g[0]!==x),h},T.eq=function(e){return 0===this.cmp(e)},T.gt=function(e){return this.cmp(e)>0},T.gte=function(e){return this.cmp(e)>-1},T.lt=function(e){return 0>this.cmp(e)},T.lte=function(e){return 1>this.cmp(e)},T.minus=T.sub=function(e){var t,r,a,o,i=this.constructor,n=this.s,s=(e=new i(e)).s;if(n!=s)return e.s=-s,this.plus(e);var c=this.c.slice(),l=this.e,u=e.c,d=e.e;if(!c[0]||!u[0])return u[0]?e.s=-s:c[0]?e=new i(this):e.s=1,e;if(n=l-d){for((o=n<0)?(n=-n,a=c):(d=l,a=u),a.reverse(),s=n;s--;)a.push(0);a.reverse()}else for(r=((o=c.length<u.length)?c:u).length,n=s=0;s<r;s++)if(c[s]!=u[s]){o=c[s]<u[s];break}if(o&&(a=c,c=u,u=a,e.s=-e.s),(s=(r=u.length)-(t=c.length))>0)for(;s--;)c[t++]=0;for(s=t;r>n;){if(c[--r]<u[r]){for(t=r;t&&!c[--t];)c[t]=9;--c[t],c[r]+=10}c[r]-=u[r]}for(;0===c[--s];)c.pop();for(;0===c[0];)c.shift(),--d;return c[0]||(e.s=1,c=[d=0]),e.c=c,e.e=d,e},T.mod=function(e){var t,r=this,a=r.constructor,o=r.s,i=(e=new a(e)).s;if(!e.c[0])throw Error(_);return(r.s=e.s=1,t=1==e.cmp(r),r.s=o,e.s=i,t)?new a(r):(o=a.DP,i=a.RM,a.DP=a.RM=0,r=r.div(e),a.DP=o,a.RM=i,this.minus(r.times(e)))},T.neg=function(){var e=new this.constructor(this);return e.s=-e.s,e},T.plus=T.add=function(e){var t,r,a,o=this.constructor;if(e=new o(e),this.s!=e.s)return e.s=-e.s,this.minus(e);var i=this.e,n=this.c,s=e.e,c=e.c;if(!n[0]||!c[0])return c[0]||(n[0]?e=new o(this):e.s=this.s),e;if(n=n.slice(),t=i-s){for(t>0?(s=i,a=c):(t=-t,a=n),a.reverse();t--;)a.push(0);a.reverse()}for(n.length-c.length<0&&(a=c,c=n,n=a),t=c.length,r=0;t;n[t]%=10)r=(n[--t]=n[t]+c[t]+r)/10|0;for(r&&(n.unshift(r),++s),t=n.length;0===n[--t];)n.pop();return e.c=n,e.e=s,e},T.pow=function(e){var t=this,r=new t.constructor("1"),a=r,o=e<0;if(e!==~~e||e<-1e6||e>1e6)throw Error(k+"exponent");for(o&&(e=-e);1&e&&(a=a.times(t)),e>>=1;)t=t.times(t);return o?r.div(a):a},T.prec=function(e,t){if(e!==~~e||e<1||e>1e6)throw Error(k+"precision");return O(new this.constructor(this),e,t)},T.round=function(e,t){if(e===x)e=0;else if(e!==~~e||e<-1e6||e>1e6)throw Error(I);return O(new this.constructor(this),e+this.e+1,t)},T.sqrt=function(){var e,t,r,a=this.constructor,o=this.s,i=this.e,n=new a("0.5");if(!this.c[0])return new a(this);if(o<0)throw Error(E+"No square root");0===(o=Math.sqrt(+P(this,!0,!0)))||o===1/0?((t=this.c.join("")).length+i&1||(t+="0"),i=((i+1)/2|0)-(i<0||1&i),e=new a(((o=Math.sqrt(t))==1/0?"5e":(o=o.toExponential()).slice(0,o.indexOf("e")+1))+i)):e=new a(o+""),i=e.e+(a.DP+=4);do r=e,e=n.times(r.plus(this.div(r)));while(r.c.slice(0,i).join("")!==e.c.slice(0,i).join(""))return O(e,(a.DP-=4)+e.e+1,a.RM)},T.times=T.mul=function(e){var t,r=this.constructor,a=this.c,o=(e=new r(e)).c,i=a.length,n=o.length,s=this.e,c=e.e;if(e.s=this.s==e.s?1:-1,!a[0]||!o[0])return e.c=[e.e=0],e;for(e.e=s+c,i<n&&(t=a,a=o,o=t,c=i,i=n,n=c),t=Array(c=i+n);c--;)t[c]=0;for(s=n;s--;){for(n=0,c=i+s;c>s;)n=t[c]+o[s]*a[c-s-1]+n,t[c--]=n%10,n=n/10|0;t[c]=n}for(n?++e.e:t.shift(),s=t.length;!t[--s];)t.pop();return e.c=t,e},T.toExponential=function(e,t){var r=this,a=r.c[0];if(e!==x){if(e!==~~e||e<0||e>1e6)throw Error(I);for(r=O(new r.constructor(r),++e,t);r.c.length<e;)r.c.push(0)}return P(r,!0,!!a)},T.toFixed=function(e,t){var r=this,a=r.c[0];if(e!==x){if(e!==~~e||e<0||e>1e6)throw Error(I);for(r=O(new r.constructor(r),e+r.e+1,t),e=e+r.e+1;r.c.length<e;)r.c.push(0)}return P(r,!1,!!a)},T[Symbol.for("nodejs.util.inspect.custom")]=T.toJSON=T.toString=function(){var e=this.constructor;return P(this,this.e<=e.NE||this.e>=e.PE,!!this.c[0])},T.toNumber=function(){var e=+P(this,!0,!0);if(!0===this.constructor.strict&&!this.eq(e.toString()))throw Error(E+"Imprecise conversion");return e},T.toPrecision=function(e,t){var r=this,a=r.constructor,o=r.c[0];if(e!==x){if(e!==~~e||e<1||e>1e6)throw Error(k+"precision");for(r=O(new a(r),e,t);r.c.length<e;)r.c.push(0)}return P(r,e<=r.e||r.e<=a.NE||r.e>=a.PE,!!o)},T.valueOf=function(){var e=this.constructor;if(!0===e.strict)throw Error(E+"valueOf disallowed");return P(this,this.e<=e.NE||this.e>=e.PE,!0)};var R=function e(){function t(r){if(!(this instanceof t))return r===x?e():new t(r);if(r instanceof t)this.s=r.s,this.e=r.e,this.c=r.c.slice();else{if("string"!=typeof r){if(!0===t.strict&&"bigint"!=typeof r)throw TypeError(k+"value");r=0===r&&1/r<0?"-0":String(r)}!function(e,t){var r,a,o;if(!U.test(t))throw Error(k+"number");for(e.s="-"==t.charAt(0)?(t=t.slice(1),-1):1,(r=t.indexOf("."))>-1&&(t=t.replace(".","")),(a=t.search(/e/i))>0?(r<0&&(r=a),r+=+t.slice(a+1),t=t.substring(0,a)):r<0&&(r=t.length),o=t.length,a=0;a<o&&"0"==t.charAt(a);)++a;if(a==o)e.c=[e.e=0];else{for(;o>0&&"0"==t.charAt(--o););for(e.e=r-a-1,e.c=[],r=0;a<=o;)e.c[r++]=+t.charAt(a++)}}(this,r)}this.constructor=t}return t.prototype=T,t.DP=20,t.RM=1,t.NE=-7,t.PE=21,t.strict=!1,t.roundDown=0,t.roundHalfUp=1,t.roundHalfEven=2,t.roundUp=3,t}();let B={bigNumber:e=>new R(e?e:0),multiply(e,t){if(void 0===e||void 0===t)return new R(0);let r=new R(e),a=new R(t);return r.times(a)},formatNumberToLocalString:(e,t=2)=>void 0===e?"0.00":"number"==typeof e?e.toLocaleString("en-US",{maximumFractionDigits:t,minimumFractionDigits:t}):parseFloat(e).toLocaleString("en-US",{maximumFractionDigits:t,minimumFractionDigits:t}),parseLocalStringToNumber:e=>void 0===e?0:parseFloat(e.replace(/,/gu,""))},D=[{type:"function",name:"transfer",stateMutability:"nonpayable",inputs:[{name:"_to",type:"address"},{name:"_value",type:"uint256"}],outputs:[{name:"",type:"bool"}]},{type:"function",name:"transferFrom",stateMutability:"nonpayable",inputs:[{name:"_from",type:"address"},{name:"_to",type:"address"},{name:"_value",type:"uint256"}],outputs:[{name:"",type:"bool"}]}],L=[{type:"function",name:"transfer",stateMutability:"nonpayable",inputs:[{name:"recipient",type:"address"},{name:"amount",type:"uint256"}],outputs:[]},{type:"function",name:"transferFrom",stateMutability:"nonpayable",inputs:[{name:"sender",type:"address"},{name:"recipient",type:"address"},{name:"amount",type:"uint256"}],outputs:[{name:"",type:"bool"}]}];var M=e.i(45267);let W={createBalance(e,t){let r={name:e.metadata.name||"",symbol:e.metadata.symbol||"",decimals:e.metadata.decimals||0,value:e.metadata.value||0,price:e.metadata.price||0,iconUrl:e.metadata.iconUrl||""};return{name:r.name,symbol:r.symbol,chainId:t,address:"native"===e.address?void 0:this.convertAddressToCAIP10Address(e.address,t),value:r.value,price:r.price,quantity:{decimals:r.decimals.toString(),numeric:this.convertHexToBalance({hex:e.balance,decimals:r.decimals})},iconUrl:r.iconUrl}},convertHexToBalance:({hex:e,decimals:t})=>(0,M.formatUnits)(BigInt(e),t),convertAddressToCAIP10Address:(e,t)=>`${t}:${e}`,createCAIP2ChainId:(e,t)=>`${t}:${parseInt(e,16)}`,getChainIdHexFromCAIP2ChainId(e){let t=e.split(":");if(t.length<2||!t[1])return"0x0";let r=parseInt(t[1],10);return isNaN(r)?"0x0":`0x${r.toString(16)}`},isWalletGetAssetsResponse(e){return"object"==typeof e&&null!==e&&Object.values(e).every(e=>Array.isArray(e)&&e.every(e=>this.isValidAsset(e)))},isValidAsset:e=>"object"==typeof e&&null!==e&&"string"==typeof e.address&&"string"==typeof e.balance&&("ERC20"===e.type||"NATIVE"===e.type)&&"object"==typeof e.metadata&&null!==e.metadata&&"string"==typeof e.metadata.name&&"string"==typeof e.metadata.symbol&&"number"==typeof e.metadata.decimals&&"number"==typeof e.metadata.price&&"string"==typeof e.metadata.iconUrl},F={async getMyTokensWithBalance(e){let t=u.AccountController.state.address,r=z.state.activeCaipNetwork;if(!t||!r)return[];if("eip155"===r.chainNamespace){let e=await this.getEIP155Balances(t,r);if(e)return this.filterLowQualityTokens(e)}let a=await h.BlockchainApiController.getBalance(t,r.caipNetworkId,e);return this.filterLowQualityTokens(a.balances)},async getEIP155Balances(e,t){try{let r=W.getChainIdHexFromCAIP2ChainId(t.caipNetworkId),a=await N.getCapabilities(e);if(!a?.[r]?.assetDiscovery?.supported)return null;let o=await N.walletGetAssets({account:e,chainFilter:[r]});if(!W.isWalletGetAssetsResponse(o))return null;return(o[r]||[]).map(e=>W.createBalance(e,t.caipNetworkId))}catch(e){return null}},filterLowQualityTokens:e=>e.filter(e=>"0"!==e.quantity.decimals),mapBalancesToSwapTokens:e=>e?.map(e=>({...e,address:e?.address?e.address:z.getActiveNetworkTokenAddress(),decimals:parseInt(e.quantity.decimals,10),logoUri:e.iconUrl,eip2612:!1}))||[]},H=(0,r.proxy)({tokenBalances:[],loading:!1}),j=(0,l.withErrorBoundary)({state:H,subscribe:e=>(0,r.subscribe)(H,()=>e(H)),subscribeKey:(e,t)=>(0,a.subscribeKey)(H,e,t),setToken(e){e&&(H.token=(0,r.ref)(e))},setTokenAmount(e){H.sendTokenAmount=e},setReceiverAddress(e){H.receiverAddress=e},setReceiverProfileImageUrl(e){H.receiverProfileImageUrl=e},setReceiverProfileName(e){H.receiverProfileName=e},setNetworkBalanceInUsd(e){H.networkBalanceInUSD=e},setLoading(e){H.loading=e},async sendToken(){try{switch(j.setLoading(!0),z.state.activeCaipNetwork?.chainNamespace){case"eip155":await j.sendEvmToken();return;case"solana":await j.sendSolanaToken();return;default:throw Error("Unsupported chain")}}finally{j.setLoading(!1)}},async sendEvmToken(){let e=z.state.activeChain,t=u.AccountController.state.preferredAccountTypes?.[e];if(!j.state.sendTokenAmount||!j.state.receiverAddress)throw Error("An amount and receiver address are required");if(!j.state.token)throw Error("A token is required");j.state.token?.address?(p.EventsController.sendEvent({type:"track",event:"SEND_INITIATED",properties:{isSmartAccount:t===m.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,token:j.state.token.address,amount:j.state.sendTokenAmount,network:z.state.activeCaipNetwork?.caipNetworkId||""}}),await j.sendERC20Token({receiverAddress:j.state.receiverAddress,tokenAddress:j.state.token.address,sendTokenAmount:j.state.sendTokenAmount,decimals:j.state.token.quantity.decimals})):(p.EventsController.sendEvent({type:"track",event:"SEND_INITIATED",properties:{isSmartAccount:t===m.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,token:j.state.token.symbol||"",amount:j.state.sendTokenAmount,network:z.state.activeCaipNetwork?.caipNetworkId||""}}),await j.sendNativeToken({receiverAddress:j.state.receiverAddress,sendTokenAmount:j.state.sendTokenAmount,decimals:j.state.token.quantity.decimals}))},async fetchTokenBalance(e){H.loading=!0;let t=z.state.activeCaipNetwork?.caipNetworkId,r=z.state.activeCaipNetwork?.chainNamespace,a=z.state.activeCaipAddress,o=a?s.CoreHelperUtil.getPlainAddress(a):void 0;if(H.lastRetry&&!s.CoreHelperUtil.isAllowedRetry(H.lastRetry,30*n.ConstantsUtil.ONE_SEC_MS))return H.loading=!1,[];try{if(o&&t&&r){let e=await F.getMyTokensWithBalance();return H.tokenBalances=e,H.lastRetry=void 0,e}}catch(t){H.lastRetry=Date.now(),e?.(t),f.SnackController.showError("Token Balance Unavailable")}finally{H.loading=!1}return[]},fetchNetworkBalance(){if(0===H.tokenBalances.length)return;let e=F.mapBalancesToSwapTokens(H.tokenBalances);if(!e)return;let t=e.find(e=>e.address===z.getActiveNetworkTokenAddress());t&&(H.networkBalanceInUSD=t?B.multiply(t.quantity.numeric,t.price).toString():"0")},async sendNativeToken(e){g.RouterController.pushTransactionStack({});let t=e.receiverAddress,r=u.AccountController.state.address,a=N.parseUnits(e.sendTokenAmount.toString(),Number(e.decimals));await N.sendTransaction({chainNamespace:"eip155",to:t,address:r,data:"0x",value:a??BigInt(0)}),p.EventsController.sendEvent({type:"track",event:"SEND_SUCCESS",properties:{isSmartAccount:u.AccountController.state.preferredAccountTypes?.eip155===m.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,token:j.state.token?.symbol||"",amount:e.sendTokenAmount,network:z.state.activeCaipNetwork?.caipNetworkId||""}}),N._getClient()?.updateBalance("eip155"),j.resetSend()},async sendERC20Token(e){g.RouterController.pushTransactionStack({onSuccess(){g.RouterController.replace("Account")}});let t=N.parseUnits(e.sendTokenAmount.toString(),Number(e.decimals));if(u.AccountController.state.address&&e.sendTokenAmount&&e.receiverAddress&&e.tokenAddress){let r,a=s.CoreHelperUtil.getPlainAddress(e.tokenAddress);await N.writeContract({fromAddress:u.AccountController.state.address,tokenAddress:a,args:[e.receiverAddress,t??BigInt(0)],method:"transfer",abi:(r=a,o.ConstantsUtil.USDT_CONTRACT_ADDRESSES.includes(r)?L:D),chainNamespace:"eip155"}),j.resetSend()}},async sendSolanaToken(){if(!j.state.sendTokenAmount||!j.state.receiverAddress)throw Error("An amount and receiver address are required");g.RouterController.pushTransactionStack({onSuccess(){g.RouterController.replace("Account")}}),await N.sendTransaction({chainNamespace:"solana",to:j.state.receiverAddress,value:j.state.sendTokenAmount}),N._getClient()?.updateBalance("solana"),j.resetSend()},resetSend(){H.token=void 0,H.sendTokenAmount=void 0,H.receiverAddress=void 0,H.receiverProfileImageUrl=void 0,H.receiverProfileName=void 0,H.loading=!1,H.tokenBalances=[]}}),V={currentTab:0,tokenBalance:[],smartAccountDeployed:!1,addressLabels:new Map,allAccounts:[],user:void 0},$={caipNetwork:void 0,supportsAllNetworks:!0,smartAccountEnabledNetworks:[]},K=(0,r.proxy)({chains:(0,a.proxyMap)(),activeCaipAddress:void 0,activeChain:void 0,activeCaipNetwork:void 0,noAdapters:!1,universalAdapter:{networkControllerClient:void 0,connectionControllerClient:void 0},isSwitchingNamespace:!1}),z=(0,l.withErrorBoundary)({state:K,subscribe:e=>(0,r.subscribe)(K,()=>{e(K)}),subscribeKey:(e,t)=>(0,a.subscribeKey)(K,e,t),subscribeChainProp(e,t,a){let o;return(0,r.subscribe)(K.chains,()=>{let r=a||K.activeChain;if(r){let a=K.chains.get(r)?.[e];o!==a&&(o=a,t(a))}})},initialize(e,t,a){let{chainId:o,namespace:i}=c.StorageUtil.getActiveNetworkProps(),n=t?.find(e=>e.id.toString()===o?.toString()),s=e.find(e=>e?.namespace===i)||e?.[0],l=e.map(e=>e.namespace).filter(e=>void 0!==e),u=new Set(C.OptionsController.state.enableEmbedded?[...l]:[...t?.map(e=>e.chainNamespace)??[]]);e?.length!==0&&s||(K.noAdapters=!0),!K.noAdapters&&(K.activeChain=s?.namespace,K.activeCaipNetwork=n,z.setChainNetworkData(s?.namespace,{caipNetwork:n}),K.activeChain&&y.PublicStateController.set({activeChain:s?.namespace})),u.forEach(e=>{let o=t?.filter(t=>t.chainNamespace===e);z.state.chains.set(e,{namespace:e,networkState:(0,r.proxy)({...$,caipNetwork:o?.[0]}),accountState:(0,r.proxy)(V),caipNetworks:o??[],...a}),z.setRequestedCaipNetworks(o??[],e)})},removeAdapter(e){if(K.activeChain===e){let t=Array.from(K.chains.entries()).find(([t])=>t!==e);if(t){let e=t[1]?.caipNetworks?.[0];e&&z.setActiveCaipNetwork(e)}}K.chains.delete(e)},addAdapter(e,{networkControllerClient:t,connectionControllerClient:r},a){K.chains.set(e.namespace,{namespace:e.namespace,networkState:{...$,caipNetwork:a[0]},accountState:V,caipNetworks:a,connectionControllerClient:r,networkControllerClient:t}),z.setRequestedCaipNetworks(a?.filter(t=>t.chainNamespace===e.namespace)??[],e.namespace)},addNetwork(e){let t=K.chains.get(e.chainNamespace);if(t){let r=[...t.caipNetworks||[]];t.caipNetworks?.find(t=>t.id===e.id)||r.push(e),K.chains.set(e.chainNamespace,{...t,caipNetworks:r}),z.setRequestedCaipNetworks(r,e.chainNamespace),d.ConnectorController.filterByNamespace(e.chainNamespace,!0)}},removeNetwork(e,t){let r=K.chains.get(e);if(r){let a=K.activeCaipNetwork?.id===t,o=[...r.caipNetworks?.filter(e=>e.id!==t)||[]];a&&r?.caipNetworks?.[0]&&z.setActiveCaipNetwork(r.caipNetworks[0]),K.chains.set(e,{...r,caipNetworks:o}),z.setRequestedCaipNetworks(o||[],e),0===o.length&&d.ConnectorController.filterByNamespace(e,!1)}},setAdapterNetworkState(e,t){let r=K.chains.get(e);r&&(r.networkState={...r.networkState||$,...t},K.chains.set(e,r))},setChainAccountData(e,t,r=!0){if(!e)throw Error("Chain is required to update chain account data");let a=K.chains.get(e);if(a){let r={...a.accountState||V,...t};K.chains.set(e,{...a,accountState:r}),(1===K.chains.size||K.activeChain===e)&&(t.caipAddress&&(K.activeCaipAddress=t.caipAddress),u.AccountController.replaceState(r))}},setChainNetworkData(e,t){if(!e)return;let r=K.chains.get(e);if(r){let a={...r.networkState||$,...t};K.chains.set(e,{...r,networkState:a})}},setAccountProp(e,t,r,a=!0){z.setChainAccountData(r,{[e]:t},a),"status"===e&&"disconnected"===t&&r&&d.ConnectorController.removeConnectorId(r)},setActiveNamespace(e){K.activeChain=e;let t=e?K.chains.get(e):void 0,r=t?.networkState?.caipNetwork;r?.id&&e&&(K.activeCaipAddress=t?.accountState?.caipAddress,K.activeCaipNetwork=r,z.setChainNetworkData(e,{caipNetwork:r}),c.StorageUtil.setActiveCaipNetworkId(r?.caipNetworkId),y.PublicStateController.set({activeChain:e,selectedNetworkId:r?.caipNetworkId}))},setActiveCaipNetwork(e){if(!e)return;K.activeChain!==e.chainNamespace&&z.setIsSwitchingNamespace(!0);let t=K.chains.get(e.chainNamespace);K.activeChain=e.chainNamespace,K.activeCaipNetwork=e,z.setChainNetworkData(e.chainNamespace,{caipNetwork:e}),t?.accountState?.address?K.activeCaipAddress=`${e.chainNamespace}:${e.id}:${t?.accountState?.address}`:K.activeCaipAddress=void 0,z.setAccountProp("caipAddress",K.activeCaipAddress,e.chainNamespace),t&&u.AccountController.replaceState(t.accountState),j.resetSend(),y.PublicStateController.set({activeChain:K.activeChain,selectedNetworkId:K.activeCaipNetwork?.caipNetworkId}),c.StorageUtil.setActiveCaipNetworkId(e.caipNetworkId),z.checkIfSupportedNetwork(e.chainNamespace)||!C.OptionsController.state.enableNetworkSwitch||C.OptionsController.state.allowUnsupportedChain||N.state.wcBasic||z.showUnsupportedChainUI()},addCaipNetwork(e){if(!e)return;let t=K.chains.get(e.chainNamespace);t&&t?.caipNetworks?.push(e)},async switchActiveNamespace(e){if(!e)return;let t=e!==z.state.activeChain,r=z.getNetworkData(e)?.caipNetwork,a=z.getCaipNetworkByNamespace(e,r?.id);t&&a&&await z.switchActiveNetwork(a)},async switchActiveNetwork(e){let t=z.state.chains.get(z.state.activeChain),r=!t?.caipNetworks?.some(e=>e.id===K.activeCaipNetwork?.id),a=z.getNetworkControllerClient(e.chainNamespace);if(a){try{await a.switchCaipNetwork(e),r&&w.ModalController.close()}catch(e){g.RouterController.goBack()}p.EventsController.sendEvent({type:"track",event:"SWITCH_NETWORK",properties:{network:e.caipNetworkId}})}},getNetworkControllerClient(e){let t=e||K.activeChain,r=K.chains.get(t);if(!r)throw Error("Chain adapter not found");if(!r.networkControllerClient)throw Error("NetworkController client not set");return r.networkControllerClient},getConnectionControllerClient(e){let t=e||K.activeChain;if(!t)throw Error("Chain is required to get connection controller client");let r=K.chains.get(t);if(!r?.connectionControllerClient)throw Error("ConnectionController client not set");return r.connectionControllerClient},getAccountProp(e,t){let r=K.activeChain;if(t&&(r=t),!r)return;let a=K.chains.get(r)?.accountState;if(a)return a[e]},getNetworkProp(e,t){let r=K.chains.get(t)?.networkState;if(r)return r[e]},getRequestedCaipNetworks(e){let t=K.chains.get(e),{approvedCaipNetworkIds:r=[],requestedCaipNetworks:a=[]}=t?.networkState||{};return s.CoreHelperUtil.sortRequestedNetworks(r,a)},getAllRequestedCaipNetworks(){let e=[];return K.chains.forEach(t=>{let r=z.getRequestedCaipNetworks(t.namespace);e.push(...r)}),e},setRequestedCaipNetworks(e,t){z.setAdapterNetworkState(t,{requestedCaipNetworks:e});let r=Array.from(new Set(z.getAllRequestedCaipNetworks().map(e=>e.chainNamespace)));d.ConnectorController.filterByNamespaces(r)},getAllApprovedCaipNetworkIds(){let e=[];return K.chains.forEach(t=>{let r=z.getApprovedCaipNetworkIds(t.namespace);e.push(...r)}),e},getActiveCaipNetwork:()=>K.activeCaipNetwork,getActiveCaipAddress:()=>K.activeCaipAddress,getApprovedCaipNetworkIds(e){let t=K.chains.get(e);return t?.networkState?.approvedCaipNetworkIds||[]},async setApprovedCaipNetworksData(e){let t=z.getNetworkControllerClient(),r=await t?.getApprovedCaipNetworksData();z.setAdapterNetworkState(e,{approvedCaipNetworkIds:r?.approvedCaipNetworkIds,supportsAllNetworks:r?.supportsAllNetworks})},checkIfSupportedNetwork(e,t){let r=t||K.activeCaipNetwork,a=z.getRequestedCaipNetworks(e);return!a.length||a?.some(e=>e.id===r?.id)},checkIfSupportedChainId(e){if(!K.activeChain)return!0;let t=z.getRequestedCaipNetworks(K.activeChain);return t?.some(t=>t.id===e)},setSmartAccountEnabledNetworks(e,t){z.setAdapterNetworkState(t,{smartAccountEnabledNetworks:e})},checkIfSmartAccountEnabled(){let e=i.NetworkUtil.caipNetworkIdToNumber(K.activeCaipNetwork?.caipNetworkId),t=K.activeChain;if(!t||!e)return!1;let r=z.getNetworkProp("smartAccountEnabledNetworks",t);return!!r?.includes(Number(e))},getActiveNetworkTokenAddress(){let e=K.activeCaipNetwork?.chainNamespace||"eip155",t=K.activeCaipNetwork?.id||1,r=n.ConstantsUtil.NATIVE_TOKEN_ADDRESS[e];return`${e}:${t}:${r}`},showUnsupportedChainUI(){w.ModalController.open({view:"UnsupportedChain"})},checkIfNamesSupported(){let e=K.activeCaipNetwork;return!!(e?.chainNamespace&&n.ConstantsUtil.NAMES_SUPPORTED_CHAIN_NAMESPACES.includes(e.chainNamespace))},resetNetwork(e){z.setAdapterNetworkState(e,{approvedCaipNetworkIds:void 0,supportsAllNetworks:!0,smartAccountEnabledNetworks:[]})},resetAccount(e){if(!e)throw Error("Chain is required to set account prop");K.activeCaipAddress=void 0,z.setChainAccountData(e,{smartAccountDeployed:!1,currentTab:0,caipAddress:void 0,address:void 0,balance:void 0,balanceSymbol:void 0,profileName:void 0,profileImage:void 0,addressExplorerUrl:void 0,tokenBalance:[],connectedWalletInfo:void 0,preferredAccountTypes:void 0,socialProvider:void 0,socialWindow:void 0,farcasterUrl:void 0,allAccounts:[],user:void 0,status:"disconnected"}),d.ConnectorController.removeConnectorId(e)},setIsSwitchingNamespace(e){K.isSwitchingNamespace=e},getFirstCaipNetworkSupportsAuthConnector(){let e=[];if(K.chains.forEach(t=>{o.ConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(e=>e===t.namespace)&&t.namespace&&e.push(t.namespace)}),e.length>0){let t=e[0];return t?K.chains.get(t)?.caipNetworks?.[0]:void 0}},getAccountData:e=>e?z.state.chains.get(e)?.accountState:u.AccountController.state,getNetworkData(e){let t=e||K.activeChain;if(t)return z.state.chains.get(t)?.networkState},getCaipNetworkByNamespace(e,t){if(!e)return;let r=z.state.chains.get(e),a=r?.caipNetworks?.find(e=>e.id===t);return a||r?.networkState?.caipNetwork||r?.caipNetworks?.[0]},getRequestedCaipNetworkIds(){let e=d.ConnectorController.state.filterByNamespace;return(e?[K.chains.get(e)]:Array.from(K.chains.values())).flatMap(e=>e?.caipNetworks||[]).map(e=>e.caipNetworkId)},getCaipNetworks:e=>e?z.getRequestedCaipNetworks(e):z.getAllRequestedCaipNetworks()})},68761,79773,35517,89344,99878,22656,e=>{"use strict";e.s(["ConnectorController",()=>S],68761),e.s(["RouterController",()=>A],89344),e.s(["ModalController",()=>b],35517),e.s(["ThemeController",()=>E],99878);var t=e.i(20464),r=e.i(35126),a=e.i(10861),o=e.i(40368),i=e.i(93400),n=e.i(53519),s=e.i(51351),c=e.i(76425),l=e.i(55920),u=e.i(12906),d=e.i(1945),p=e.i(97882),w=e.i(66484),g=e.i(46328),m=e.i(37292);let h=(0,t.proxy)({loading:!1,open:!1,selectedNetworkId:void 0,activeChain:void 0,initialized:!1}),C={state:h,subscribe:e=>(0,t.subscribe)(h,()=>e(h)),subscribeOpen:e=>(0,r.subscribeKey)(h,"open",e),set(e){Object.assign(h,{...h,...e})}};e.s(["PublicStateController",0,C],79773);let f=(0,t.proxy)({loading:!1,loadingNamespaceMap:new Map,open:!1,shake:!1,namespace:void 0}),b=(0,s.withErrorBoundary)({state:f,subscribe:e=>(0,t.subscribe)(f,()=>e(f)),subscribeKey:(e,t)=>(0,r.subscribeKey)(f,e,t),async open(e){let t="connected"===d.AccountController.state.status,r=e?.namespace,a=l.ChainController.state.activeChain,o=r&&r!==a,i=l.ChainController.getAccountData(e?.namespace)?.caipAddress;if(g.ConnectionController.state.wcBasic?c.ApiController.prefetch({fetchNetworkImages:!1,fetchConnectorImages:!1}):await c.ApiController.prefetch({fetchConnectorImages:!t,fetchFeaturedWallets:!t,fetchRecommendedWallets:!t}),S.setFilterByNamespace(e?.namespace),b.setLoading(!0,r),r&&o){let e=l.ChainController.getNetworkData(r)?.caipNetwork||l.ChainController.getRequestedCaipNetworks(r)[0];e&&w.NetworkUtil.onSwitchNetwork({network:e,ignoreSwitchConfirmation:!0})}else{let t=l.ChainController.state.noAdapters;u.OptionsController.state.manualWCControl||t&&!i?p.CoreHelperUtil.isMobile()?A.reset("AllWallets"):A.reset("ConnectingWalletConnectBasic"):e?.view?A.reset(e.view,e.data):i?A.reset("Account"):A.reset("Connect")}f.open=!0,C.set({open:!0}),m.EventsController.sendEvent({type:"track",event:"MODAL_OPEN",properties:{connected:!!i}})},close(){let e=u.OptionsController.state.enableEmbedded,t=!!l.ChainController.state.activeCaipAddress;f.open&&m.EventsController.sendEvent({type:"track",event:"MODAL_CLOSE",properties:{connected:t}}),f.open=!1,A.reset("Connect"),b.clearLoading(),e?t?A.replace("Account"):A.push("Connect"):C.set({open:!1}),g.ConnectionController.resetUri()},setLoading(e,t){t&&f.loadingNamespaceMap.set(t,e),f.loading=e,C.set({loading:e})},clearLoading(){f.loadingNamespaceMap.clear(),f.loading=!1},shake(){f.shake||(f.shake=!0,setTimeout(()=>{f.shake=!1},500))}}),v=(0,t.proxy)({view:"Connect",history:["Connect"],transactionStack:[]}),A=(0,s.withErrorBoundary)({state:v,subscribeKey:(e,t)=>(0,r.subscribeKey)(v,e,t),pushTransactionStack(e){v.transactionStack.push(e)},popTransactionStack(e){let t=v.transactionStack.pop();if(!t)return;let{onSuccess:r,onError:a,onCancel:o}=t;switch(e){case"success":r?.();break;case"error":a?.(),A.goBack();break;case"cancel":o?.(),A.goBack()}},push(e,t){e!==v.view&&(v.view=e,v.history.push(e),v.data=t)},reset(e,t){v.view=e,v.history=[e],v.data=t},replace(e,t){v.history.at(-1)!==e&&(v.view=e,v.history[v.history.length-1]=e,v.data=t)},goBack(){let e=l.ChainController.state.activeCaipAddress,r="ConnectingFarcaster"===A.state.view,a=!e&&r;if(v.history.length>1){v.history.pop();let[t]=v.history.slice(-1);t&&(e&&"Connect"===t?v.view="Account":v.view=t)}else b.close();v.data?.wallet&&(v.data.wallet=void 0),setTimeout(()=>{if(a){d.AccountController.setFarcasterUrl(void 0,l.ChainController.state.activeChain);let e=S.getAuthConnector();e?.provider?.reload();let r=(0,t.snapshot)(u.OptionsController.state);e?.provider?.syncDappData?.({metadata:r.metadata,sdkVersion:r.sdkVersion,projectId:r.projectId,sdkType:r.sdkType})}},100)},goBackToIndex(e){if(v.history.length>1){v.history=v.history.slice(0,e+1);let[t]=v.history.slice(-1);t&&(v.view=t)}},goBackOrCloseModal(){A.state.history.length>1?A.goBack():b.close()}}),N=(0,t.proxy)({themeMode:"dark",themeVariables:{},w3mThemeVariables:void 0}),y={state:N,subscribe:e=>(0,t.subscribe)(N,()=>e(N)),setThemeMode(e){N.themeMode=e;try{let t=S.getAuthConnector();if(t){let r=y.getSnapshot().themeVariables;t.provider.syncTheme({themeMode:e,themeVariables:r,w3mThemeVariables:(0,o.getW3mThemeVariables)(r,e)})}}catch{console.info("Unable to sync theme to auth connector")}},setThemeVariables(e){N.themeVariables={...N.themeVariables,...e};try{let e=S.getAuthConnector();if(e){let t=y.getSnapshot().themeVariables;e.provider.syncTheme({themeVariables:t,w3mThemeVariables:(0,o.getW3mThemeVariables)(N.themeVariables,N.themeMode)})}}catch{console.info("Unable to sync theme to auth connector")}},getSnapshot:()=>(0,t.snapshot)(N)},E=(0,s.withErrorBoundary)(y),k={eip155:void 0,solana:void 0,polkadot:void 0,bip122:void 0,cosmos:void 0},I=(0,t.proxy)({allConnectors:[],connectors:[],activeConnector:void 0,filterByNamespace:void 0,activeConnectorIds:{...k},filterByNamespaceMap:{eip155:!0,solana:!0,polkadot:!0,bip122:!0,cosmos:!0}}),S=(0,s.withErrorBoundary)({state:I,subscribe:e=>(0,t.subscribe)(I,()=>{e(I)}),subscribeKey:(e,t)=>(0,r.subscribeKey)(I,e,t),initialize(e){e.forEach(e=>{let t=n.StorageUtil.getConnectedConnectorId(e);t&&S.setConnectorId(t,e)})},setActiveConnector(e){e&&(I.activeConnector=(0,t.ref)(e))},setConnectors(e){e.filter(e=>!I.allConnectors.some(t=>t.id===e.id&&S.getConnectorName(t.name)===S.getConnectorName(e.name)&&t.chain===e.chain)).forEach(e=>{"MULTI_CHAIN"!==e.type&&I.allConnectors.push((0,t.ref)(e))});let r=S.getEnabledNamespaces(),a=S.getEnabledConnectors(r);I.connectors=S.mergeMultiChainConnectors(a)},filterByNamespaces(e){Object.keys(I.filterByNamespaceMap).forEach(e=>{I.filterByNamespaceMap[e]=!1}),e.forEach(e=>{I.filterByNamespaceMap[e]=!0}),S.updateConnectorsForEnabledNamespaces()},filterByNamespace(e,t){I.filterByNamespaceMap[e]=t,S.updateConnectorsForEnabledNamespaces()},updateConnectorsForEnabledNamespaces(){let e=S.getEnabledNamespaces(),t=S.getEnabledConnectors(e),r=S.areAllNamespacesEnabled();I.connectors=S.mergeMultiChainConnectors(t),r?c.ApiController.clearFilterByNamespaces():c.ApiController.filterByNamespaces(e)},getEnabledNamespaces:()=>Object.entries(I.filterByNamespaceMap).filter(([e,t])=>t).map(([e])=>e),getEnabledConnectors:e=>I.allConnectors.filter(t=>e.includes(t.chain)),areAllNamespacesEnabled:()=>Object.values(I.filterByNamespaceMap).every(e=>e),mergeMultiChainConnectors(e){let t=S.generateConnectorMapByName(e),r=[];return t.forEach(e=>{let t=e[0],o=t?.id===a.ConstantsUtil.CONNECTOR_ID.AUTH;e.length>1&&t?r.push({name:t.name,imageUrl:t.imageUrl,imageId:t.imageId,connectors:[...e],type:o?"AUTH":"MULTI_CHAIN",chain:"eip155",id:t?.id||""}):t&&r.push(t)}),r},generateConnectorMapByName(e){let t=new Map;return e.forEach(e=>{let{name:r}=e,a=S.getConnectorName(r);if(!a)return;let o=t.get(a)||[];o.find(t=>t.chain===e.chain)||o.push(e),t.set(a,o)}),t},getConnectorName:e=>e&&({"Trust Wallet":"Trust"})[e]||e,getUniqueConnectorsByName(e){let t=[];return e.forEach(e=>{t.find(t=>t.chain===e.chain)||t.push(e)}),t},addConnector(e){if(e.id===a.ConstantsUtil.CONNECTOR_ID.AUTH){let r=(0,t.snapshot)(u.OptionsController.state),a=E.getSnapshot().themeMode,i=E.getSnapshot().themeVariables;e?.provider?.syncDappData?.({metadata:r.metadata,sdkVersion:r.sdkVersion,projectId:r.projectId,sdkType:r.sdkType}),e?.provider?.syncTheme({themeMode:a,themeVariables:i,w3mThemeVariables:(0,o.getW3mThemeVariables)(i,a)}),S.setConnectors([e])}else S.setConnectors([e])},getAuthConnector(e){let t=e||l.ChainController.state.activeChain,r=I.connectors.find(e=>e.id===a.ConstantsUtil.CONNECTOR_ID.AUTH);if(r)return r?.connectors?.length?r.connectors.find(e=>e.chain===t):r},getAnnouncedConnectorRdns:()=>I.connectors.filter(e=>"ANNOUNCED"===e.type).map(e=>e.info?.rdns),getConnectorById:e=>I.allConnectors.find(t=>t.id===e),getConnector:(e,t)=>I.allConnectors.filter(e=>e.chain===l.ChainController.state.activeChain).find(r=>r.explorerId===e||r.info?.rdns===t),syncIfAuthConnector(e){if("ID_AUTH"!==e.id)return;let r=(0,t.snapshot)(u.OptionsController.state),a=E.getSnapshot().themeMode,i=E.getSnapshot().themeVariables;e?.provider?.syncDappData?.({metadata:r.metadata,sdkVersion:r.sdkVersion,sdkType:r.sdkType,projectId:r.projectId}),e.provider.syncTheme({themeMode:a,themeVariables:i,w3mThemeVariables:(0,o.getW3mThemeVariables)(i,a)})},getConnectorsByNamespace(e){let t=I.allConnectors.filter(t=>t.chain===e);return S.mergeMultiChainConnectors(t)},selectWalletConnector(e){let t=S.getConnector(e.id,e.rdns),r=l.ChainController.state.activeChain;i.MobileWalletUtil.handleMobileDeeplinkRedirect(t?.explorerId||e.id,r),t?A.push("ConnectingExternal",{connector:t}):A.push("ConnectingWalletConnect",{wallet:e})},getConnectors:e=>e?S.getConnectorsByNamespace(e):S.mergeMultiChainConnectors(I.allConnectors),setFilterByNamespace(e){I.filterByNamespace=e,I.connectors=S.getConnectors(e),c.ApiController.setFilterByNamespace(e)},setConnectorId(e,t){e&&(I.activeConnectorIds={...I.activeConnectorIds,[t]:e},n.StorageUtil.setConnectedConnectorId(t,e))},removeConnectorId(e){I.activeConnectorIds={...I.activeConnectorIds,[e]:void 0},n.StorageUtil.deleteConnectedConnectorId(e)},getConnectorId(e){if(e)return I.activeConnectorIds[e]},isConnected:e=>e?!!I.activeConnectorIds[e]:Object.values(I.activeConnectorIds).some(e=>!!e),resetConnectorIds(){I.activeConnectorIds={...k}}});var _=e.i(20145);void 0!==_.default&&void 0!==_.default.env&&_.default.env.NEXT_PUBLIC_SECURE_SITE_SDK_URL,void 0!==_.default&&void 0!==_.default.env&&_.default.env.NEXT_PUBLIC_DEFAULT_LOG_LEVEL,void 0!==_.default&&void 0!==_.default.env&&_.default.env.NEXT_PUBLIC_SECURE_SITE_SDK_VERSION,e.s(["W3mFrameRpcConstants",0,{SAFE_RPC_METHODS:["eth_accounts","eth_blockNumber","eth_call","eth_chainId","eth_estimateGas","eth_feeHistory","eth_gasPrice","eth_getAccount","eth_getBalance","eth_getBlockByHash","eth_getBlockByNumber","eth_getBlockReceipts","eth_getBlockTransactionCountByHash","eth_getBlockTransactionCountByNumber","eth_getCode","eth_getFilterChanges","eth_getFilterLogs","eth_getLogs","eth_getProof","eth_getStorageAt","eth_getTransactionByBlockHashAndIndex","eth_getTransactionByBlockNumberAndIndex","eth_getTransactionByHash","eth_getTransactionCount","eth_getTransactionReceipt","eth_getUncleCountByBlockHash","eth_getUncleCountByBlockNumber","eth_maxPriorityFeePerGas","eth_newBlockFilter","eth_newFilter","eth_newPendingTransactionFilter","eth_sendRawTransaction","eth_syncing","eth_uninstallFilter","wallet_getCapabilities","wallet_getCallsStatus","eth_getUserOperationReceipt","eth_estimateUserOperationGas","eth_getUserOperationByHash","eth_supportedEntryPoints","wallet_getAssets"],NOT_SAFE_RPC_METHODS:["personal_sign","eth_signTypedData_v4","eth_sendTransaction","solana_signMessage","solana_signTransaction","solana_signAllTransactions","solana_signAndSendTransaction","wallet_sendCalls","wallet_grantPermissions","wallet_revokePermissions","eth_sendUserOperation"],GET_CHAIN_ID:"eth_chainId",RPC_METHOD_NOT_ALLOWED_MESSAGE:"Requested RPC call is not allowed",RPC_METHOD_NOT_ALLOWED_UI_MESSAGE:"Action not allowed",ACCOUNT_TYPES:{EOA:"eoa",SMART_ACCOUNT:"smartAccount"}}],22656)},37292,31680,e=>{"use strict";e.s(["EventsController",()=>h],37292);var t=e.i(20464),r=e.i(10861),a=e.i(85947),o=e.i(97882),i=e.i(66296),n=e.i(1945),s=e.i(35126),c=e.i(51351),l=e.i(12906);let u=(0,t.proxy)({message:"",variant:"info",open:!1}),d=(0,c.withErrorBoundary)({state:u,subscribeKey:(e,t)=>(0,s.subscribeKey)(u,e,t),open(e,t){let{debug:r}=l.OptionsController.state,{shortMessage:a,longMessage:o}=e;r&&(u.message=a,u.variant=t,u.open=!0),o&&console.error("function"==typeof o?o():o)},close(){u.open=!1,u.message="",u.variant="info"}});e.s(["AlertController",0,d],31680);let p=o.CoreHelperUtil.getAnalyticsUrl(),w=new i.FetchUtil({baseUrl:p,clientId:null}),g=["MODAL_CREATED"],m=(0,t.proxy)({timestamp:Date.now(),reportedErrors:{},data:{type:"track",event:"MODAL_CREATED"}}),h={state:m,subscribe:e=>(0,t.subscribe)(m,()=>e(m)),getSdkProperties(){let{projectId:e,sdkType:t,sdkVersion:r}=l.OptionsController.state;return{projectId:e,st:t,sv:r||"html-wagmi-4.2.2"}},async _sendAnalyticsEvent(e){try{let t=n.AccountController.state.address;if(g.includes(e.data.event)||"u"<typeof window)return;await w.post({path:"/e",params:h.getSdkProperties(),body:{eventId:o.CoreHelperUtil.getUUID(),url:window.location.href,domain:window.location.hostname,timestamp:e.timestamp,props:{...e.data,address:t}}}),m.reportedErrors.FORBIDDEN=!1}catch(e){e instanceof Error&&e.cause instanceof Response&&e.cause.status===r.ConstantsUtil.HTTP_STATUS_CODES.FORBIDDEN&&!m.reportedErrors.FORBIDDEN&&(d.open({shortMessage:"Invalid App Configuration",longMessage:`Origin ${(0,a.isSafe)()?window.origin:"uknown"} not found on Allowlist - update configuration on cloud.reown.com`},"error"),m.reportedErrors.FORBIDDEN=!0)}},sendEvent(e){m.timestamp=Date.now(),m.data=e,l.OptionsController.state.features?.analytics&&h._sendAnalyticsEvent(m)}}},54012,e=>{"use strict";var t=e.i(20464),r=e.i(35126),a=e.i(97882);let o=Object.freeze({message:"",variant:"success",svg:void 0,open:!1,autoClose:!0}),i=(0,t.proxy)({...o});e.s(["SnackController",0,{state:i,subscribeKey:(e,t)=>(0,r.subscribeKey)(i,e,t),showLoading(e,t={}){this._showMessage({message:e,variant:"loading",...t})},showSuccess(e){this._showMessage({message:e,variant:"success"})},showSvg(e,t){this._showMessage({message:e,svg:t})},showError(e){let t=a.CoreHelperUtil.parseError(e);this._showMessage({message:t,variant:"error"})},hide(){i.message=o.message,i.variant=o.variant,i.svg=o.svg,i.open=o.open,i.autoClose=o.autoClose},_showMessage({message:e,svg:t,variant:r="success",autoClose:a=o.autoClose}){i.open?(i.open=!1,setTimeout(()=>{i.message=e,i.variant=r,i.svg=t,i.open=!0,i.autoClose=a},150)):(i.message=e,i.variant=r,i.svg=t,i.open=!0,i.autoClose=a)}}])},82869,4595,e=>{"use strict";e.s(["AssetUtil",()=>l],82869);var t=e.i(20464),r=e.i(76425),a=e.i(35126),o=e.i(51351);let i=(0,t.proxy)({walletImages:{},networkImages:{},chainImages:{},connectorImages:{},tokenImages:{},currencyImages:{}}),n=(0,o.withErrorBoundary)({state:i,subscribeNetworkImages:e=>(0,t.subscribe)(i.networkImages,()=>e(i.networkImages)),subscribeKey:(e,t)=>(0,a.subscribeKey)(i,e,t),subscribe:e=>(0,t.subscribe)(i,()=>e(i)),setWalletImage(e,t){i.walletImages[e]=t},setNetworkImage(e,t){i.networkImages[e]=t},setChainImage(e,t){i.chainImages[e]=t},setConnectorImage(e,t){i.connectorImages={...i.connectorImages,[e]:t}},setTokenImage(e,t){i.tokenImages[e]=t},setCurrencyImage(e,t){i.currencyImages[e]=t}});e.s(["AssetController",0,n],4595);let s={eip155:"ba0ba0cd-17c6-4806-ad93-f9d174f17900",solana:"a1b58899-f671-4276-6a5e-56ca5bd59700",polkadot:"",bip122:"0b4838db-0161-4ffe-022d-532bf03dba00",cosmos:""},c=(0,t.proxy)({networkImagePromises:{}}),l={async fetchWalletImage(e){if(e)return await r.ApiController._fetchWalletImage(e),this.getWalletImageById(e)},async fetchNetworkImage(e){if(!e)return;let t=this.getNetworkImageById(e);return t||(c.networkImagePromises[e]||(c.networkImagePromises[e]=r.ApiController._fetchNetworkImage(e)),await c.networkImagePromises[e],this.getNetworkImageById(e))},getWalletImageById(e){if(e)return n.state.walletImages[e]},getWalletImage:e=>e?.image_url?e?.image_url:e?.image_id?n.state.walletImages[e.image_id]:void 0,getNetworkImage:e=>e?.assets?.imageUrl?e?.assets?.imageUrl:e?.assets?.imageId?n.state.networkImages[e.assets.imageId]:void 0,getNetworkImageById(e){if(e)return n.state.networkImages[e]},getConnectorImage:e=>e?.imageUrl?e.imageUrl:e?.imageId?n.state.connectorImages[e.imageId]:void 0,getChainImage:e=>n.state.networkImages[s[e]]}},68119,e=>{"use strict";var t=e.i(20145);let r=(void 0!==t.default&&void 0!==t.default.env?t.default.env.NEXT_PUBLIC_SECURE_SITE_ORIGIN:void 0)||"https://secure.walletconnect.org",a={FOUR_MINUTES_MS:24e4,TEN_SEC_MS:1e4,FIVE_SEC_MS:5e3,THREE_SEC_MS:3e3,ONE_SEC_MS:1e3,SECURE_SITE:r,SECURE_SITE_DASHBOARD:`${r}/dashboard`,SECURE_SITE_FAVICON:`${r}/images/favicon.png`,RESTRICTED_TIMEZONES:["ASIA/SHANGHAI","ASIA/URUMQI","ASIA/CHONGQING","ASIA/HARBIN","ASIA/KASHGAR","ASIA/MACAU","ASIA/HONG_KONG","ASIA/MACAO","ASIA/BEIJING","ASIA/HARBIN"],WC_COINBASE_PAY_SDK_CHAINS:["ethereum","arbitrum","polygon","berachain","avalanche-c-chain","optimism","celo","base"],WC_COINBASE_PAY_SDK_FALLBACK_CHAIN:"ethereum",WC_COINBASE_PAY_SDK_CHAIN_NAME_MAP:{Ethereum:"ethereum","Arbitrum One":"arbitrum",Polygon:"polygon",Berachain:"berachain",Avalanche:"avalanche-c-chain","OP Mainnet":"optimism",Celo:"celo",Base:"base"},WC_COINBASE_ONRAMP_APP_ID:"bf18c88d-495a-463b-b249-0b9d3656cf5e",SWAP_SUGGESTED_TOKENS:["ETH","UNI","1INCH","AAVE","SOL","ADA","AVAX","DOT","LINK","NITRO","GAIA","MILK","TRX","NEAR","GNO","WBTC","DAI","WETH","USDC","USDT","ARB","BAL","BICO","CRV","ENS","MATIC","OP"],SWAP_POPULAR_TOKENS:["ETH","UNI","1INCH","AAVE","SOL","ADA","AVAX","DOT","LINK","NITRO","GAIA","MILK","TRX","NEAR","GNO","WBTC","DAI","WETH","USDC","USDT","ARB","BAL","BICO","CRV","ENS","MATIC","OP","METAL","DAI","CHAMP","WOLF","SALE","BAL","BUSD","MUST","BTCpx","ROUTE","HEX","WELT","amDAI","VSQ","VISION","AURUM","pSP","SNX","VC","LINK","CHP","amUSDT","SPHERE","FOX","GIDDY","GFC","OMEN","OX_OLD","DE","WNT"],BALANCE_SUPPORTED_CHAINS:["eip155","solana"],SWAP_SUPPORTED_NETWORKS:["eip155:1","eip155:42161","eip155:10","eip155:324","eip155:8453","eip155:56","eip155:137","eip155:100","eip155:43114","eip155:250","eip155:8217","eip155:1313161554"],NAMES_SUPPORTED_CHAIN_NAMESPACES:["eip155"],ONRAMP_SUPPORTED_CHAIN_NAMESPACES:["eip155","solana"],ACTIVITY_ENABLED_CHAIN_NAMESPACES:["eip155"],NATIVE_TOKEN_ADDRESS:{eip155:"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",solana:"So11111111111111111111111111111111111111111",polkadot:"0x",bip122:"0x",cosmos:"0x"},CONVERT_SLIPPAGE_TOLERANCE:1,CONNECT_LABELS:{MOBILE:"Open and continue in the wallet app",WEB:"Open and continue in the wallet app"},SEND_SUPPORTED_NAMESPACES:["eip155","solana"],DEFAULT_REMOTE_FEATURES:{swaps:["1inch"],onramp:["coinbase","meld"],email:!0,socials:["google","x","discord","farcaster","github","apple","facebook"],activity:!0,reownBranding:!0},DEFAULT_REMOTE_FEATURES_DISABLED:{email:!1,socials:!1,swaps:!1,onramp:!1,activity:!1,reownBranding:!1},DEFAULT_FEATURES:{receive:!0,send:!0,emailShowWallets:!0,connectorTypeOrder:["walletConnect","recent","injected","featured","custom","external","recommended"],analytics:!0,allWallets:!0,legalCheckbox:!1,smartSessions:!1,collapseWallets:!1,walletFeaturesOrder:["onramp","swaps","receive","send"],connectMethodsOrder:void 0,pay:!1},DEFAULT_SOCIALS:["google","x","farcaster","discord","apple","github","facebook"],DEFAULT_ACCOUNT_TYPES:{bip122:"payment",eip155:"smartAccount",polkadot:"eoa",solana:"eoa"},ADAPTER_TYPES:{UNIVERSAL:"universal",SOLANA:"solana",WAGMI:"wagmi",ETHERS:"ethers",ETHERS5:"ethers5",BITCOIN:"bitcoin"}};e.s(["ConstantsUtil",0,a,"MELD_PUBLIC_KEY",0,"WXETMuFUQmqqybHuRkSgxv:25B8LJHSfpG6LVjR2ytU5Cwh7Z4Sch2ocoU","ONRAMP_PROVIDERS",0,[{label:"Coinbase",name:"coinbase",feeRange:"1-2%",url:"",supportedChains:["eip155"]},{label:"Meld.io",name:"meld",feeRange:"1-2%",url:"https://meldcrypto.com",supportedChains:["eip155","solana"]}]])},97882,85947,53519,e=>{"use strict";var t=e.i(10861),r=e.i(68119);let a={WALLET_ID:"@appkit/wallet_id",WALLET_NAME:"@appkit/wallet_name",SOLANA_WALLET:"@appkit/solana_wallet",SOLANA_CAIP_CHAIN:"@appkit/solana_caip_chain",ACTIVE_CAIP_NETWORK_ID:"@appkit/active_caip_network_id",CONNECTED_SOCIAL:"@appkit/connected_social",CONNECTED_SOCIAL_USERNAME:"@appkit-wallet/SOCIAL_USERNAME",RECENT_WALLETS:"@appkit/recent_wallets",DEEPLINK_CHOICE:"WALLETCONNECT_DEEPLINK_CHOICE",ACTIVE_NAMESPACE:"@appkit/active_namespace",CONNECTED_NAMESPACES:"@appkit/connected_namespaces",CONNECTION_STATUS:"@appkit/connection_status",SIWX_AUTH_TOKEN:"@appkit/siwx-auth-token",SIWX_NONCE_TOKEN:"@appkit/siwx-nonce-token",TELEGRAM_SOCIAL_PROVIDER:"@appkit/social_provider",NATIVE_BALANCE_CACHE:"@appkit/native_balance_cache",PORTFOLIO_CACHE:"@appkit/portfolio_cache",ENS_CACHE:"@appkit/ens_cache",IDENTITY_CACHE:"@appkit/identity_cache",PREFERRED_ACCOUNT_TYPES:"@appkit/preferred_account_types",CONNECTIONS:"@appkit/connections"};function o(e){if(!e)throw Error("Namespace is required for CONNECTED_CONNECTOR_ID");return`@appkit/${e}:connected_connector_id`}let i={setItem(e,t){n()&&void 0!==t&&localStorage.setItem(e,t)},getItem(e){if(n())return localStorage.getItem(e)||void 0},removeItem(e){n()&&localStorage.removeItem(e)},clear(){n()&&localStorage.clear()}};function n(){return"u">typeof window&&"u">typeof localStorage}e.s(["SafeLocalStorage",0,i,"SafeLocalStorageKeys",0,a,"getSafeConnectorIdKey",0,o,"isSafe",0,n],85947);let s={cacheExpiry:{portfolio:3e4,nativeBalance:3e4,ens:3e5,identity:3e5},isCacheExpired:(e,t)=>Date.now()-e>t,getActiveNetworkProps(){let e=s.getActiveNamespace(),t=s.getActiveCaipNetworkId(),r=t?t.split(":")[1]:void 0;return{namespace:e,caipNetworkId:t,chainId:r?isNaN(Number(r))?r:Number(r):void 0}},setWalletConnectDeepLink({name:e,href:t}){try{i.setItem(a.DEEPLINK_CHOICE,JSON.stringify({href:t,name:e}))}catch{console.info("Unable to set WalletConnect deep link")}},getWalletConnectDeepLink(){try{let e=i.getItem(a.DEEPLINK_CHOICE);if(e)return JSON.parse(e)}catch{console.info("Unable to get WalletConnect deep link")}},deleteWalletConnectDeepLink(){try{i.removeItem(a.DEEPLINK_CHOICE)}catch{console.info("Unable to delete WalletConnect deep link")}},setActiveNamespace(e){try{i.setItem(a.ACTIVE_NAMESPACE,e)}catch{console.info("Unable to set active namespace")}},setActiveCaipNetworkId(e){try{i.setItem(a.ACTIVE_CAIP_NETWORK_ID,e),s.setActiveNamespace(e.split(":")[0])}catch{console.info("Unable to set active caip network id")}},getActiveCaipNetworkId(){try{return i.getItem(a.ACTIVE_CAIP_NETWORK_ID)}catch{console.info("Unable to get active caip network id");return}},deleteActiveCaipNetworkId(){try{i.removeItem(a.ACTIVE_CAIP_NETWORK_ID)}catch{console.info("Unable to delete active caip network id")}},deleteConnectedConnectorId(e){try{let t=o(e);i.removeItem(t)}catch{console.info("Unable to delete connected connector id")}},setAppKitRecent(e){try{let t=s.getRecentWallets();t.find(t=>t.id===e.id)||(t.unshift(e),t.length>2&&t.pop(),i.setItem(a.RECENT_WALLETS,JSON.stringify(t)))}catch{console.info("Unable to set AppKit recent")}},getRecentWallets(){try{let e=i.getItem(a.RECENT_WALLETS);return e?JSON.parse(e):[]}catch{console.info("Unable to get AppKit recent")}return[]},setConnectedConnectorId(e,t){try{let r=o(e);i.setItem(r,t)}catch{console.info("Unable to set Connected Connector Id")}},getActiveNamespace(){try{return i.getItem(a.ACTIVE_NAMESPACE)}catch{console.info("Unable to get active namespace")}},getConnectedConnectorId(e){if(e)try{let t=o(e);return i.getItem(t)}catch(t){console.info("Unable to get connected connector id in namespace ",e)}},setConnectedSocialProvider(e){try{i.setItem(a.CONNECTED_SOCIAL,e)}catch{console.info("Unable to set connected social provider")}},getConnectedSocialProvider(){try{return i.getItem(a.CONNECTED_SOCIAL)}catch{console.info("Unable to get connected social provider")}},deleteConnectedSocialProvider(){try{i.removeItem(a.CONNECTED_SOCIAL)}catch{console.info("Unable to delete connected social provider")}},getConnectedSocialUsername(){try{return i.getItem(a.CONNECTED_SOCIAL_USERNAME)}catch{console.info("Unable to get connected social username")}},getStoredActiveCaipNetworkId(){let e=i.getItem(a.ACTIVE_CAIP_NETWORK_ID);return e?.split(":")?.[1]},setConnectionStatus(e){try{i.setItem(a.CONNECTION_STATUS,e)}catch{console.info("Unable to set connection status")}},getConnectionStatus(){try{return i.getItem(a.CONNECTION_STATUS)}catch{return}},getConnectedNamespaces(){try{let e=i.getItem(a.CONNECTED_NAMESPACES);if(!e?.length)return[];return e.split(",")}catch{return[]}},setConnectedNamespaces(e){try{let t=Array.from(new Set(e));i.setItem(a.CONNECTED_NAMESPACES,t.join(","))}catch{console.info("Unable to set namespaces in storage")}},addConnectedNamespace(e){try{let t=s.getConnectedNamespaces();t.includes(e)||(t.push(e),s.setConnectedNamespaces(t))}catch{console.info("Unable to add connected namespace")}},removeConnectedNamespace(e){try{let t=s.getConnectedNamespaces(),r=t.indexOf(e);r>-1&&(t.splice(r,1),s.setConnectedNamespaces(t))}catch{console.info("Unable to remove connected namespace")}},getTelegramSocialProvider(){try{return i.getItem(a.TELEGRAM_SOCIAL_PROVIDER)}catch{return console.info("Unable to get telegram social provider"),null}},setTelegramSocialProvider(e){try{i.setItem(a.TELEGRAM_SOCIAL_PROVIDER,e)}catch{console.info("Unable to set telegram social provider")}},removeTelegramSocialProvider(){try{i.removeItem(a.TELEGRAM_SOCIAL_PROVIDER)}catch{console.info("Unable to remove telegram social provider")}},getBalanceCache(){let e={};try{let t=i.getItem(a.PORTFOLIO_CACHE);e=t?JSON.parse(t):{}}catch{console.info("Unable to get balance cache")}return e},removeAddressFromBalanceCache(e){try{let t=s.getBalanceCache();i.setItem(a.PORTFOLIO_CACHE,JSON.stringify({...t,[e]:void 0}))}catch{console.info("Unable to remove address from balance cache",e)}},getBalanceCacheForCaipAddress(e){try{let t=s.getBalanceCache()[e];if(t&&!this.isCacheExpired(t.timestamp,this.cacheExpiry.portfolio))return t.balance;s.removeAddressFromBalanceCache(e)}catch{console.info("Unable to get balance cache for address",e)}},updateBalanceCache(e){try{let t=s.getBalanceCache();t[e.caipAddress]=e,i.setItem(a.PORTFOLIO_CACHE,JSON.stringify(t))}catch{console.info("Unable to update balance cache",e)}},getNativeBalanceCache(){let e={};try{let t=i.getItem(a.NATIVE_BALANCE_CACHE);e=t?JSON.parse(t):{}}catch{console.info("Unable to get balance cache")}return e},removeAddressFromNativeBalanceCache(e){try{let t=s.getBalanceCache();i.setItem(a.NATIVE_BALANCE_CACHE,JSON.stringify({...t,[e]:void 0}))}catch{console.info("Unable to remove address from balance cache",e)}},getNativeBalanceCacheForCaipAddress(e){try{let t=s.getNativeBalanceCache()[e];if(t&&!this.isCacheExpired(t.timestamp,this.cacheExpiry.nativeBalance))return t;console.info("Discarding cache for address",e),s.removeAddressFromBalanceCache(e)}catch{console.info("Unable to get balance cache for address",e)}},updateNativeBalanceCache(e){try{let t=s.getNativeBalanceCache();t[e.caipAddress]=e,i.setItem(a.NATIVE_BALANCE_CACHE,JSON.stringify(t))}catch{console.info("Unable to update balance cache",e)}},getEnsCache(){let e={};try{let t=i.getItem(a.ENS_CACHE);e=t?JSON.parse(t):{}}catch{console.info("Unable to get ens name cache")}return e},getEnsFromCacheForAddress(e){try{let t=s.getEnsCache()[e];if(t&&!this.isCacheExpired(t.timestamp,this.cacheExpiry.ens))return t.ens;s.removeEnsFromCache(e)}catch{console.info("Unable to get ens name from cache",e)}},updateEnsCache(e){try{let t=s.getEnsCache();t[e.address]=e,i.setItem(a.ENS_CACHE,JSON.stringify(t))}catch{console.info("Unable to update ens name cache",e)}},removeEnsFromCache(e){try{let t=s.getEnsCache();i.setItem(a.ENS_CACHE,JSON.stringify({...t,[e]:void 0}))}catch{console.info("Unable to remove ens name from cache",e)}},getIdentityCache(){let e={};try{let t=i.getItem(a.IDENTITY_CACHE);e=t?JSON.parse(t):{}}catch{console.info("Unable to get identity cache")}return e},getIdentityFromCacheForAddress(e){try{let t=s.getIdentityCache()[e];if(t&&!this.isCacheExpired(t.timestamp,this.cacheExpiry.identity))return t.identity;s.removeIdentityFromCache(e)}catch{console.info("Unable to get identity from cache",e)}},updateIdentityCache(e){try{let t=s.getIdentityCache();t[e.address]={identity:e.identity,timestamp:e.timestamp},i.setItem(a.IDENTITY_CACHE,JSON.stringify(t))}catch{console.info("Unable to update identity cache",e)}},removeIdentityFromCache(e){try{let t=s.getIdentityCache();i.setItem(a.IDENTITY_CACHE,JSON.stringify({...t,[e]:void 0}))}catch{console.info("Unable to remove identity from cache",e)}},clearAddressCache(){try{i.removeItem(a.PORTFOLIO_CACHE),i.removeItem(a.NATIVE_BALANCE_CACHE),i.removeItem(a.ENS_CACHE),i.removeItem(a.IDENTITY_CACHE)}catch{console.info("Unable to clear address cache")}},setPreferredAccountTypes(e){try{i.setItem(a.PREFERRED_ACCOUNT_TYPES,JSON.stringify(e))}catch{console.info("Unable to set preferred account types",e)}},getPreferredAccountTypes(){try{let e=i.getItem(a.PREFERRED_ACCOUNT_TYPES);if(!e)return{};return JSON.parse(e)}catch{console.info("Unable to get preferred account types")}return{}},setConnections(e,t){try{let r={...s.getConnections(),[t]:e};i.setItem(a.CONNECTIONS,JSON.stringify(r))}catch(e){console.error("Unable to sync connections to storage",e)}},getConnections(){try{let e=i.getItem(a.CONNECTIONS);if(!e)return{};return JSON.parse(e)}catch(e){return console.error("Unable to get connections from storage",e),{}}}};e.s(["StorageUtil",0,s],53519);let c={isMobile(){return!!this.isClient()&&!!("function"==typeof window?.matchMedia&&window?.matchMedia("(pointer:coarse)")?.matches||/Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/u.test(navigator.userAgent))},checkCaipNetwork:(e,t="")=>e?.caipNetworkId.toLocaleLowerCase().includes(t.toLowerCase()),isAndroid(){if(!this.isMobile())return!1;let e=window?.navigator.userAgent.toLowerCase();return c.isMobile()&&e.includes("android")},isIos(){if(!this.isMobile())return!1;let e=window?.navigator.userAgent.toLowerCase();return e.includes("iphone")||e.includes("ipad")},isSafari(){return!!this.isClient()&&(window?.navigator.userAgent.toLowerCase()).includes("safari")},isClient:()=>"u">typeof window,isPairingExpired:e=>!e||e-Date.now()<=r.ConstantsUtil.TEN_SEC_MS,isAllowedRetry:(e,t=r.ConstantsUtil.ONE_SEC_MS)=>Date.now()-e>=t,copyToClopboard(e){navigator.clipboard.writeText(e)},isIframe(){try{return window?.self!==window?.top}catch(e){return!1}},isSafeApp(){if(c.isClient()&&window.self!==window.top)try{let e=window?.location?.ancestorOrigins?.[0];if(e){let t=new URL(e),r=new URL("https://app.safe.global");return t.hostname===r.hostname}}catch{}return!1},getPairingExpiry:()=>Date.now()+r.ConstantsUtil.FOUR_MINUTES_MS,getNetworkId:e=>e?.split(":")[1],getPlainAddress:e=>e?.split(":")[2],wait:async e=>new Promise(t=>{setTimeout(t,e)}),debounce(e,t=500){let r;return(...a)=>{r&&clearTimeout(r),r=setTimeout(function(){e(...a)},t)}},isHttpUrl:e=>e.startsWith("http://")||e.startsWith("https://"),formatNativeUrl(e,t,r=null){if(c.isHttpUrl(e))return this.formatUniversalUrl(e,t);let a=e,o=r;a.includes("://")||(a=e.replaceAll("/","").replaceAll(":",""),a=`${a}://`),a.endsWith("/")||(a=`${a}/`),o&&!o?.endsWith("/")&&(o=`${o}/`),this.isTelegram()&&this.isAndroid()&&(t=encodeURIComponent(t));let i=encodeURIComponent(t);return{redirect:`${a}wc?uri=${i}`,redirectUniversalLink:o?`${o}wc?uri=${i}`:void 0,href:a}},formatUniversalUrl(e,t){if(!c.isHttpUrl(e))return this.formatNativeUrl(e,t);let r=e;r.endsWith("/")||(r=`${r}/`);let a=encodeURIComponent(t);return{redirect:`${r}wc?uri=${a}`,href:r}},getOpenTargetForPlatform(e){return"popupWindow"===e?e:this.isTelegram()?s.getTelegramSocialProvider()?"_top":"_blank":e},openHref(e,t,r){window?.open(e,this.getOpenTargetForPlatform(t),r||"noreferrer noopener")},returnOpenHref(e,t,r){return window?.open(e,this.getOpenTargetForPlatform(t),r||"noreferrer noopener")},isTelegram:()=>"u">typeof window&&(!!window.TelegramWebviewProxy||!!window.Telegram||!!window.TelegramWebviewProxyProto),isPWA(){if("u"<typeof window)return!1;let e=window.matchMedia?.("(display-mode: standalone)")?.matches,t=window?.navigator?.standalone;return!!(e||t)},preloadImage:async e=>Promise.race([new Promise((t,r)=>{let a=new Image;a.onload=t,a.onerror=r,a.crossOrigin="anonymous",a.src=e}),c.wait(2e3)]),formatBalance(e,t){let r="0.000";if("string"==typeof e){let t=Number(e);if(t){let e=Math.floor(1e3*t)/1e3;e&&(r=e.toString())}}return`${r}${t?` ${t}`:""}`},formatBalance2(e,t){let r;if("0"===e)r="0";else if("string"==typeof e){let t=Number(e);t&&(r=t.toString().match(/^-?\d+(?:\.\d{0,3})?/u)?.[0])}return{value:r??"0",rest:"0"===r?"000":"",symbol:t}},getApiUrl:()=>t.ConstantsUtil.W3M_API_URL,getBlockchainApiUrl:()=>t.ConstantsUtil.BLOCKCHAIN_API_RPC_URL,getAnalyticsUrl:()=>t.ConstantsUtil.PULSE_API_URL,getUUID:()=>crypto?.randomUUID?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/gu,e=>{let t=16*Math.random()|0;return("x"===e?t:3&t|8).toString(16)}),parseError:e=>"string"==typeof e?e:"string"==typeof e?.issues?.[0]?.message?e.issues[0].message:e instanceof Error?e.message:"Unknown error",sortRequestedNetworks(e,t=[]){let r={};return t&&e&&(e.forEach((e,t)=>{r[e]=t}),t.sort((e,t)=>{let a=r[e.id],o=r[t.id];return void 0!==a&&void 0!==o?a-o:void 0!==a?-1:1*(void 0!==o)})),t},calculateBalance(e){let t=0;for(let r of e)t+=r.value??0;return t},formatTokenBalance(e){let[t,r]=e.toFixed(2).split(".");return{dollars:t,pennies:r}},isAddress(e,t="eip155"){switch(t){case"eip155":if(/^(?:0x)?[0-9a-f]{40}$/iu.test(e)&&(/^(?:0x)?[0-9a-f]{40}$/iu.test(e)||/^(?:0x)?[0-9A-F]{40}$/iu.test(e)))return!0;return!1;case"solana":return/[1-9A-HJ-NP-Za-km-z]{32,44}$/iu.test(e);default:return!1}},uniqueBy(e,t){let r=new Set;return e.filter(e=>{let a=e[t];return!r.has(a)&&(r.add(a),!0)})},generateSdkVersion(e,t,a){let o=0===e.length?r.ConstantsUtil.ADAPTER_TYPES.UNIVERSAL:e.map(e=>e.adapterType).join(",");return`${t}-${o}-${a}`},createAccount:(e,t,r,a,o)=>({namespace:e,address:t,type:r,publicKey:a,path:o}),isCaipAddress(e){if("string"!=typeof e)return!1;let r=e.split(":"),a=r[0];return 3===r.filter(Boolean).length&&a in t.ConstantsUtil.CHAIN_NAME_MAP},isMac(){let e=window?.navigator.userAgent.toLowerCase();return e.includes("macintosh")&&!e.includes("safari")},formatTelegramSocialLoginUrl(e){let t=`--${encodeURIComponent(window?.location.href)}`,r="state=";if("auth.magic.link"===new URL(e).host){let a="provider_authorization_url=",o=e.substring(e.indexOf(a)+a.length),i=this.injectIntoUrl(decodeURIComponent(o),r,t);return e.replace(o,encodeURIComponent(i))}return this.injectIntoUrl(e,r,t)},injectIntoUrl(e,t,r){let a=e.indexOf(t);if(-1===a)throw Error(`${t} parameter not found in the URL: ${e}`);let o=e.indexOf("&",a),i=t.length,n=-1!==o?o:e.length;return e.substring(0,a+i)+(e.substring(a+i,n)+r)+e.substring(o)}};e.s(["CoreHelperUtil",0,c],97882)},93400,e=>{"use strict";var t=e.i(10861);let r={PHANTOM:{id:"a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393",url:"https://phantom.app"},SOLFLARE:{id:"1ca0bdd4747578705b1939af023d120677c64fe6ca76add81fda36e350605e79",url:"https://solflare.com"},COINBASE:{id:"fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa",url:"https://go.cb-w.com"}};e.s(["CUSTOM_DEEPLINK_WALLETS",0,r,"MobileWalletUtil",0,{handleMobileDeeplinkRedirect(e,a){let o=window.location.href,i=encodeURIComponent(o);if(e===r.PHANTOM.id&&!("phantom"in window)){let e=o.startsWith("https")?"https":"http",t=o.split("/")[2],a=encodeURIComponent(`${e}://${t}`);window.location.href=`${r.PHANTOM.url}/ul/browse/${i}?ref=${a}`}e!==r.SOLFLARE.id||"solflare"in window||(window.location.href=`${r.SOLFLARE.url}/ul/v1/browse/${i}?ref=${i}`),a!==t.ConstantsUtil.CHAIN.SOLANA||e!==r.COINBASE.id||"coinbaseSolana"in window||(window.location.href=`${r.COINBASE.url}/dapp?cb_url=${i}`)}}])},66484,e=>{"use strict";e.s(["NetworkUtil",()=>n]);var t=e.i(10861),r=e.i(1945),a=e.i(55920),o=e.i(68761),i=e.i(89344);let n={onSwitchNetwork({network:e,ignoreSwitchConfirmation:n=!1}){let s=a.ChainController.state.activeCaipNetwork,c=i.RouterController.state.data;if(e.id===s?.id)return;let l=r.AccountController.getCaipAddress(a.ChainController.state.activeChain),u=e.chainNamespace!==a.ChainController.state.activeChain,d=r.AccountController.getCaipAddress(e.chainNamespace),p=o.ConnectorController.getConnectorId(a.ChainController.state.activeChain)===t.ConstantsUtil.CONNECTOR_ID.AUTH,w=t.ConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(t=>t===e.chainNamespace);n||p&&w?i.RouterController.push("SwitchNetwork",{...c,network:e}):l&&u&&!d?i.RouterController.push("SwitchActiveChain",{switchToChain:e.chainNamespace,navigateTo:"Connect",navigateWithReplace:!0,network:e}):i.RouterController.push("SwitchNetwork",{...c,network:e})}}},51351,66296,12906,e=>{"use strict";var t=e.i(20464),r=e.i(35126),a=e.i(97882);async function o(...e){let t=await fetch(...e);if(!t.ok)throw Error(`HTTP status code: ${t.status}`,{cause:t});return t}class i{constructor({baseUrl:e,clientId:t}){this.baseUrl=e,this.clientId=t}async get({headers:e,signal:t,cache:r,...a}){let i=this.createUrl(a);return(await o(i,{method:"GET",headers:e,signal:t,cache:r})).json()}async getBlob({headers:e,signal:t,...r}){let a=this.createUrl(r);return(await o(a,{method:"GET",headers:e,signal:t})).blob()}async post({body:e,headers:t,signal:r,...a}){let i=this.createUrl(a);return(await o(i,{method:"POST",headers:t,body:e?JSON.stringify(e):void 0,signal:r})).json()}async put({body:e,headers:t,signal:r,...a}){let i=this.createUrl(a);return(await o(i,{method:"PUT",headers:t,body:e?JSON.stringify(e):void 0,signal:r})).json()}async delete({body:e,headers:t,signal:r,...a}){let i=this.createUrl(a);return(await o(i,{method:"DELETE",headers:t,body:e?JSON.stringify(e):void 0,signal:r})).json()}createUrl({path:e,params:t}){let r=new URL(e,this.baseUrl);return t&&Object.entries(t).forEach(([e,t])=>{t&&r.searchParams.append(e,t)}),this.clientId&&r.searchParams.append("clientId",this.clientId),r}}e.s(["FetchUtil",0,i],66296);var n=e.i(68119);let s={getFeatureValue(e,t){let r=t?.[e];return void 0===r?n.ConstantsUtil.DEFAULT_FEATURES[e]:r},filterSocialsByPlatform(e){if(!e||!e.length)return e;if(a.CoreHelperUtil.isTelegram()){if(a.CoreHelperUtil.isIos())return e.filter(e=>"google"!==e);if(a.CoreHelperUtil.isMac())return e.filter(e=>"x"!==e);if(a.CoreHelperUtil.isAndroid())return e.filter(e=>!["facebook","x"].includes(e))}return e}},c=(0,t.proxy)({features:n.ConstantsUtil.DEFAULT_FEATURES,projectId:"",sdkType:"appkit",sdkVersion:"html-wagmi-undefined",defaultAccountTypes:n.ConstantsUtil.DEFAULT_ACCOUNT_TYPES,enableNetworkSwitch:!0,experimental_preferUniversalLinks:!1,remoteFeatures:{}}),l={state:c,subscribeKey:(e,t)=>(0,r.subscribeKey)(c,e,t),setOptions(e){Object.assign(c,e)},setRemoteFeatures(e){if(!e)return;let t={...c.remoteFeatures,...e};c.remoteFeatures=t,c.remoteFeatures?.socials&&(c.remoteFeatures.socials=s.filterSocialsByPlatform(c.remoteFeatures.socials))},setFeatures(e){if(!e)return;c.features||(c.features=n.ConstantsUtil.DEFAULT_FEATURES);let t={...c.features,...e};c.features=t},setProjectId(e){c.projectId=e},setCustomRpcUrls(e){c.customRpcUrls=e},setAllWallets(e){c.allWallets=e},setIncludeWalletIds(e){c.includeWalletIds=e},setExcludeWalletIds(e){c.excludeWalletIds=e},setFeaturedWalletIds(e){c.featuredWalletIds=e},setTokens(e){c.tokens=e},setTermsConditionsUrl(e){c.termsConditionsUrl=e},setPrivacyPolicyUrl(e){c.privacyPolicyUrl=e},setCustomWallets(e){c.customWallets=e},setIsSiweEnabled(e){c.isSiweEnabled=e},setIsUniversalProvider(e){c.isUniversalProvider=e},setSdkVersion(e){c.sdkVersion=e},setMetadata(e){c.metadata=e},setDisableAppend(e){c.disableAppend=e},setEIP6963Enabled(e){c.enableEIP6963=e},setDebug(e){c.debug=e},setEnableWalletConnect(e){c.enableWalletConnect=e},setEnableWalletGuide(e){c.enableWalletGuide=e},setEnableAuthLogger(e){c.enableAuthLogger=e},setEnableWallets(e){c.enableWallets=e},setPreferUniversalLinks(e){c.experimental_preferUniversalLinks=e},setHasMultipleAddresses(e){c.hasMultipleAddresses=e},setSIWX(e){c.siwx=e},setConnectMethodsOrder(e){c.features={...c.features,connectMethodsOrder:e}},setWalletFeaturesOrder(e){c.features={...c.features,walletFeaturesOrder:e}},setSocialsOrder(e){c.remoteFeatures={...c.remoteFeatures,socials:e}},setCollapseWallets(e){c.features={...c.features,collapseWallets:e}},setEnableEmbedded(e){c.enableEmbedded=e},setAllowUnsupportedChain(e){c.allowUnsupportedChain=e},setManualWCControl(e){c.manualWCControl=e},setEnableNetworkSwitch(e){c.enableNetworkSwitch=e},setDefaultAccountTypes(e={}){Object.entries(e).forEach(([e,t])=>{t&&(c.defaultAccountTypes[e]=t)})},setUniversalProviderConfigOverride(e){c.universalProviderConfigOverride=e},getUniversalProviderConfigOverride:()=>c.universalProviderConfigOverride,getSnapshot:()=>(0,t.snapshot)(c)};e.s(["OptionsController",0,l],12906);let u=Object.freeze({enabled:!0,events:[]}),d=new i({baseUrl:a.CoreHelperUtil.getAnalyticsUrl(),clientId:null}),p=(0,t.proxy)({...u}),w={state:p,subscribeKey:(e,t)=>(0,r.subscribeKey)(p,e,t),async sendError(e,t){if(!p.enabled)return;let r=Date.now();if(p.events.filter(e=>r-new Date(e.properties.timestamp||"").getTime()<6e4).length>=5)return;let o={type:"error",event:t,properties:{errorType:e.name,errorMessage:e.message,stackTrace:e.stack,timestamp:new Date().toISOString()}};p.events.push(o);try{if("u"<typeof window)return;let{projectId:r,sdkType:o,sdkVersion:i}=l.state;await d.post({path:"/e",params:{projectId:r,st:o,sv:i||"html-wagmi-4.2.2"},body:{eventId:a.CoreHelperUtil.getUUID(),url:window.location.href,domain:window.location.hostname,timestamp:new Date().toISOString(),props:{type:"error",event:t,errorType:e.name,errorMessage:e.message,stackTrace:e.stack}}})}catch{}},enable(){p.enabled=!0},disable(){p.enabled=!1},clearEvents(){p.events=[]}};class g extends Error{constructor(e,t,r){super(e),this.name="AppKitError",this.category=t,this.originalError=r,Object.setPrototypeOf(this,g.prototype);let a=!1;if(r instanceof Error&&"string"==typeof r.stack&&r.stack){const e=r.stack,t=e.indexOf("\n");if(t>-1){const r=e.substring(t+1);this.stack=`${this.name}: ${this.message}
${r}`,a=!0}}!a&&(Error.captureStackTrace?Error.captureStackTrace(this,g):this.stack||(this.stack=`${this.name}: ${this.message}`))}}function m(e,t){let r=e instanceof g?e:new g(e instanceof Error?e.message:String(e),t,e);throw w.sendError(r,r.category),r}e.s(["AppKitError",0,g,"withErrorBoundary",0,function(e,t="INTERNAL_SDK_ERROR"){let r={};return Object.keys(e).forEach(a=>{let o=e[a];if("function"==typeof o){let e=o;e="AsyncFunction"===o.constructor.name?async(...e)=>{try{return await o(...e)}catch(e){return m(e,t)}}:(...e)=>{try{return o(...e)}catch(e){return m(e,t)}},r[a]=e}else r[a]=o}),r}],51351)},10942,e=>{"use strict";var t=e.i(20145);let r={ACCOUNT_TABS:[{label:"Tokens"},{label:"NFTs"},{label:"Activity"}],SECURE_SITE_ORIGIN:(void 0!==t.default&&void 0!==t.default.env?t.default.env.NEXT_PUBLIC_SECURE_SITE_ORIGIN:void 0)||"https://secure.walletconnect.org",VIEW_DIRECTION:{Next:"next",Prev:"prev"},DEFAULT_CONNECT_METHOD_ORDER:["email","social","wallet"],ANIMATION_DURATIONS:{HeaderText:120,ModalHeight:150,ViewTransition:150}};e.s(["ConstantsUtil",0,r])},51203,30333,e=>{"use strict";let t,r,a;e.i(95126);var o=e.i(40697),i=e.i(40368);function n(e){r&&a&&("light"===e?(r.removeAttribute("media"),a.media="enabled"):(a.removeAttribute("media"),r.media="enabled"))}function s(e){return{core:o.css`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      @keyframes w3m-shake {
        0% {
          transform: scale(1) rotate(0deg);
        }
        20% {
          transform: scale(1) rotate(-1deg);
        }
        40% {
          transform: scale(1) rotate(1.5deg);
        }
        60% {
          transform: scale(1) rotate(-1.5deg);
        }
        80% {
          transform: scale(1) rotate(1deg);
        }
        100% {
          transform: scale(1) rotate(0deg);
        }
      }
      @keyframes w3m-iframe-fade-out {
        0% {
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
      }
      @keyframes w3m-iframe-zoom-in {
        0% {
          transform: translateY(50px);
          opacity: 0;
        }
        100% {
          transform: translateY(0px);
          opacity: 1;
        }
      }
      @keyframes w3m-iframe-zoom-in-mobile {
        0% {
          transform: scale(0.95);
          opacity: 0;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
      :root {
        --w3m-modal-width: 360px;
        --w3m-color-mix-strength: ${(0,o.unsafeCSS)(e?.["--w3m-color-mix-strength"]?`${e["--w3m-color-mix-strength"]}%`:"0%")};
        --w3m-font-family: ${(0,o.unsafeCSS)(e?.["--w3m-font-family"]||"Inter, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;")};
        --w3m-font-size-master: ${(0,o.unsafeCSS)(e?.["--w3m-font-size-master"]||"10px")};
        --w3m-border-radius-master: ${(0,o.unsafeCSS)(e?.["--w3m-border-radius-master"]||"4px")};
        --w3m-z-index: ${(0,o.unsafeCSS)(e?.["--w3m-z-index"]||999)};

        --wui-font-family: var(--w3m-font-family);

        --wui-font-size-mini: calc(var(--w3m-font-size-master) * 0.8);
        --wui-font-size-micro: var(--w3m-font-size-master);
        --wui-font-size-tiny: calc(var(--w3m-font-size-master) * 1.2);
        --wui-font-size-small: calc(var(--w3m-font-size-master) * 1.4);
        --wui-font-size-paragraph: calc(var(--w3m-font-size-master) * 1.6);
        --wui-font-size-medium: calc(var(--w3m-font-size-master) * 1.8);
        --wui-font-size-large: calc(var(--w3m-font-size-master) * 2);
        --wui-font-size-title-6: calc(var(--w3m-font-size-master) * 2.2);
        --wui-font-size-medium-title: calc(var(--w3m-font-size-master) * 2.4);
        --wui-font-size-2xl: calc(var(--w3m-font-size-master) * 4);

        --wui-border-radius-5xs: var(--w3m-border-radius-master);
        --wui-border-radius-4xs: calc(var(--w3m-border-radius-master) * 1.5);
        --wui-border-radius-3xs: calc(var(--w3m-border-radius-master) * 2);
        --wui-border-radius-xxs: calc(var(--w3m-border-radius-master) * 3);
        --wui-border-radius-xs: calc(var(--w3m-border-radius-master) * 4);
        --wui-border-radius-s: calc(var(--w3m-border-radius-master) * 5);
        --wui-border-radius-m: calc(var(--w3m-border-radius-master) * 7);
        --wui-border-radius-l: calc(var(--w3m-border-radius-master) * 9);
        --wui-border-radius-3xl: calc(var(--w3m-border-radius-master) * 20);

        --wui-font-weight-light: 400;
        --wui-font-weight-regular: 500;
        --wui-font-weight-medium: 600;
        --wui-font-weight-bold: 700;

        --wui-letter-spacing-2xl: -1.6px;
        --wui-letter-spacing-medium-title: -0.96px;
        --wui-letter-spacing-title-6: -0.88px;
        --wui-letter-spacing-large: -0.8px;
        --wui-letter-spacing-medium: -0.72px;
        --wui-letter-spacing-paragraph: -0.64px;
        --wui-letter-spacing-small: -0.56px;
        --wui-letter-spacing-tiny: -0.48px;
        --wui-letter-spacing-micro: -0.2px;
        --wui-letter-spacing-mini: -0.16px;

        --wui-spacing-0: 0px;
        --wui-spacing-4xs: 2px;
        --wui-spacing-3xs: 4px;
        --wui-spacing-xxs: 6px;
        --wui-spacing-2xs: 7px;
        --wui-spacing-xs: 8px;
        --wui-spacing-1xs: 10px;
        --wui-spacing-s: 12px;
        --wui-spacing-m: 14px;
        --wui-spacing-l: 16px;
        --wui-spacing-2l: 18px;
        --wui-spacing-xl: 20px;
        --wui-spacing-xxl: 24px;
        --wui-spacing-2xl: 32px;
        --wui-spacing-3xl: 40px;
        --wui-spacing-4xl: 90px;
        --wui-spacing-5xl: 95px;

        --wui-icon-box-size-xxs: 14px;
        --wui-icon-box-size-xs: 20px;
        --wui-icon-box-size-sm: 24px;
        --wui-icon-box-size-md: 32px;
        --wui-icon-box-size-mdl: 36px;
        --wui-icon-box-size-lg: 40px;
        --wui-icon-box-size-2lg: 48px;
        --wui-icon-box-size-xl: 64px;

        --wui-icon-size-inherit: inherit;
        --wui-icon-size-xxs: 10px;
        --wui-icon-size-xs: 12px;
        --wui-icon-size-sm: 14px;
        --wui-icon-size-md: 16px;
        --wui-icon-size-mdl: 18px;
        --wui-icon-size-lg: 20px;
        --wui-icon-size-xl: 24px;
        --wui-icon-size-xxl: 28px;

        --wui-wallet-image-size-inherit: inherit;
        --wui-wallet-image-size-sm: 40px;
        --wui-wallet-image-size-md: 56px;
        --wui-wallet-image-size-lg: 80px;

        --wui-visual-size-size-inherit: inherit;
        --wui-visual-size-sm: 40px;
        --wui-visual-size-md: 55px;
        --wui-visual-size-lg: 80px;

        --wui-box-size-md: 100px;
        --wui-box-size-lg: 120px;

        --wui-ease-out-power-2: cubic-bezier(0, 0, 0.22, 1);
        --wui-ease-out-power-1: cubic-bezier(0, 0, 0.55, 1);

        --wui-ease-in-power-3: cubic-bezier(0.66, 0, 1, 1);
        --wui-ease-in-power-2: cubic-bezier(0.45, 0, 1, 1);
        --wui-ease-in-power-1: cubic-bezier(0.3, 0, 1, 1);

        --wui-ease-inout-power-1: cubic-bezier(0.45, 0, 0.55, 1);

        --wui-duration-lg: 200ms;
        --wui-duration-md: 125ms;
        --wui-duration-sm: 75ms;

        --wui-path-network-sm: path(
          'M15.4 2.1a5.21 5.21 0 0 1 5.2 0l11.61 6.7a5.21 5.21 0 0 1 2.61 4.52v13.4c0 1.87-1 3.59-2.6 4.52l-11.61 6.7c-1.62.93-3.6.93-5.22 0l-11.6-6.7a5.21 5.21 0 0 1-2.61-4.51v-13.4c0-1.87 1-3.6 2.6-4.52L15.4 2.1Z'
        );

        --wui-path-network-md: path(
          'M43.4605 10.7248L28.0485 1.61089C25.5438 0.129705 22.4562 0.129705 19.9515 1.61088L4.53951 10.7248C2.03626 12.2051 0.5 14.9365 0.5 17.886V36.1139C0.5 39.0635 2.03626 41.7949 4.53951 43.2752L19.9515 52.3891C22.4562 53.8703 25.5438 53.8703 28.0485 52.3891L43.4605 43.2752C45.9637 41.7949 47.5 39.0635 47.5 36.114V17.8861C47.5 14.9365 45.9637 12.2051 43.4605 10.7248Z'
        );

        --wui-path-network-lg: path(
          'M78.3244 18.926L50.1808 2.45078C45.7376 -0.150261 40.2624 -0.150262 35.8192 2.45078L7.6756 18.926C3.23322 21.5266 0.5 26.3301 0.5 31.5248V64.4752C0.5 69.6699 3.23322 74.4734 7.6756 77.074L35.8192 93.5492C40.2624 96.1503 45.7376 96.1503 50.1808 93.5492L78.3244 77.074C82.7668 74.4734 85.5 69.6699 85.5 64.4752V31.5248C85.5 26.3301 82.7668 21.5266 78.3244 18.926Z'
        );

        --wui-width-network-sm: 36px;
        --wui-width-network-md: 48px;
        --wui-width-network-lg: 86px;

        --wui-height-network-sm: 40px;
        --wui-height-network-md: 54px;
        --wui-height-network-lg: 96px;

        --wui-icon-size-network-xs: 12px;
        --wui-icon-size-network-sm: 16px;
        --wui-icon-size-network-md: 24px;
        --wui-icon-size-network-lg: 42px;

        --wui-color-inherit: inherit;

        --wui-color-inverse-100: #fff;
        --wui-color-inverse-000: #000;

        --wui-cover: rgba(20, 20, 20, 0.8);

        --wui-color-modal-bg: var(--wui-color-modal-bg-base);

        --wui-color-accent-100: var(--wui-color-accent-base-100);
        --wui-color-accent-090: var(--wui-color-accent-base-090);
        --wui-color-accent-080: var(--wui-color-accent-base-080);

        --wui-color-success-100: var(--wui-color-success-base-100);
        --wui-color-success-125: var(--wui-color-success-base-125);

        --wui-color-warning-100: var(--wui-color-warning-base-100);

        --wui-color-error-100: var(--wui-color-error-base-100);
        --wui-color-error-125: var(--wui-color-error-base-125);

        --wui-color-blue-100: var(--wui-color-blue-base-100);
        --wui-color-blue-90: var(--wui-color-blue-base-90);

        --wui-icon-box-bg-error-100: var(--wui-icon-box-bg-error-base-100);
        --wui-icon-box-bg-blue-100: var(--wui-icon-box-bg-blue-base-100);
        --wui-icon-box-bg-success-100: var(--wui-icon-box-bg-success-base-100);
        --wui-icon-box-bg-inverse-100: var(--wui-icon-box-bg-inverse-base-100);

        --wui-all-wallets-bg-100: var(--wui-all-wallets-bg-100);

        --wui-avatar-border: var(--wui-avatar-border-base);

        --wui-thumbnail-border: var(--wui-thumbnail-border-base);

        --wui-wallet-button-bg: var(--wui-wallet-button-bg-base);

        --wui-box-shadow-blue: var(--wui-color-accent-glass-020);
      }

      @supports (background: color-mix(in srgb, white 50%, black)) {
        :root {
          --wui-color-modal-bg: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-modal-bg-base)
          );

          --wui-box-shadow-blue: color-mix(in srgb, var(--wui-color-accent-100) 20%, transparent);

          --wui-color-accent-100: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 100%,
            transparent
          );
          --wui-color-accent-090: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 90%,
            transparent
          );
          --wui-color-accent-080: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 80%,
            transparent
          );
          --wui-color-accent-glass-090: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 90%,
            transparent
          );
          --wui-color-accent-glass-080: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 80%,
            transparent
          );
          --wui-color-accent-glass-020: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 20%,
            transparent
          );
          --wui-color-accent-glass-015: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 15%,
            transparent
          );
          --wui-color-accent-glass-010: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 10%,
            transparent
          );
          --wui-color-accent-glass-005: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 5%,
            transparent
          );
          --wui-color-accent-002: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 2%,
            transparent
          );

          --wui-color-fg-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-100)
          );
          --wui-color-fg-125: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-125)
          );
          --wui-color-fg-150: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-150)
          );
          --wui-color-fg-175: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-175)
          );
          --wui-color-fg-200: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-200)
          );
          --wui-color-fg-225: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-225)
          );
          --wui-color-fg-250: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-250)
          );
          --wui-color-fg-275: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-275)
          );
          --wui-color-fg-300: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-300)
          );
          --wui-color-fg-325: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-325)
          );
          --wui-color-fg-350: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-350)
          );

          --wui-color-bg-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-100)
          );
          --wui-color-bg-125: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-125)
          );
          --wui-color-bg-150: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-150)
          );
          --wui-color-bg-175: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-175)
          );
          --wui-color-bg-200: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-200)
          );
          --wui-color-bg-225: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-225)
          );
          --wui-color-bg-250: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-250)
          );
          --wui-color-bg-275: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-275)
          );
          --wui-color-bg-300: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-300)
          );
          --wui-color-bg-325: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-325)
          );
          --wui-color-bg-350: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-350)
          );

          --wui-color-success-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-success-base-100)
          );
          --wui-color-success-125: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-success-base-125)
          );

          --wui-color-warning-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-warning-base-100)
          );

          --wui-color-error-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-error-base-100)
          );
          --wui-color-blue-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-blue-base-100)
          );
          --wui-color-blue-90: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-blue-base-90)
          );
          --wui-color-error-125: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-error-base-125)
          );

          --wui-icon-box-bg-error-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-icon-box-bg-error-base-100)
          );
          --wui-icon-box-bg-accent-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-icon-box-bg-blue-base-100)
          );
          --wui-icon-box-bg-success-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-icon-box-bg-success-base-100)
          );
          --wui-icon-box-bg-inverse-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-icon-box-bg-inverse-base-100)
          );

          --wui-all-wallets-bg-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-all-wallets-bg-100)
          );

          --wui-avatar-border: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-avatar-border-base)
          );

          --wui-thumbnail-border: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-thumbnail-border-base)
          );

          --wui-wallet-button-bg: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-wallet-button-bg-base)
          );
        }
      }
    `,light:o.css`
      :root {
        --w3m-color-mix: ${(0,o.unsafeCSS)(e?.["--w3m-color-mix"]||"#fff")};
        --w3m-accent: ${(0,o.unsafeCSS)((0,i.getW3mThemeVariables)(e,"dark")["--w3m-accent"])};
        --w3m-default: #fff;

        --wui-color-modal-bg-base: ${(0,o.unsafeCSS)((0,i.getW3mThemeVariables)(e,"dark")["--w3m-background"])};
        --wui-color-accent-base-100: var(--w3m-accent);

        --wui-color-blueberry-100: hsla(230, 100%, 67%, 1);
        --wui-color-blueberry-090: hsla(231, 76%, 61%, 1);
        --wui-color-blueberry-080: hsla(230, 59%, 55%, 1);
        --wui-color-blueberry-050: hsla(231, 100%, 70%, 0.1);

        --wui-color-fg-100: #e4e7e7;
        --wui-color-fg-125: #d0d5d5;
        --wui-color-fg-150: #a8b1b1;
        --wui-color-fg-175: #a8b0b0;
        --wui-color-fg-200: #949e9e;
        --wui-color-fg-225: #868f8f;
        --wui-color-fg-250: #788080;
        --wui-color-fg-275: #788181;
        --wui-color-fg-300: #6e7777;
        --wui-color-fg-325: #9a9a9a;
        --wui-color-fg-350: #363636;

        --wui-color-bg-100: #141414;
        --wui-color-bg-125: #191a1a;
        --wui-color-bg-150: #1e1f1f;
        --wui-color-bg-175: #222525;
        --wui-color-bg-200: #272a2a;
        --wui-color-bg-225: #2c3030;
        --wui-color-bg-250: #313535;
        --wui-color-bg-275: #363b3b;
        --wui-color-bg-300: #3b4040;
        --wui-color-bg-325: #252525;
        --wui-color-bg-350: #ffffff;

        --wui-color-success-base-100: #26d962;
        --wui-color-success-base-125: #30a46b;

        --wui-color-warning-base-100: #f3a13f;

        --wui-color-error-base-100: #f25a67;
        --wui-color-error-base-125: #df4a34;

        --wui-color-blue-base-100: rgba(102, 125, 255, 1);
        --wui-color-blue-base-90: rgba(102, 125, 255, 0.9);

        --wui-color-success-glass-001: rgba(38, 217, 98, 0.01);
        --wui-color-success-glass-002: rgba(38, 217, 98, 0.02);
        --wui-color-success-glass-005: rgba(38, 217, 98, 0.05);
        --wui-color-success-glass-010: rgba(38, 217, 98, 0.1);
        --wui-color-success-glass-015: rgba(38, 217, 98, 0.15);
        --wui-color-success-glass-020: rgba(38, 217, 98, 0.2);
        --wui-color-success-glass-025: rgba(38, 217, 98, 0.25);
        --wui-color-success-glass-030: rgba(38, 217, 98, 0.3);
        --wui-color-success-glass-060: rgba(38, 217, 98, 0.6);
        --wui-color-success-glass-080: rgba(38, 217, 98, 0.8);

        --wui-color-success-glass-reown-020: rgba(48, 164, 107, 0.2);

        --wui-color-warning-glass-reown-020: rgba(243, 161, 63, 0.2);

        --wui-color-error-glass-001: rgba(242, 90, 103, 0.01);
        --wui-color-error-glass-002: rgba(242, 90, 103, 0.02);
        --wui-color-error-glass-005: rgba(242, 90, 103, 0.05);
        --wui-color-error-glass-010: rgba(242, 90, 103, 0.1);
        --wui-color-error-glass-015: rgba(242, 90, 103, 0.15);
        --wui-color-error-glass-020: rgba(242, 90, 103, 0.2);
        --wui-color-error-glass-025: rgba(242, 90, 103, 0.25);
        --wui-color-error-glass-030: rgba(242, 90, 103, 0.3);
        --wui-color-error-glass-060: rgba(242, 90, 103, 0.6);
        --wui-color-error-glass-080: rgba(242, 90, 103, 0.8);

        --wui-color-error-glass-reown-020: rgba(223, 74, 52, 0.2);

        --wui-color-gray-glass-001: rgba(255, 255, 255, 0.01);
        --wui-color-gray-glass-002: rgba(255, 255, 255, 0.02);
        --wui-color-gray-glass-005: rgba(255, 255, 255, 0.05);
        --wui-color-gray-glass-010: rgba(255, 255, 255, 0.1);
        --wui-color-gray-glass-015: rgba(255, 255, 255, 0.15);
        --wui-color-gray-glass-020: rgba(255, 255, 255, 0.2);
        --wui-color-gray-glass-025: rgba(255, 255, 255, 0.25);
        --wui-color-gray-glass-030: rgba(255, 255, 255, 0.3);
        --wui-color-gray-glass-060: rgba(255, 255, 255, 0.6);
        --wui-color-gray-glass-080: rgba(255, 255, 255, 0.8);
        --wui-color-gray-glass-090: rgba(255, 255, 255, 0.9);

        --wui-color-dark-glass-100: rgba(42, 42, 42, 1);

        --wui-icon-box-bg-error-base-100: #3c2426;
        --wui-icon-box-bg-blue-base-100: #20303f;
        --wui-icon-box-bg-success-base-100: #1f3a28;
        --wui-icon-box-bg-inverse-base-100: #243240;

        --wui-all-wallets-bg-100: #222b35;

        --wui-avatar-border-base: #252525;

        --wui-thumbnail-border-base: #252525;

        --wui-wallet-button-bg-base: var(--wui-color-bg-125);

        --w3m-card-embedded-shadow-color: rgb(17 17 18 / 25%);
      }
    `,dark:o.css`
      :root {
        --w3m-color-mix: ${(0,o.unsafeCSS)(e?.["--w3m-color-mix"]||"#000")};
        --w3m-accent: ${(0,o.unsafeCSS)((0,i.getW3mThemeVariables)(e,"light")["--w3m-accent"])};
        --w3m-default: #000;

        --wui-color-modal-bg-base: ${(0,o.unsafeCSS)((0,i.getW3mThemeVariables)(e,"light")["--w3m-background"])};
        --wui-color-accent-base-100: var(--w3m-accent);

        --wui-color-blueberry-100: hsla(231, 100%, 70%, 1);
        --wui-color-blueberry-090: hsla(231, 97%, 72%, 1);
        --wui-color-blueberry-080: hsla(231, 92%, 74%, 1);

        --wui-color-fg-100: #141414;
        --wui-color-fg-125: #2d3131;
        --wui-color-fg-150: #474d4d;
        --wui-color-fg-175: #636d6d;
        --wui-color-fg-200: #798686;
        --wui-color-fg-225: #828f8f;
        --wui-color-fg-250: #8b9797;
        --wui-color-fg-275: #95a0a0;
        --wui-color-fg-300: #9ea9a9;
        --wui-color-fg-325: #9a9a9a;
        --wui-color-fg-350: #d0d0d0;

        --wui-color-bg-100: #ffffff;
        --wui-color-bg-125: #f5fafa;
        --wui-color-bg-150: #f3f8f8;
        --wui-color-bg-175: #eef4f4;
        --wui-color-bg-200: #eaf1f1;
        --wui-color-bg-225: #e5eded;
        --wui-color-bg-250: #e1e9e9;
        --wui-color-bg-275: #dce7e7;
        --wui-color-bg-300: #d8e3e3;
        --wui-color-bg-325: #f3f3f3;
        --wui-color-bg-350: #202020;

        --wui-color-success-base-100: #26b562;
        --wui-color-success-base-125: #30a46b;

        --wui-color-warning-base-100: #f3a13f;

        --wui-color-error-base-100: #f05142;
        --wui-color-error-base-125: #df4a34;

        --wui-color-blue-base-100: rgba(102, 125, 255, 1);
        --wui-color-blue-base-90: rgba(102, 125, 255, 0.9);

        --wui-color-success-glass-001: rgba(38, 181, 98, 0.01);
        --wui-color-success-glass-002: rgba(38, 181, 98, 0.02);
        --wui-color-success-glass-005: rgba(38, 181, 98, 0.05);
        --wui-color-success-glass-010: rgba(38, 181, 98, 0.1);
        --wui-color-success-glass-015: rgba(38, 181, 98, 0.15);
        --wui-color-success-glass-020: rgba(38, 181, 98, 0.2);
        --wui-color-success-glass-025: rgba(38, 181, 98, 0.25);
        --wui-color-success-glass-030: rgba(38, 181, 98, 0.3);
        --wui-color-success-glass-060: rgba(38, 181, 98, 0.6);
        --wui-color-success-glass-080: rgba(38, 181, 98, 0.8);

        --wui-color-success-glass-reown-020: rgba(48, 164, 107, 0.2);

        --wui-color-warning-glass-reown-020: rgba(243, 161, 63, 0.2);

        --wui-color-error-glass-001: rgba(240, 81, 66, 0.01);
        --wui-color-error-glass-002: rgba(240, 81, 66, 0.02);
        --wui-color-error-glass-005: rgba(240, 81, 66, 0.05);
        --wui-color-error-glass-010: rgba(240, 81, 66, 0.1);
        --wui-color-error-glass-015: rgba(240, 81, 66, 0.15);
        --wui-color-error-glass-020: rgba(240, 81, 66, 0.2);
        --wui-color-error-glass-025: rgba(240, 81, 66, 0.25);
        --wui-color-error-glass-030: rgba(240, 81, 66, 0.3);
        --wui-color-error-glass-060: rgba(240, 81, 66, 0.6);
        --wui-color-error-glass-080: rgba(240, 81, 66, 0.8);

        --wui-color-error-glass-reown-020: rgba(223, 74, 52, 0.2);

        --wui-icon-box-bg-error-base-100: #f4dfdd;
        --wui-icon-box-bg-blue-base-100: #d9ecfb;
        --wui-icon-box-bg-success-base-100: #daf0e4;
        --wui-icon-box-bg-inverse-base-100: #dcecfc;

        --wui-all-wallets-bg-100: #e8f1fa;

        --wui-avatar-border-base: #f3f4f4;

        --wui-thumbnail-border-base: #eaefef;

        --wui-wallet-button-bg-base: var(--wui-color-bg-125);

        --wui-color-gray-glass-001: rgba(0, 0, 0, 0.01);
        --wui-color-gray-glass-002: rgba(0, 0, 0, 0.02);
        --wui-color-gray-glass-005: rgba(0, 0, 0, 0.05);
        --wui-color-gray-glass-010: rgba(0, 0, 0, 0.1);
        --wui-color-gray-glass-015: rgba(0, 0, 0, 0.15);
        --wui-color-gray-glass-020: rgba(0, 0, 0, 0.2);
        --wui-color-gray-glass-025: rgba(0, 0, 0, 0.25);
        --wui-color-gray-glass-030: rgba(0, 0, 0, 0.3);
        --wui-color-gray-glass-060: rgba(0, 0, 0, 0.6);
        --wui-color-gray-glass-080: rgba(0, 0, 0, 0.8);
        --wui-color-gray-glass-090: rgba(0, 0, 0, 0.9);

        --wui-color-dark-glass-100: rgba(233, 233, 233, 1);

        --w3m-card-embedded-shadow-color: rgb(224 225 233 / 25%);
      }
    `}}let c=o.css`
  *,
  *::after,
  *::before,
  :host {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-style: normal;
    text-rendering: optimizeSpeed;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
    font-family: var(--wui-font-family);
    backface-visibility: hidden;
  }
`,l=o.css`
  button,
  a {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    transition:
      color var(--wui-duration-lg) var(--wui-ease-out-power-1),
      background-color var(--wui-duration-lg) var(--wui-ease-out-power-1),
      border var(--wui-duration-lg) var(--wui-ease-out-power-1),
      border-radius var(--wui-duration-lg) var(--wui-ease-out-power-1),
      box-shadow var(--wui-duration-lg) var(--wui-ease-out-power-1);
    will-change: background-color, color, border, box-shadow, border-radius;
    outline: none;
    border: none;
    column-gap: var(--wui-spacing-3xs);
    background-color: transparent;
    text-decoration: none;
  }

  wui-flex {
    transition: border-radius var(--wui-duration-lg) var(--wui-ease-out-power-1);
    will-change: border-radius;
  }

  button:disabled > wui-wallet-image,
  button:disabled > wui-all-wallets-image,
  button:disabled > wui-network-image,
  button:disabled > wui-image,
  button:disabled > wui-transaction-visual,
  button:disabled > wui-logo {
    filter: grayscale(1);
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      background-color: var(--wui-color-gray-glass-005);
    }

    button:active:enabled {
      background-color: var(--wui-color-gray-glass-010);
    }
  }

  button:disabled > wui-icon-box {
    opacity: 0.5;
  }

  input {
    border: none;
    outline: none;
    appearance: none;
  }
`,u=o.css`
  .wui-color-inherit {
    color: var(--wui-color-inherit);
  }

  .wui-color-accent-100 {
    color: var(--wui-color-accent-100);
  }

  .wui-color-error-100 {
    color: var(--wui-color-error-100);
  }

  .wui-color-blue-100 {
    color: var(--wui-color-blue-100);
  }

  .wui-color-blue-90 {
    color: var(--wui-color-blue-90);
  }

  .wui-color-error-125 {
    color: var(--wui-color-error-125);
  }

  .wui-color-success-100 {
    color: var(--wui-color-success-100);
  }

  .wui-color-success-125 {
    color: var(--wui-color-success-125);
  }

  .wui-color-inverse-100 {
    color: var(--wui-color-inverse-100);
  }

  .wui-color-inverse-000 {
    color: var(--wui-color-inverse-000);
  }

  .wui-color-fg-100 {
    color: var(--wui-color-fg-100);
  }

  .wui-color-fg-200 {
    color: var(--wui-color-fg-200);
  }

  .wui-color-fg-300 {
    color: var(--wui-color-fg-300);
  }

  .wui-color-fg-325 {
    color: var(--wui-color-fg-325);
  }

  .wui-color-fg-350 {
    color: var(--wui-color-fg-350);
  }

  .wui-bg-color-inherit {
    background-color: var(--wui-color-inherit);
  }

  .wui-bg-color-blue-100 {
    background-color: var(--wui-color-accent-100);
  }

  .wui-bg-color-error-100 {
    background-color: var(--wui-color-error-100);
  }

  .wui-bg-color-error-125 {
    background-color: var(--wui-color-error-125);
  }

  .wui-bg-color-success-100 {
    background-color: var(--wui-color-success-100);
  }

  .wui-bg-color-success-125 {
    background-color: var(--wui-color-success-100);
  }

  .wui-bg-color-inverse-100 {
    background-color: var(--wui-color-inverse-100);
  }

  .wui-bg-color-inverse-000 {
    background-color: var(--wui-color-inverse-000);
  }

  .wui-bg-color-fg-100 {
    background-color: var(--wui-color-fg-100);
  }

  .wui-bg-color-fg-200 {
    background-color: var(--wui-color-fg-200);
  }

  .wui-bg-color-fg-300 {
    background-color: var(--wui-color-fg-300);
  }

  .wui-color-fg-325 {
    background-color: var(--wui-color-fg-325);
  }

  .wui-color-fg-350 {
    background-color: var(--wui-color-fg-350);
  }
`;e.s(["colorStyles",0,u,"elementStyles",0,l,"initializeTheming",0,function(e,o){t=document.createElement("style"),r=document.createElement("style"),a=document.createElement("style"),t.textContent=s(e).core.cssText,r.textContent=s(e).dark.cssText,a.textContent=s(e).light.cssText,document.head.appendChild(t),document.head.appendChild(r),document.head.appendChild(a),n(o)},"resetStyles",0,c,"setColorTheme",0,n,"setThemeVariables",0,function(e){t&&r&&a&&(t.textContent=s(e).core.cssText,r.textContent=s(e).dark.cssText,a.textContent=s(e).light.cssText)}],30333),e.s([],51203)},20464,e=>{"use strict";Symbol();let t=Symbol(),r=Object.getPrototypeOf,a=new WeakMap,o=e=>{let o;return(o=e)&&(a.has(o)?a.get(o):r(o)===Object.prototype||r(o)===Array.prototype)&&e[t]||null},i=(e,t=!0)=>{a.set(e,t)};var n={get url(){return e.F("node_modules/.pnpm/valtio@1.13.2_@types+react@19.3.0_react@19.3.0/node_modules/valtio/esm/vanilla.mjs")},env:{DEV:!1,PROD:!0,MODE:"production",BASE_URL:"/",SSR:!1}};let s=e=>"object"==typeof e&&null!==e,c=new WeakMap,l=new WeakSet,u=(e=Object.is,t=(e,t)=>new Proxy(e,t),r=e=>s(e)&&!l.has(e)&&(Array.isArray(e)||!(Symbol.iterator in e))&&!(e instanceof WeakMap)&&!(e instanceof WeakSet)&&!(e instanceof Error)&&!(e instanceof Number)&&!(e instanceof Date)&&!(e instanceof String)&&!(e instanceof RegExp)&&!(e instanceof ArrayBuffer),a=e=>{switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:throw e}},u=new WeakMap,d=(e,t,r=a)=>{let o=u.get(e);if((null==o?void 0:o[0])===t)return o[1];let n=Array.isArray(e)?[]:Object.create(Object.getPrototypeOf(e));return i(n,!0),u.set(e,[t,n]),Reflect.ownKeys(e).forEach(t=>{if(Object.getOwnPropertyDescriptor(n,t))return;let a=Reflect.get(e,t),{enumerable:o}=Reflect.getOwnPropertyDescriptor(e,t),s={value:a,enumerable:o,configurable:!0};if(l.has(a))i(a,!1);else if(a instanceof Promise)delete s.value,s.get=()=>r(a);else if(c.has(a)){let[e,t]=c.get(a);s.value=d(e,t(),r)}Object.defineProperty(n,t,s)}),Object.preventExtensions(n)},p=new WeakMap,w=[1,1],g=a=>{if(!s(a))throw Error("object required");let i=p.get(a);if(i)return i;let u=w[0],m=new Set,h=(e,t=++w[0])=>{u!==t&&(u=t,m.forEach(r=>r(e,t)))},C=w[1],f=(e=++w[1])=>(C===e||m.size||(C=e,v.forEach(([t])=>{let r=t[1](e);r>u&&(u=r)})),u),b=e=>(t,r)=>{let a=[...t];a[1]=[e,...a[1]],h(a,r)},v=new Map,A=(e,t)=>{if("production"!==n.env.MODE&&v.has(e),m.size){let r=t[3](b(e));v.set(e,[t,r])}else v.set(e,[t])},N=e=>{var t;let r=v.get(e);r&&(v.delete(e),null==(t=r[1])||t.call(r))},y=e=>{m.add(e),1===m.size&&v.forEach(([e,t],r)=>{let a=e[3](b(r));v.set(r,[e,a])});let t=()=>{m.delete(e),0===m.size&&v.forEach(([e,t],r)=>{t&&(t(),v.set(r,[e]))})};return t},E=Array.isArray(a)?[]:Object.create(Object.getPrototypeOf(a)),k={deleteProperty(e,t){let r=Reflect.get(e,t);N(t);let a=Reflect.deleteProperty(e,t);return a&&h(["delete",[t],r]),a},set(t,a,i,n){let u=Reflect.has(t,a),d=Reflect.get(t,a,n);if(u&&(e(d,i)||p.has(i)&&e(d,p.get(i))))return!0;N(a),s(i)&&(i=o(i)||i);let w=i;if(i instanceof Promise)i.then(e=>{i.status="fulfilled",i.value=e,h(["resolve",[a],e])}).catch(e=>{i.status="rejected",i.reason=e,h(["reject",[a],e])});else{!c.has(i)&&r(i)&&(w=g(i));let e=!l.has(w)&&c.get(w);e&&A(a,e)}return Reflect.set(t,a,w,n),h(["set",[a],i,d]),!0}},I=t(E,k);p.set(a,I);let S=[E,f,d,y];return c.set(I,S),Reflect.ownKeys(a).forEach(e=>{let t=Object.getOwnPropertyDescriptor(a,e);"value"in t&&(I[e]=a[e],delete t.value,delete t.writable),Object.defineProperty(E,e,t)}),I})=>[g,c,l,e,t,r,a,u,d,p,w],[d]=u();e.s(["getVersion",0,function(e){let t=c.get(e);return null==t?void 0:t[1]()},"proxy",0,function(e={}){return d(e)},"ref",0,function(e){return l.add(e),e},"snapshot",0,function(e,t){let[r,a,o]=c.get(e);return o(r,a(),t)},"subscribe",0,function(e,t,r){let a,o=c.get(e),i=[],n=o[3],s=!1,l=n(e=>{(i.push(e),r)?t(i.splice(0)):a||(a=Promise.resolve().then(()=>{a=void 0,s&&t(i.splice(0))}))});return s=!0,()=>{s=!1,l()}},"unstable_buildProxyFunction",0,u],20464)},35126,e=>{"use strict";var t=e.i(20464);new WeakMap,new WeakMap,Symbol(),e.s(["proxyMap",0,function(e){let r=(0,t.proxy)({data:Array.from(e||[]),has(e){return this.data.some(t=>t[0]===e)},set(e,t){let r=this.data.find(t=>t[0]===e);return r?r[1]=t:this.data.push([e,t]),this},get(e){var t;return null==(t=this.data.find(t=>t[0]===e))?void 0:t[1]},delete(e){let t=this.data.findIndex(t=>t[0]===e);return -1!==t&&(this.data.splice(t,1),!0)},clear(){this.data.splice(0)},get size(){return this.data.length},toJSON(){return new Map(this.data)},forEach(e){this.data.forEach(t=>{e(t[1],t[0],this)})},keys(){return this.data.map(e=>e[0]).values()},values(){return this.data.map(e=>e[1]).values()},entries(){return new Map(this.data).entries()},get[Symbol.toStringTag](){return"Map"},[Symbol.iterator](){return this.entries()}});return Object.defineProperties(r,{data:{enumerable:!1},size:{enumerable:!1},toJSON:{enumerable:!1}}),Object.seal(r),r},"subscribeKey",0,function(e,r,a,o){let i=e[r];return(0,t.subscribe)(e,()=>{let t=e[r];Object.is(i,t)||a(i=t)},o)}],35126)}]);