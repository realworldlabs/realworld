(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,75884,e=>{"use strict";var t=`{
  "connect_wallet": {
    "label": "Connect Wallet",
    "wrong_network": {
      "label": "Wrong network"
    }
  },

  "intro": {
    "title": "What is a Wallet?",
    "description": "A wallet is used to send, receive, store, and display digital assets. It's also a new way to log in, without needing to create new accounts and passwords on every website.",
    "digital_asset": {
      "title": "A Home for your Digital Assets",
      "description": "Wallets are used to send, receive, store, and display digital assets like Ethereum and NFTs."
    },
    "login": {
      "title": "A New Way to Log In",
      "description": "Instead of creating new accounts and passwords on every website, just connect your wallet."
    },
    "get": {
      "label": "Get a Wallet"
    },
    "learn_more": {
      "label": "Learn More"
    }
  },

  "sign_in": {
    "label": "Verify your account",
    "description": "To finish connecting, you must sign a message in your wallet to verify that you are the owner of this account.",
    "message": {
      "send": "Sign message",
      "preparing": "Preparing message...",
      "cancel": "Cancel",
      "preparing_error": "Error preparing message, please retry!"
    },
    "signature": {
      "waiting": "Waiting for signature...",
      "verifying": "Verifying signature...",
      "signing_error": "Error signing message, please retry!",
      "verifying_error": "Error verifying signature, please retry!",
      "oops_error": "Oops, something went wrong!"
    }
  },

  "connect": {
    "label": "Connect",
    "title": "Connect a Wallet",
    "new_to_ethereum": {
      "description": "New to Ethereum wallets?",
      "learn_more": {
        "label": "Learn More"
      }
    },
    "learn_more": {
      "label": "Learn more"
    },
    "recent": "Recent",
    "status": {
      "opening": "Opening %{wallet}...",
      "connecting": "Connecting",
      "connect_mobile": "Continue in %{wallet}",
      "not_installed": "%{wallet} is not installed",
      "not_available": "%{wallet} is not available",
      "confirm": "Confirm connection in the extension",
      "confirm_mobile": "Accept connection request in the wallet"
    },
    "secondary_action": {
      "get": {
        "description": "Don't have %{wallet}?",
        "label": "GET"
      },
      "install": {
        "label": "INSTALL"
      },
      "retry": {
        "label": "RETRY"
      }
    },
    "walletconnect": {
      "description": {
        "full": "Need the official WalletConnect modal?",
        "compact": "Need the WalletConnect modal?"
      },
      "open": {
        "label": "OPEN"
      }
    }
  },

  "connect_scan": {
    "title": "Scan with %{wallet}",
    "fallback_title": "Scan with your phone"
  },

  "connector_group": {
    "installed": "Installed",
    "recommended": "Recommended",
    "other": "Other",
    "popular": "Popular",
    "more": "More",
    "others": "Others"
  },

  "get": {
    "title": "Get a Wallet",
    "action": {
      "label": "GET"
    },
    "mobile": {
      "description": "Mobile Wallet"
    },
    "extension": {
      "description": "Browser Extension"
    },
    "mobile_and_extension": {
      "description": "Mobile Wallet and Extension"
    },
    "mobile_and_desktop": {
      "description": "Mobile and Desktop Wallet"
    },
    "looking_for": {
      "title": "Not what you're looking for?",
      "mobile": {
        "description": "Select a wallet on the main screen to get started with a different wallet provider."
      },
      "desktop": {
        "compact_description": "Select a wallet on the main screen to get started with a different wallet provider.",
        "wide_description": "Select a wallet on the left to get started with a different wallet provider."
      }
    }
  },

  "get_options": {
    "title": "Get started with %{wallet}",
    "short_title": "Get %{wallet}",
    "mobile": {
      "title": "%{wallet} for Mobile",
      "description": "Use the mobile wallet to explore the world of Ethereum.",
      "download": {
        "label": "Get the app"
      }
    },
    "extension": {
      "title": "%{wallet} for %{browser}",
      "description": "Access your wallet right from your favorite web browser.",
      "download": {
        "label": "Add to %{browser}"
      }
    },
    "desktop": {
      "title": "%{wallet} for %{platform}",
      "description": "Access your wallet natively from your powerful desktop.",
      "download": {
        "label": "Add to %{platform}"
      }
    }
  },

  "get_mobile": {
    "title": "Install %{wallet}",
    "description": "Scan with your phone to download on iOS or Android",
    "continue": {
      "label": "Continue"
    }
  },

  "get_instructions": {
    "mobile": {
      "connect": {
        "label": "Connect"
      },
      "learn_more": {
        "label": "Learn More"
      }
    },
    "extension": {
      "refresh": {
        "label": "Refresh"
      },
      "learn_more": {
        "label": "Learn More"
      }
    },
    "desktop": {
      "connect": {
        "label": "Connect"
      },
      "learn_more": {
        "label": "Learn More"
      }
    }
  },

  "chains": {
    "title": "Switch Networks",
    "wrong_network": "Wrong network detected, switch or disconnect to continue.",
    "confirm": "Confirm in Wallet",
    "switching_not_supported": "Your wallet does not support switching networks from %{appName}. Try switching networks from within your wallet instead.",
    "switching_not_supported_fallback": "Your wallet does not support switching networks from this app. Try switching networks from within your wallet instead.",
    "disconnect": "Disconnect",
    "connected": "Connected"
  },

  "profile": {
    "disconnect": {
      "label": "Disconnect"
    },
    "copy_address": {
      "label": "Copy Address",
      "copied": "Copied!"
    },
    "explorer": {
      "label": "View more on explorer"
    },
    "transactions": {
      "description": "%{appName} transactions will appear here...",
      "description_fallback": "Your transactions will appear here...",
      "recent": {
        "title": "Recent Transactions"
      },
      "clear": {
        "label": "Clear All"
      }
    }
  },

  "wallet_connectors": {
    "ready": {
      "qr_code": {
        "step1": {
          "description": "Add Ready to your home screen for faster access to your wallet.",
          "title": "Open the Ready app"
        },
        "step2": {
          "description": "Create a wallet and username, or import an existing wallet.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the Scan QR button"
        }
      }
    },

    "berasig": {
      "extension": {
        "step1": {
          "title": "Install the BeraSig extension",
          "description": "We recommend pinning BeraSig to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "best": {
      "qr_code": {
        "step1": {
          "title": "Open the Best Wallet app",
          "description": "Add Best Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "bifrost": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Bifrost Wallet on your home screen for quicker access.",
          "title": "Open the Bifrost Wallet app"
        },
        "step2": {
          "description": "Create or import a wallet using your recovery phrase.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      }
    },

    "bitget": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Bitget Wallet on your home screen for quicker access.",
          "title": "Open the Bitget Wallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Bitget Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Bitget Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "bitski": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Bitski to your taskbar for quicker access to your wallet.",
          "title": "Install the Bitski extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "bitverse": {
      "qr_code": {
        "step1": {
          "title": "Open the Bitverse Wallet app",
          "description": "Add Bitverse Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "bloom": {
      "desktop": {
        "step1": {
          "title": "Open the Bloom Wallet app",
          "description": "We recommend putting Bloom Wallet on your home screen for quicker access."
        },
        "step2": {
          "description": "Create or import a wallet using your recovery phrase.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you have a wallet, click on Connect to connect via Bloom. A connection prompt in the app will appear for you to confirm the connection.",
          "title": "Click on Connect"
        }
      }
    },

    "bybit": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Bybit on your home screen for faster access to your wallet.",
          "title": "Open the Bybit app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "Click at the top right of your browser and pin Bybit Wallet for easy access.",
          "title": "Install the Bybit Wallet extension"
        },
        "step2": {
          "description": "Create a new wallet or import an existing one.",
          "title": "Create or Import a wallet"
        },
        "step3": {
          "description": "Once you set up Bybit Wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "binance": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Binance on your home screen for faster access to your wallet.",
          "title": "Open the Binance app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      },
      "extension": {
        "step1": {
          "title": "Install the Binance Wallet extension",
          "description": "We recommend pinning Binance Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "coin98": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Coin98 Wallet on your home screen for faster access to your wallet.",
          "title": "Open the Coin98 Wallet app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      },

      "extension": {
        "step1": {
          "description": "Click at the top right of your browser and pin Coin98 Wallet for easy access.",
          "title": "Install the Coin98 Wallet extension"
        },
        "step2": {
          "description": "Create a new wallet or import an existing one.",
          "title": "Create or Import a wallet"
        },
        "step3": {
          "description": "Once you set up Coin98 Wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "coinbase": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Coinbase Wallet on your home screen for quicker access.",
          "title": "Open the Coinbase Wallet app"
        },
        "step2": {
          "description": "You can easily backup your wallet using the cloud backup feature.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Coinbase Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Coinbase Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "compass": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Compass Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Compass Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "core": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Core on your home screen for faster access to your wallet.",
          "title": "Open the Core app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Core to your taskbar for quicker access to your wallet.",
          "title": "Install the Core extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "fox": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting FoxWallet on your home screen for quicker access.",
          "title": "Open the FoxWallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      }
    },

    "frontier": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Frontier Wallet on your home screen for quicker access.",
          "title": "Open the Frontier Wallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Frontier Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Frontier Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "im_token": {
      "qr_code": {
        "step1": {
          "title": "Open the imToken app",
          "description": "Put imToken app on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap Scanner Icon in top right corner",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "iopay": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting ioPay on your home screen for faster access to your wallet.",
          "title": "Open the ioPay app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      }
    },

    "kaikas": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Kaikas to your taskbar for quicker access to your wallet.",
          "title": "Install the Kaikas extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the Kaikas app",
          "description": "Put Kaikas app on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap Scanner Icon in top right corner",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "kaia": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Kaia to your taskbar for quicker access to your wallet.",
          "title": "Install the Kaia extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the Kaia app",
          "description": "Put Kaia app on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap Scanner Icon in top right corner",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "kraken": {
      "qr_code": {
        "step1": {
          "title": "Open the Kraken Wallet app",
          "description": "Add Kraken Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "kresus": {
      "qr_code": {
        "step1": {
          "title": "Open the Kresus Wallet app",
          "description": "Add Kresus Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "magicEden": {
      "extension": {
        "step1": {
          "title": "Install the Magic Eden extension",
          "description": "We recommend pinning Magic Eden to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "metamask": {
      "qr_code": {
        "step1": {
          "title": "Open the MetaMask app",
          "description": "We recommend putting MetaMask on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the MetaMask extension",
          "description": "We recommend pinning MetaMask to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "nestwallet": {
      "extension": {
        "step1": {
          "title": "Install the NestWallet extension",
          "description": "We recommend pinning NestWallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "okx": {
      "qr_code": {
        "step1": {
          "title": "Open the OKX Wallet app",
          "description": "We recommend putting OKX Wallet on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the OKX Wallet extension",
          "description": "We recommend pinning OKX Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "omni": {
      "qr_code": {
        "step1": {
          "title": "Open the Omni app",
          "description": "Add Omni to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your home screen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "1inch": {
      "qr_code": {
        "step1": {
          "description": "Put 1inch Wallet on your home screen for faster access to your wallet.",
          "title": "Open the 1inch Wallet app"
        },
        "step2": {
          "description": "Create a wallet and username, or import an existing wallet.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the Scan QR button"
        }
      }
    },

    "token_pocket": {
      "qr_code": {
        "step1": {
          "title": "Open the TokenPocket app",
          "description": "We recommend putting TokenPocket on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the TokenPocket extension",
          "description": "We recommend pinning TokenPocket to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "trust": {
      "qr_code": {
        "step1": {
          "title": "Open the Trust Wallet app",
          "description": "Put Trust Wallet on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap WalletConnect in Settings",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the Trust Wallet extension",
          "description": "Click at the top right of your browser and pin Trust Wallet for easy access."
        },
        "step2": {
          "title": "Create or Import a wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up Trust Wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "uniswap": {
      "qr_code": {
        "step1": {
          "title": "Open the Uniswap app",
          "description": "Add Uniswap Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "zerion": {
      "qr_code": {
        "step1": {
          "title": "Open the Zerion app",
          "description": "We recommend putting Zerion on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the Zerion extension",
          "description": "We recommend pinning Zerion to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "rainbow": {
      "qr_code": {
        "step1": {
          "title": "Open the Rainbow app",
          "description": "We recommend putting Rainbow on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "You can easily backup your wallet using our backup feature on your phone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "enkrypt": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Enkrypt Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Enkrypt Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "frame": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Frame to your taskbar for quicker access to your wallet.",
          "title": "Install Frame & the companion extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "one_key": {
      "extension": {
        "step1": {
          "title": "Install the OneKey Wallet extension",
          "description": "We recommend pinning OneKey Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "paraswap": {
      "qr_code": {
        "step1": {
          "title": "Open the ParaSwap app",
          "description": "Add ParaSwap Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "phantom": {
      "extension": {
        "step1": {
          "title": "Install the Phantom extension",
          "description": "We recommend pinning Phantom to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "rabby": {
      "extension": {
        "step1": {
          "title": "Install the Rabby extension",
          "description": "We recommend pinning Rabby to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "ronin": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Ronin Wallet on your home screen for quicker access.",
          "title": "Open the Ronin Wallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Ronin Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Ronin Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "ramper": {
      "extension": {
        "step1": {
          "title": "Install the Ramper extension",
          "description": "We recommend pinning Ramper to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "safeheron": {
      "extension": {
        "step1": {
          "title": "Install the Core extension",
          "description": "We recommend pinning Safeheron to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "taho": {
      "extension": {
        "step1": {
          "title": "Install the Taho extension",
          "description": "We recommend pinning Taho to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "wigwam": {
      "extension": {
        "step1": {
          "title": "Install the Wigwam extension",
          "description": "We recommend pinning Wigwam to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "talisman": {
      "extension": {
        "step1": {
          "title": "Install the Talisman extension",
          "description": "We recommend pinning Talisman to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import an Ethereum Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "ctrl": {
      "extension": {
        "step1": {
          "title": "Install the CTRL Wallet extension",
          "description": "We recommend pinning CTRL Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "zeal": {
      "qr_code": {
        "step1": {
          "title": "Open the Zeal app",
          "description": "Add Zeal Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      },
      "extension": {
        "step1": {
          "title": "Install the Zeal extension",
          "description": "We recommend pinning Zeal to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "safepal": {
      "extension": {
        "step1": {
          "title": "Install the SafePal Wallet extension",
          "description": "Click at the top right of your browser and pin SafePal Wallet for easy access."
        },
        "step2": {
          "title": "Create or Import a wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up SafePal Wallet, click below to refresh the browser and load up the extension."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the SafePal Wallet app",
          "description": "Put SafePal Wallet on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap WalletConnect in Settings",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "desig": {
      "extension": {
        "step1": {
          "title": "Install the Desig extension",
          "description": "We recommend pinning Desig to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "subwallet": {
      "extension": {
        "step1": {
          "title": "Install the SubWallet extension",
          "description": "We recommend pinning SubWallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the SubWallet app",
          "description": "We recommend putting SubWallet on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "clv": {
      "extension": {
        "step1": {
          "title": "Install the CLV Wallet extension",
          "description": "We recommend pinning CLV Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the CLV Wallet app",
          "description": "We recommend putting CLV Wallet on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "okto": {
      "qr_code": {
        "step1": {
          "title": "Open the Okto app",
          "description": "Add Okto to your home screen for quick access"
        },
        "step2": {
          "title": "Create an MPC Wallet",
          "description": "Create an account and generate a wallet"
        },
        "step3": {
          "title": "Tap WalletConnect in Settings",
          "description": "Tap the Scan QR icon at the top right and confirm the prompt to connect."
        }
      }
    },

    "ledger": {
      "desktop": {
        "step1": {
          "title": "Open the Ledger Live app",
          "description": "We recommend putting Ledger Live on your home screen for quicker access."
        },
        "step2": {
          "title": "Set up your Ledger",
          "description": "Set up a new Ledger or connect to an existing one."
        },
        "step3": {
          "title": "Connect",
          "description": "A connection prompt will appear for you to connect your wallet."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the Ledger Live app",
          "description": "We recommend putting Ledger Live on your home screen for quicker access."
        },
        "step2": {
          "title": "Set up your Ledger",
          "description": "You can either sync with the desktop app or connect your Ledger."
        },
        "step3": {
          "title": "Scan the code",
          "description": "Tap WalletConnect then Switch to Scanner. After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "valora": {
      "qr_code": {
        "step1": {
          "title": "Open the Valora app",
          "description": "We recommend putting Valora on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or import a wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "gate": {
      "qr_code": {
        "step1": {
          "title": "Open the Gate app",
          "description": "We recommend putting Gate on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },
      "extension": {
        "step1": {
          "title": "Install the Gate extension",
          "description": "We recommend pinning Gate to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "gemini": {
      "qr_code": {
        "step1": {
          "title": "Open keys.gemini.com",
          "description": "Visit keys.gemini.com on your mobile browser - no app download required."
        },
        "step2": {
          "title": "Create Your Wallet Instantly",
          "description": "Set up your smart wallet in seconds using your device's built-in authentication."
        },
        "step3": {
          "title": "Scan to Connect",
          "description": "Scan the QR code to instantly connect your wallet - it just works."
        }
      },
      "extension": {
        "step1": {
          "title": "Go to keys.gemini.com",
          "description": "No extensions or downloads needed - your wallet lives securely in the browser."
        },
        "step2": {
          "title": "One-Click Setup",
          "description": "Create your smart wallet instantly with passkey authentication - easier than any wallet out there."
        },
        "step3": {
          "title": "Connect and Go",
          "description": "Approve the connection and you're ready - the unopinionated wallet that just works."
        }
      }
    },

    "xportal": {
      "qr_code": {
        "step1": {
          "description": "Put xPortal on your home screen for faster access to your wallet.",
          "title": "Open the xPortal app"
        },
        "step2": {
          "description": "Create a wallet or import an existing one.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the Scan QR button"
        }
      }
    },

    "mew": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting MEW Wallet on your home screen for quicker access.",
          "title": "Open the MEW Wallet app"
        },
        "step2": {
          "description": "You can easily backup your wallet using the cloud backup feature.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      }
    },

    "zilpay": {
      "qr_code": {
        "step1": {
          "title": "Open the ZilPay app",
          "description": "Add ZilPay to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "nova": {
      "qr_code": {
        "step1": {
          "title": "Open the Nova Wallet app",
          "description": "Add Nova Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "meco": {
      "qr_code": {
        "step1": {
          "title": "Open the MeCo Wallet app",
          "description": "Put MeCo Wallet on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "anchorage_digital": {
      "extension": {
        "step1": {
          "title": "Install the Anchorage Digital extension",
          "description": "We recommend pinning Anchorage Digital to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Scan the QR code to login",
          "description": "Securely connect your organization's wallets to dApps with institutional-grade security."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you log in, click below to refresh the browser and load up the extension."
        }
      }
    }
  }
}
`;e.s(["en_US_default",0,t])},79186,e=>{"use strict";var t=e.i(84738),r=e.i(69539),o=e.i(80792),n=e.i(82371),i=e.i(61700);async function a(e,s={}){let c,{assertChainId:l=!0}=s;if(s.connector){let{connector:t}=s;if("reconnecting"===e.state.status&&!t.getAccounts&&!t.getChainId)throw new i.ConnectorUnavailableReconnectingError({connector:t});let[r,o]=await Promise.all([t.getAccounts().catch(e=>{if(null===s.account)return[];throw e}),t.getChainId()]);c={accounts:r,chainId:o,connector:t}}else c=e.state.connections.get(e.state.current);if(!c)throw new i.ConnectorNotConnectedError;let u=s.chainId??c.chainId,p=await c.connector.getChainId();if(l&&p!==u)throw new i.ConnectorChainMismatchError({connectionChainId:u,connectorChainId:p});let d=c.connector;if(d.getClient)return d.getClient({chainId:u});let h=(0,n.parseAccount)(s.account??c.accounts[0]);if(h&&(h.address=(0,o.getAddress)(h.address)),s.account&&!c.accounts.some(e=>e.toLowerCase()===h.address.toLowerCase()))throw new i.ConnectorAccountNotFoundError({address:h.address,connector:d});let y=e.chains.find(e=>e.id===u),f=await c.connector.getProvider({chainId:u});return(0,t.createClient)({account:h,chain:y,name:"Connector Client",transport:e=>(0,r.custom)(f)({...e,retryCount:0})})}e.s(["getConnectorClient",0,a])},82061,e=>{"use strict";var t=e.i(72595);e.s(["getPublicClient",0,function(e,r={}){let o=function(e,t={}){try{return e.getClient(t)}catch{return}}(e,r);return o?.extend(t.publicActions)}],82061)},61700,e=>{"use strict";var t=e.i(51221);class r extends t.BaseError{constructor(){super("Chain not configured."),Object.defineProperty(this,"name",{enumerable:!0,configurable:!0,writable:!0,value:"ChainNotConfiguredError"})}}class o extends t.BaseError{constructor(){super("Connector already connected."),Object.defineProperty(this,"name",{enumerable:!0,configurable:!0,writable:!0,value:"ConnectorAlreadyConnectedError"})}}class n extends t.BaseError{constructor(){super("Connector not connected."),Object.defineProperty(this,"name",{enumerable:!0,configurable:!0,writable:!0,value:"ConnectorNotConnectedError"})}}t.BaseError;class i extends t.BaseError{constructor({address:e,connector:t}){super(`Account "${e}" not found for connector "${t.name}".`),Object.defineProperty(this,"name",{enumerable:!0,configurable:!0,writable:!0,value:"ConnectorAccountNotFoundError"})}}class a extends t.BaseError{constructor({connectionChainId:e,connectorChainId:t}){super(`The current chain of the connector (id: ${t}) does not match the connection's chain (id: ${e}).`,{metaMessages:[`Current Chain ID:  ${t}`,`Expected Chain ID: ${e}`]}),Object.defineProperty(this,"name",{enumerable:!0,configurable:!0,writable:!0,value:"ConnectorChainMismatchError"})}}class s extends t.BaseError{constructor({connector:e}){super(`Connector "${e.name}" unavailable while reconnecting.`,{details:"During the reconnection step, the only connector methods guaranteed to be available are: `id`, `name`, `type`, `uid`. All other methods are not guaranteed to be available until reconnection completes and connectors are fully restored. This error commonly occurs for connectors that asynchronously inject after reconnection has already started."}),Object.defineProperty(this,"name",{enumerable:!0,configurable:!0,writable:!0,value:"ConnectorUnavailableReconnectingError"})}}e.s(["ChainNotConfiguredError",0,r,"ConnectorAccountNotFoundError",0,i,"ConnectorAlreadyConnectedError",0,o,"ConnectorChainMismatchError",0,a,"ConnectorNotConnectedError",0,n,"ConnectorUnavailableReconnectingError",0,s])},53413,(e,t,r)=>{"use strict";var o=Object.prototype.hasOwnProperty,n="~";function i(){}function a(e,t,r){this.fn=e,this.context=t,this.once=r||!1}function s(e,t,r,o,i){if("function"!=typeof r)throw TypeError("The listener must be a function");var s=new a(r,o||e,i),c=n?n+t:t;return e._events[c]?e._events[c].fn?e._events[c]=[e._events[c],s]:e._events[c].push(s):(e._events[c]=s,e._eventsCount++),e}function c(e,t){0==--e._eventsCount?e._events=new i:delete e._events[t]}function l(){this._events=new i,this._eventsCount=0}Object.create&&(i.prototype=Object.create(null),new i().__proto__||(n=!1)),l.prototype.eventNames=function(){var e,t,r=[];if(0===this._eventsCount)return r;for(t in e=this._events)o.call(e,t)&&r.push(n?t.slice(1):t);return Object.getOwnPropertySymbols?r.concat(Object.getOwnPropertySymbols(e)):r},l.prototype.listeners=function(e){var t=n?n+e:e,r=this._events[t];if(!r)return[];if(r.fn)return[r.fn];for(var o=0,i=r.length,a=Array(i);o<i;o++)a[o]=r[o].fn;return a},l.prototype.listenerCount=function(e){var t=n?n+e:e,r=this._events[t];return r?r.fn?1:r.length:0},l.prototype.emit=function(e,t,r,o,i,a){var s=n?n+e:e;if(!this._events[s])return!1;var c,l,u=this._events[s],p=arguments.length;if(u.fn){switch(u.once&&this.removeListener(e,u.fn,void 0,!0),p){case 1:return u.fn.call(u.context),!0;case 2:return u.fn.call(u.context,t),!0;case 3:return u.fn.call(u.context,t,r),!0;case 4:return u.fn.call(u.context,t,r,o),!0;case 5:return u.fn.call(u.context,t,r,o,i),!0;case 6:return u.fn.call(u.context,t,r,o,i,a),!0}for(l=1,c=Array(p-1);l<p;l++)c[l-1]=arguments[l];u.fn.apply(u.context,c)}else{var d,h=u.length;for(l=0;l<h;l++)switch(u[l].once&&this.removeListener(e,u[l].fn,void 0,!0),p){case 1:u[l].fn.call(u[l].context);break;case 2:u[l].fn.call(u[l].context,t);break;case 3:u[l].fn.call(u[l].context,t,r);break;case 4:u[l].fn.call(u[l].context,t,r,o);break;default:if(!c)for(d=1,c=Array(p-1);d<p;d++)c[d-1]=arguments[d];u[l].fn.apply(u[l].context,c)}}return!0},l.prototype.on=function(e,t,r){return s(this,e,t,r,!1)},l.prototype.once=function(e,t,r){return s(this,e,t,r,!0)},l.prototype.removeListener=function(e,t,r,o){var i=n?n+e:e;if(!this._events[i])return this;if(!t)return c(this,i),this;var a=this._events[i];if(a.fn)a.fn!==t||o&&!a.once||r&&a.context!==r||c(this,i);else{for(var s=0,l=[],u=a.length;s<u;s++)(a[s].fn!==t||o&&!a[s].once||r&&a[s].context!==r)&&l.push(a[s]);l.length?this._events[i]=1===l.length?l[0]:l:c(this,i)}return this},l.prototype.removeAllListeners=function(e){var t;return e?(t=n?n+e:e,this._events[t]&&c(this,t)):(this._events=new i,this._eventsCount=0),this},l.prototype.off=l.prototype.removeListener,l.prototype.addListener=l.prototype.on,l.prefixed=n,l.EventEmitter=l,t.exports=l},85373,50158,e=>{"use strict";var t=e.i(53413);t.default,e.s([],85373),e.s(["EventEmitter",()=>t.default],50158)},74496,(e,t,r)=>{t.exports=e.r(23918)},24627,e=>{"use strict";var t=function(e,r){return(t=Object.setPrototypeOf||({__proto__:[]})instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r])})(e,r)};function r(e,r){if("function"!=typeof r&&null!==r)throw TypeError("Class extends value "+String(r)+" is not a constructor or null");function o(){this.constructor=e}t(e,r),e.prototype=null===r?Object.create(r):(o.prototype=r.prototype,new o)}var o=function(){return(o=Object.assign||function(e){for(var t,r=1,o=arguments.length;r<o;r++)for(var n in t=arguments[r])Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);return e}).apply(this,arguments)};function n(e,t){var r={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&0>t.indexOf(o)&&(r[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var n=0,o=Object.getOwnPropertySymbols(e);n<o.length;n++)0>t.indexOf(o[n])&&Object.prototype.propertyIsEnumerable.call(e,o[n])&&(r[o[n]]=e[o[n]]);return r}function i(e,t,r,o){var n,i=arguments.length,a=i<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,r,o);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(i<3?n(a):i>3?n(t,r,a):n(t,r))||a);return i>3&&a&&Object.defineProperty(t,r,a),a}function a(e,t){return function(r,o){t(r,o,e)}}function s(e,t,r,o,n,i){function a(e){if(void 0!==e&&"function"!=typeof e)throw TypeError("Function expected");return e}for(var s,c=o.kind,l="getter"===c?"get":"setter"===c?"set":"value",u=!t&&e?o.static?e:e.prototype:null,p=t||(u?Object.getOwnPropertyDescriptor(u,o.name):{}),d=!1,h=r.length-1;h>=0;h--){var y={};for(var f in o)y[f]="access"===f?{}:o[f];for(var f in o.access)y.access[f]=o.access[f];y.addInitializer=function(e){if(d)throw TypeError("Cannot add initializers after decoration has completed");i.push(a(e||null))};var m=(0,r[h])("accessor"===c?{get:p.get,set:p.set}:p[l],y);if("accessor"===c){if(void 0===m)continue;if(null===m||"object"!=typeof m)throw TypeError("Object expected");(s=a(m.get))&&(p.get=s),(s=a(m.set))&&(p.set=s),(s=a(m.init))&&n.unshift(s)}else(s=a(m))&&("field"===c?n.unshift(s):p[l]=s)}u&&Object.defineProperty(u,o.name,p),d=!0}function c(e,t,r){for(var o=arguments.length>2,n=0;n<t.length;n++)r=o?t[n].call(e,r):t[n].call(e);return o?r:void 0}function l(e){return"symbol"==typeof e?e:"".concat(e)}function u(e,t,r){return"symbol"==typeof t&&(t=t.description?"[".concat(t.description,"]"):""),Object.defineProperty(e,"name",{configurable:!0,value:r?"".concat(r," ",t):t})}function p(e,t){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(e,t)}function d(e,t,r,o){return new(r||(r=Promise))(function(n,i){function a(e){try{c(o.next(e))}catch(e){i(e)}}function s(e){try{c(o.throw(e))}catch(e){i(e)}}function c(e){var t;e.done?n(e.value):((t=e.value)instanceof r?t:new r(function(e){e(t)})).then(a,s)}c((o=o.apply(e,t||[])).next())})}function h(e,t){var r,o,n,i={label:0,sent:function(){if(1&n[0])throw n[1];return n[1]},trys:[],ops:[]},a=Object.create(("function"==typeof Iterator?Iterator:Object).prototype);return a.next=s(0),a.throw=s(1),a.return=s(2),"function"==typeof Symbol&&(a[Symbol.iterator]=function(){return this}),a;function s(s){return function(c){var l=[s,c];if(r)throw TypeError("Generator is already executing.");for(;a&&(a=0,l[0]&&(i=0)),i;)try{if(r=1,o&&(n=2&l[0]?o.return:l[0]?o.throw||((n=o.return)&&n.call(o),0):o.next)&&!(n=n.call(o,l[1])).done)return n;switch(o=0,n&&(l=[2&l[0],n.value]),l[0]){case 0:case 1:n=l;break;case 4:return i.label++,{value:l[1],done:!1};case 5:i.label++,o=l[1],l=[0];continue;case 7:l=i.ops.pop(),i.trys.pop();continue;default:if(!(n=(n=i.trys).length>0&&n[n.length-1])&&(6===l[0]||2===l[0])){i=0;continue}if(3===l[0]&&(!n||l[1]>n[0]&&l[1]<n[3])){i.label=l[1];break}if(6===l[0]&&i.label<n[1]){i.label=n[1],n=l;break}if(n&&i.label<n[2]){i.label=n[2],i.ops.push(l);break}n[2]&&i.ops.pop(),i.trys.pop();continue}l=t.call(e,i)}catch(e){l=[6,e],o=0}finally{r=n=0}if(5&l[0])throw l[1];return{value:l[0]?l[1]:void 0,done:!0}}}}var y=Object.create?function(e,t,r,o){void 0===o&&(o=r);var n=Object.getOwnPropertyDescriptor(t,r);(!n||("get"in n?!t.__esModule:n.writable||n.configurable))&&(n={enumerable:!0,get:function(){return t[r]}}),Object.defineProperty(e,o,n)}:function(e,t,r,o){void 0===o&&(o=r),e[o]=t[r]};function f(e,t){for(var r in e)"default"===r||Object.prototype.hasOwnProperty.call(t,r)||y(t,e,r)}function m(e){var t="function"==typeof Symbol&&Symbol.iterator,r=t&&e[t],o=0;if(r)return r.call(e);if(e&&"number"==typeof e.length)return{next:function(){return e&&o>=e.length&&(e=void 0),{value:e&&e[o++],done:!e}}};throw TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")}function w(e,t){var r="function"==typeof Symbol&&e[Symbol.iterator];if(!r)return e;var o,n,i=r.call(e),a=[];try{for(;(void 0===t||t-- >0)&&!(o=i.next()).done;)a.push(o.value)}catch(e){n={error:e}}finally{try{o&&!o.done&&(r=i.return)&&r.call(i)}finally{if(n)throw n.error}}return a}function b(){for(var e=[],t=0;t<arguments.length;t++)e=e.concat(w(arguments[t]));return e}function g(){for(var e=0,t=0,r=arguments.length;t<r;t++)e+=arguments[t].length;for(var o=Array(e),n=0,t=0;t<r;t++)for(var i=arguments[t],a=0,s=i.length;a<s;a++,n++)o[n]=i[a];return o}function v(e,t,r){if(r||2==arguments.length)for(var o,n=0,i=t.length;n<i;n++)!o&&n in t||(o||(o=Array.prototype.slice.call(t,0,n)),o[n]=t[n]);return e.concat(o||Array.prototype.slice.call(t))}function C(e){return this instanceof C?(this.v=e,this):new C(e)}function k(e,t,r){if(!Symbol.asyncIterator)throw TypeError("Symbol.asyncIterator is not defined.");var o,n=r.apply(e,t||[]),i=[];return o=Object.create(("function"==typeof AsyncIterator?AsyncIterator:Object).prototype),a("next"),a("throw"),a("return",function(e){return function(t){return Promise.resolve(t).then(e,l)}}),o[Symbol.asyncIterator]=function(){return this},o;function a(e,t){n[e]&&(o[e]=function(t){return new Promise(function(r,o){i.push([e,t,r,o])>1||s(e,t)})},t&&(o[e]=t(o[e])))}function s(e,t){try{var r;(r=n[e](t)).value instanceof C?Promise.resolve(r.value.v).then(c,l):u(i[0][2],r)}catch(e){u(i[0][3],e)}}function c(e){s("next",e)}function l(e){s("throw",e)}function u(e,t){e(t),i.shift(),i.length&&s(i[0][0],i[0][1])}}function x(e){var t,r;return t={},o("next"),o("throw",function(e){throw e}),o("return"),t[Symbol.iterator]=function(){return this},t;function o(o,n){t[o]=e[o]?function(t){return(r=!r)?{value:C(e[o](t)),done:!1}:n?n(t):t}:n}}function W(e){if(!Symbol.asyncIterator)throw TypeError("Symbol.asyncIterator is not defined.");var t,r=e[Symbol.asyncIterator];return r?r.call(e):(e=m(e),t={},o("next"),o("throw"),o("return"),t[Symbol.asyncIterator]=function(){return this},t);function o(r){t[r]=e[r]&&function(t){return new Promise(function(o,n){var i,a,s;i=o,a=n,s=(t=e[r](t)).done,Promise.resolve(t.value).then(function(e){i({value:e,done:s})},a)})}}}function O(e,t){return Object.defineProperty?Object.defineProperty(e,"raw",{value:t}):e.raw=t,e}var _=Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t},I=function(e){return(I=Object.getOwnPropertyNames||function(e){var t=[];for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(t[t.length]=r);return t})(e)};function R(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r=I(e),o=0;o<r.length;o++)"default"!==r[o]&&y(t,e,r[o]);return _(t,e),t}function S(e){return e&&e.__esModule?e:{default:e}}function E(e,t,r,o){if("a"===r&&!o)throw TypeError("Private accessor was defined without a getter");if("function"==typeof t?e!==t||!o:!t.has(e))throw TypeError("Cannot read private member from an object whose class did not declare it");return"m"===r?o:"a"===r?o.call(e):o?o.value:t.get(e)}function T(e,t,r,o,n){if("m"===o)throw TypeError("Private method is not writable");if("a"===o&&!n)throw TypeError("Private accessor was defined without a setter");if("function"==typeof t?e!==t||!n:!t.has(e))throw TypeError("Cannot write private member to an object whose class did not declare it");return"a"===o?n.call(e,r):n?n.value=r:t.set(e,r),r}function P(e,t){if(null===t||"object"!=typeof t&&"function"!=typeof t)throw TypeError("Cannot use 'in' operator on non-object");return"function"==typeof e?t===e:e.has(t)}function A(e,t,r){if(null!=t){var o,n;if("object"!=typeof t&&"function"!=typeof t)throw TypeError("Object expected.");if(r){if(!Symbol.asyncDispose)throw TypeError("Symbol.asyncDispose is not defined.");o=t[Symbol.asyncDispose]}if(void 0===o){if(!Symbol.dispose)throw TypeError("Symbol.dispose is not defined.");o=t[Symbol.dispose],r&&(n=o)}if("function"!=typeof o)throw TypeError("Object not disposable.");n&&(o=function(){try{n.call(this)}catch(e){return Promise.reject(e)}}),e.stack.push({value:t,dispose:o,async:r})}else r&&e.stack.push({async:!0});return t}var q="function"==typeof SuppressedError?SuppressedError:function(e,t,r){var o=Error(r);return o.name="SuppressedError",o.error=e,o.suppressed=t,o};function j(e){function t(t){e.error=e.hasError?new q(t,e.error,"An error was suppressed during disposal."):t,e.hasError=!0}var r,o=0;return function n(){for(;r=e.stack.pop();)try{if(!r.async&&1===o)return o=0,e.stack.push(r),Promise.resolve().then(n);if(r.dispose){var i=r.dispose.call(r.value);if(r.async)return o|=2,Promise.resolve(i).then(n,function(e){return t(e),n()})}else o|=1}catch(e){t(e)}if(1===o)return e.hasError?Promise.reject(e.error):Promise.resolve();if(e.hasError)throw e.error}()}function B(e,t){return"string"==typeof e&&/^\.\.?\//.test(e)?e.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i,function(e,r,o,n,i){return r?t?".jsx":".js":!o||n&&i?o+n+"."+i.toLowerCase()+"js":e}):e}let M={__extends:r,__assign:o,__rest:n,__decorate:i,__param:a,__esDecorate:s,__runInitializers:c,__propKey:l,__setFunctionName:u,__metadata:p,__awaiter:d,__generator:h,__createBinding:y,__exportStar:f,__values:m,__read:w,__spread:b,__spreadArrays:g,__spreadArray:v,__await:C,__asyncGenerator:k,__asyncDelegator:x,__asyncValues:W,__makeTemplateObject:O,__importStar:R,__importDefault:S,__classPrivateFieldGet:E,__classPrivateFieldSet:T,__classPrivateFieldIn:P,__addDisposableResource:A,__disposeResources:j,__rewriteRelativeImportExtension:B};e.s(["__addDisposableResource",0,A,"__assign",()=>o,"__asyncDelegator",0,x,"__asyncGenerator",0,k,"__asyncValues",0,W,"__await",0,C,"__awaiter",0,d,"__classPrivateFieldGet",0,E,"__classPrivateFieldIn",0,P,"__classPrivateFieldSet",0,T,"__createBinding",0,y,"__decorate",0,i,"__disposeResources",0,j,"__esDecorate",0,s,"__exportStar",0,f,"__extends",0,r,"__generator",0,h,"__importDefault",0,S,"__importStar",0,R,"__makeTemplateObject",0,O,"__metadata",0,p,"__param",0,a,"__propKey",0,l,"__read",0,w,"__rest",0,n,"__rewriteRelativeImportExtension",0,B,"__runInitializers",0,c,"__setFunctionName",0,u,"__spread",0,b,"__spreadArray",0,v,"__spreadArrays",0,g,"__values",0,m,"default",0,M])},10572,(e,t,r)=>{"use strict";var o=e.r(14939),n="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t},i=o.useState,a=o.useEffect,s=o.useLayoutEffect,c=o.useDebugValue;function l(e){var t=e.getSnapshot;e=e.value;try{var r=t();return!n(e,r)}catch(e){return!0}}var u="u"<typeof window||void 0===window.document||void 0===window.document.createElement?function(e,t){return t()}:function(e,t){var r=t(),o=i({inst:{value:r,getSnapshot:t}}),n=o[0].inst,u=o[1];return s(function(){n.value=r,n.getSnapshot=t,l(n)&&u({inst:n})},[e,r,t]),a(function(){return l(n)&&u({inst:n}),e(function(){l(n)&&u({inst:n})})},[e]),c(r),r};r.useSyncExternalStore=void 0!==o.useSyncExternalStore?o.useSyncExternalStore:u},93991,(e,t,r)=>{"use strict";e.i(20145),t.exports=e.r(10572)},4241,(e,t,r)=>{"use strict";var o=e.r(14939),n=e.r(93991),i="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t},a=n.useSyncExternalStore,s=o.useRef,c=o.useEffect,l=o.useMemo,u=o.useDebugValue;r.useSyncExternalStoreWithSelector=function(e,t,r,o,n){var p=s(null);if(null===p.current){var d={hasValue:!1,value:null};p.current=d}else d=p.current;var h=a(e,(p=l(function(){function e(e){if(!c){if(c=!0,a=e,e=o(e),void 0!==n&&d.hasValue){var t=d.value;if(n(t,e))return s=t}return s=e}if(t=s,i(a,e))return t;var r=o(e);return void 0!==n&&n(t,r)?(a=e,t):(a=e,s=r)}var a,s,c=!1,l=void 0===r?null:r;return[function(){return e(t())},null===l?void 0:function(){return e(l())}]},[t,r,o,n]))[0],p[1]);return c(function(){d.hasValue=!0,d.value=h},[h]),u(h),h}},23859,(e,t,r)=>{"use strict";e.i(20145),t.exports=e.r(4241)},69539,e=>{"use strict";var t=e.i(47144);e.s(["custom",0,function(e,r={}){let{key:o="custom",methods:n,name:i="Custom Provider",retryDelay:a}=r;return({retryCount:s})=>(0,t.createTransport)({key:o,methods:n,name:i,request:e.request.bind(e),retryCount:r.retryCount??s,retryDelay:a,type:"custom"})}])},27631,99550,e=>{"use strict";var t=e.i(77259),r=e.i(26665),o=e.i(38619),n=e.i(73536),i=e.i(8599),a=e.i(88450);let s={current:0,take(){return this.current++},reset(){this.current=0}};function c(e,r={}){let{url:o,headers:u}=function(e){try{let t=new URL(e),r=(()=>{if(t.username){let e=`${decodeURIComponent(t.username)}:${decodeURIComponent(t.password)}`;return t.username="",t.password="",{url:t.toString(),headers:{Authorization:`Basic ${btoa(e)}`}}}})();return{url:t.toString(),...r}}catch{return{url:e}}}(e);return{async request(e){let{body:c,fetchFn:p=r.fetchFn??fetch,maxResponseBodySize:d=r.maxResponseBodySize??0xa00000,onRequest:h=r.onRequest,onResponse:y=r.onResponse,timeout:f=r.timeout??1e4}=e,m={...r.fetchOptions??{},...e.fetchOptions??{}},{headers:w,method:b,signal:g}=m;try{let e,r=await (0,i.withTimeout)(async({signal:e})=>{let t={...m,body:Array.isArray(c)?(0,a.stringify)(c.map(e=>({jsonrpc:"2.0",id:e.id??s.take(),...e}))):(0,a.stringify)({jsonrpc:"2.0",id:c.id??s.take(),...c}),headers:{...u,"Content-Type":"application/json",...w},method:b||"POST",signal:g||(f>0?e:null)},r=new Request(o,t),n=await h?.(r,t)??{...t,url:o};return await p(n.url??o,n)},{errorInstance:new t.TimeoutError({body:c,url:o}),timeout:f,signal:!0});y&&await y(r);let n=await l(r,{maxResponseBodySize:d});if(r.headers.get("Content-Type")?.startsWith("application/json"))e=JSON.parse(n);else{e=n;try{e=JSON.parse(e||"{}")}catch(t){if(r.ok)throw t;e={error:e}}}if(!r.ok){if("number"==typeof e.error?.code&&"string"==typeof e.error?.message)return e;throw new t.HttpRequestError({body:c,details:(0,a.stringify)(e.error)||r.statusText,headers:r.headers,status:r.status,url:o})}return e}catch(e){if(g?.aborted)throw(0,n.getAbortError)(g);if((0,n.isAbortError)(e)||e instanceof t.HttpRequestError||e instanceof t.ResponseBodyTooLargeError||e instanceof t.TimeoutError)throw e;throw new t.HttpRequestError({body:c,cause:e,url:o})}}}}async function l(e,{maxResponseBodySize:r}){if(!1===r)return e.text();let o=e.headers.get("Content-Length");if(o){let e=Number(o);if(e>r)throw new t.ResponseBodyTooLargeError({maxSize:r,size:e})}if(!e.body){let o=await e.text(),n=new TextEncoder().encode(o).length;if(n>r)throw new t.ResponseBodyTooLargeError({maxSize:r,size:n});return o}let n=e.body.getReader(),i=new TextDecoder,a="",s=0;try{for(;;){let{done:e,value:o}=await n.read();if(e)break;if((s+=o.byteLength)>r)throw await n.cancel(),new t.ResponseBodyTooLargeError({maxSize:r,size:s});a+=i.decode(o,{stream:!0})}return a+=i.decode()}finally{n.releaseLock()}}e.s(["getHttpRpcClient",0,c],99550);var u=e.i(47144);let p=0,d=new WeakMap;e.s(["http",0,function(e,n={}){let{batch:i,fetchFn:a,fetchOptions:s,key:l="http",maxResponseBodySize:h,methods:y,name:f="HTTP JSON-RPC",onFetchRequest:m,onFetchResponse:w,retryDelay:b,raw:g}=n;return({chain:v,retryCount:C,timeout:k})=>{let{batchSize:x=1e3,wait:W=0}="object"==typeof i?i:{},O=n.retryCount??C,_=k??n.timeout??1e4,I=e||v?.rpcUrls.default.http[0];if(!I)throw new r.UrlRequiredError;let R=c(I,{fetchFn:a,fetchOptions:s,maxResponseBodySize:h,onRequest:m,onResponse:w,timeout:_});return(0,u.createTransport)({key:l,methods:y,name:f,async request({method:e,params:r},n){let a={method:e,params:r},s=n?.signal?{signal:n.signal}:void 0,{schedule:c}=(0,o.createBatchScheduler)({id:`${I}.${function(e){if(!e)return"default";let t=d.get(e);if(void 0!==t)return t;let r=p++;return d.set(e,r),r}(n?.signal)}`,wait:W,shouldSplitBatch:e=>e.length>x,fn:e=>R.request({body:e,fetchOptions:s}),sort:(e,t)=>e.id-t.id}),l=async e=>i?c(e):[await R.request({body:e,fetchOptions:s})],[{error:u,result:h}]=await l(a);if(g)return{error:u,result:h};if(u)throw new t.RpcRequestError({body:a,error:u,url:I});return h},retryCount:O,retryDelay:b,timeout:_,type:"http"},{fetchOptions:s,url:I})}}],27631)},26665,e=>{"use strict";var t=e.i(69203);class r extends t.BaseError{constructor(){super("No URL was provided to the Transport. Please provide a valid RPC URL to the Transport.",{docsPath:"/docs/clients/intro",name:"UrlRequiredError"})}}e.s(["UrlRequiredError",0,r])},8599,e=>{"use strict";var t=e.i(73536);e.s(["withTimeout",0,function(e,{errorInstance:r=Error("timed out"),timeout:o,signal:n}){return new Promise((i,a)=>{(async()=>{let s,c=new AbortController;try{o>0&&(s=setTimeout(()=>{n?c.abort():a(r)},o)),i(await e({signal:c?.signal||null}))}catch(e){if(c?.signal.aborted&&(0,t.isAbortError)(e))return void a(r);a(e)}finally{clearTimeout(s)}})()})}])},83351,79834,e=>{"use strict";var t=e.i(60010),r=e.i(79358),o=e.i(90090),n=e.i(64623);e.s(["hashMessage",0,function(e,i){let a,s;return(0,t.keccak256)((a="string"==typeof e?(0,n.stringToHex)(e):"string"==typeof e.raw?e.raw:(0,n.bytesToHex)(e.raw),s=(0,n.stringToHex)(`\x19Ethereum Signed Message:
${(0,o.size)(a)}`),(0,r.concat)([s,a])),i)}],83351);var i=e.i(43979),a=e.i(14539),s=e.i(88099),c=e.i(88450),l=e.i(69203);class u extends l.BaseError{constructor({domain:e}){super(`Invalid domain "${(0,c.stringify)(e)}".`,{metaMessages:["Must be a valid EIP-712 domain."]})}}class p extends l.BaseError{constructor({primaryType:e,types:t}){super(`Invalid primary type \`${e}\` must be one of \`${JSON.stringify(Object.keys(t))}\`.`,{docsPath:"/api/glossary/Errors#typeddatainvalidprimarytypeerror",metaMessages:["Check that the primary type is a key in `types`."]})}}class d extends l.BaseError{constructor({type:e}){super(`Struct type "${e}" is invalid.`,{metaMessages:["Struct type must not be a Solidity type."],name:"InvalidStructTypeError"})}}class h extends l.BaseError{constructor({type:e}){const t=e.replace(/^(u?int)/,"$&256");super(`Type "${e}" is not a valid EIP-712 type.`,{metaMessages:[`Use "${t}" instead.`],name:"InvalidTypedDataTypeError"})}}var y=e.i(16680),f=e.i(42307);function m({data:e,primaryType:r,types:o}){let a=function e({data:r,primaryType:o,types:a}){let s=[{type:"bytes32"}],c=[function({primaryType:e,types:r}){let o=(0,n.toHex)(function({primaryType:e,types:t}){let r="",o=function e({primaryType:t,types:r},o=new Set){let n=t.match(/^\w*/u),i=n?.[0];if(o.has(i)||void 0===r[i])return o;for(let t of(o.add(i),r[i]))e({primaryType:t.type,types:r},o);return o}({primaryType:e,types:t});for(let n of(o.delete(e),[e,...Array.from(o).sort()]))r+=`${n}(${t[n].map(({name:e,type:t})=>`${t} ${e}`).join(",")})`;return r}({primaryType:e,types:r}));return(0,t.keccak256)(o)}({primaryType:o,types:a})];for(let l of a[o]){let[o,u]=function r({types:o,name:a,type:s,value:c}){if(void 0!==o[s])return[{type:"bytes32"},(0,t.keccak256)(e({data:c,primaryType:s,types:o}))];if("bytes"===s)return[{type:"bytes32"},(0,t.keccak256)(c)];if("string"===s)return[{type:"bytes32"},(0,t.keccak256)((0,n.toHex)(c))];if(s.lastIndexOf("]")===s.length-1){let e=s.slice(0,s.lastIndexOf("[")),n=c.map(t=>r({name:a,type:e,types:o,value:t}));return[{type:"bytes32"},(0,t.keccak256)((0,i.encodeAbiParameters)(n.map(([e])=>e),n.map(([,e])=>e)))]}return[{type:s},c]}({types:a,name:l.name,type:l.type,value:r[l.name]});s.push(o),c.push(u)}return(0,i.encodeAbiParameters)(s,c)}({data:e,primaryType:r,types:o});return(0,t.keccak256)(a)}e.s(["hashTypedData",0,function(e){let{domain:i={},message:c,primaryType:l}=e,w={EIP712Domain:function({domain:e}){return["string"==typeof e?.name&&{name:"name",type:"string"},e?.version&&{name:"version",type:"string"},("number"==typeof e?.chainId||"bigint"==typeof e?.chainId)&&{name:"chainId",type:"uint256"},e?.verifyingContract&&{name:"verifyingContract",type:"address"},e?.salt&&{name:"salt",type:"bytes32"}].filter(Boolean)}({domain:i}),...e.types};!function(e){let{domain:t,message:r,primaryType:i,types:c}=e,l=(e,t)=>{for(let r of e){let{name:e,type:i}=r,u=t[e],p=i.replace(/(\[[0-9]*\])+$/,"");if("int"===p||"uint"===p)throw new h({type:i});let m=i.match(f.integerRegex);if(m&&("number"==typeof u||"bigint"==typeof u)){let[e,t,r]=m;(0,n.numberToHex)(u,{signed:"int"===t,size:Number.parseInt(r,10)/8})}if("address"===i&&"string"==typeof u&&!(0,y.isAddress)(u))throw new s.InvalidAddressError({address:u});let w=i.match(f.bytesRegex);if(w){let[e,t]=w;if(t&&(0,o.size)(u)!==Number.parseInt(t,10))throw new a.BytesSizeMismatchError({expectedSize:Number.parseInt(t,10),givenSize:(0,o.size)(u)})}let b=c[i];b&&(function(e){if("address"===e||"bool"===e||"string"===e||e.startsWith("bytes")||e.startsWith("uint")||e.startsWith("int"))throw new d({type:e})}(i),l(b,u))}};if(c.EIP712Domain&&t){if("object"!=typeof t)throw new u({domain:t});l(c.EIP712Domain,t)}if("EIP712Domain"!==i)if(c[i])l(c[i],r);else throw new p({primaryType:i,types:c})}({domain:i,message:c,primaryType:l,types:w});let b=["0x1901"];return i&&b.push(function({domain:e,types:t}){return m({data:e,primaryType:"EIP712Domain",types:t})}({domain:i,types:w})),"EIP712Domain"!==l&&b.push(m({data:c,primaryType:l,types:w})),(0,t.keccak256)((0,r.concat)(b))}],79834)},10056,61977,36932,47164,96051,51221,32162,16269,97245,24922,90698,6737,68971,1591,e=>{"use strict";function t(e){let t=e.state.current,r=e.state.connections.get(t),o=r?.accounts,n=o?.[0],i=e.chains.find(e=>e.id===r?.chainId),a=e.state.status;switch(a){case"connected":return{address:n,addresses:o,chain:i,chainId:r?.chainId,connector:r?.connector,isConnected:!0,isConnecting:!1,isDisconnected:!1,isReconnecting:!1,status:a};case"reconnecting":return{address:n,addresses:o,chain:i,chainId:r?.chainId,connector:r?.connector,isConnected:!!n,isConnecting:!1,isDisconnected:!1,isReconnecting:!0,status:a};case"connecting":return{address:n,addresses:o,chain:i,chainId:r?.chainId,connector:r?.connector,isConnected:!1,isConnecting:!0,isDisconnected:!1,isReconnecting:!1,status:a};case"disconnected":return{address:void 0,addresses:void 0,chain:void 0,chainId:void 0,connector:void 0,isConnected:!1,isConnecting:!1,isDisconnected:!0,isReconnecting:!1,status:a}}}function r(e,t){if(e===t)return!0;if(e&&t&&"object"==typeof e&&"object"==typeof t){let o,n;if(e.constructor!==t.constructor)return!1;if(Array.isArray(e)&&Array.isArray(t)){if((o=e.length)!==t.length)return!1;for(n=o;0!=n--;)if(!r(e[n],t[n]))return!1;return!0}if("function"==typeof e.valueOf&&e.valueOf!==Object.prototype.valueOf)return e.valueOf()===t.valueOf();if("function"==typeof e.toString&&e.toString!==Object.prototype.toString)return e.toString()===t.toString();let i=Object.keys(e);if((o=i.length)!==Object.keys(t).length)return!1;for(n=o;0!=n--;)if(!Object.hasOwn(t,i[n]))return!1;for(n=o;0!=n--;){let o=i[n];if(o&&!r(e[o],t[o]))return!1}return!0}return e!=e&&t!=t}function o(e,o){let{onChange:n}=o;return e.subscribe(()=>t(e),n,{equalityFn(e,t){let{connector:o,...n}=e,{connector:i,...a}=t;return r(n,a)&&o?.id===i?.id&&o?.uid===i?.uid}})}e.s(["deepEqual",0,r],61977),e.s(["watchAccount",0,o],36932);var n,i,a=e.i(14939);let s=!1;async function c(e,t={}){let r;if(s)return[];s=!0,e.setState(e=>({...e,status:e.current?"reconnecting":"connecting"}));let o=[];if(t.connectors?.length)for(let r of t.connectors){let t;t="function"==typeof r?e._internal.connectors.setup(r):r,o.push(t)}else o.push(...e.connectors);try{r=await e.storage?.getItem("recentConnectorId")}catch{}let n={};for(let[,t]of e.state.connections)n[t.connector.id]=1;r&&(n[r]=0);let i=Object.keys(n).length>0?[...o].sort((e,t)=>(n[e.id]??10)-(n[t.id]??10)):o,a=!1,l=[],u=[];for(let t of i){let r=await t.getProvider().catch(()=>void 0);if(!r||u.some(e=>e===r)||!await t.isAuthorized())continue;let o=await t.connect({isReconnecting:!0}).catch(()=>null);o&&(t.emitter.off("connect",e._internal.events.connect),t.emitter.on("change",e._internal.events.change),t.emitter.on("disconnect",e._internal.events.disconnect),e.setState(e=>{let r=new Map(a?e.connections:new Map).set(t.uid,{accounts:o.accounts,chainId:o.chainId,connector:t});return{...e,current:a?e.current:t.uid,connections:r}}),l.push({accounts:o.accounts,chainId:o.chainId,connector:t}),u.push(r),a=!0)}return("reconnecting"===e.state.status||"connecting"===e.state.status)&&(a?e.setState(e=>({...e,status:"connected"})):e.setState(e=>({...e,connections:new Map,current:null,status:"disconnected"}))),s=!1,l}function l(e){let{children:t,config:r,initialState:o,reconnectOnMount:n=!0}=e,{onMount:i}=function(e,t){let{initialState:r,reconnectOnMount:o}=t;return r&&!e._internal.store.persist.hasHydrated()&&e.setState({...r,chainId:e.chains.some(e=>e.id===r.chainId)?r.chainId:e.chains[0].id,connections:o?r.connections:new Map,status:o?"reconnecting":"disconnected"}),{async onMount(){e._internal.ssr&&(await e._internal.store.persist.rehydrate(),e._internal.mipd&&e._internal.connectors.setState(t=>{let r=new Set;for(let e of t??[])if(e.rdns)for(let t of Array.isArray(e.rdns)?e.rdns:[e.rdns])r.add(t);let o=[];for(let t of e._internal.mipd?.getProviders()??[]){if(r.has(t.info.rdns))continue;let n=e._internal.connectors.providerDetailToConnector(t),i=e._internal.connectors.setup(n);o.push(i)}return[...t,...o]})),o?c(e):e.storage&&e.setState(e=>({...e,connections:new Map}))}}}(r,{initialState:o,reconnectOnMount:n});r._internal.ssr||i();let s=(0,a.useRef)(!0);return(0,a.useEffect)(()=>{if(s.current&&r._internal.ssr)return i(),()=>{s.current=!1}},[]),t}let u=(0,a.createContext)(void 0);e.s(["WagmiContext",0,u,"WagmiProvider",0,function(e){let{children:t,config:r}=e;return(0,a.createElement)(l,e,(0,a.createElement)(u.Provider,{value:r},t))}],47164);let p="2.22.1";e.s(["version",0,p],96051);var d=function(e,t,r,o){if("a"===r&&!o)throw TypeError("Private accessor was defined without a getter");if("function"==typeof t?e!==t||!o:!t.has(e))throw TypeError("Cannot read private member from an object whose class did not declare it");return"m"===r?o:"a"===r?o.call(e):o?o.value:t.get(e)};class h extends Error{get docsBaseUrl(){return"https://wagmi.sh/core"}get version(){return`@wagmi/core@${p}`}constructor(e,t={}){super(),n.add(this),Object.defineProperty(this,"details",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"docsPath",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"metaMessages",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"shortMessage",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"name",{enumerable:!0,configurable:!0,writable:!0,value:"WagmiCoreError"});const r=t.cause instanceof h?t.cause.details:t.cause?.message?t.cause.message:t.details,o=t.cause instanceof h&&t.cause.docsPath||t.docsPath;this.message=[e||"An error occurred.","",...t.metaMessages?[...t.metaMessages,""]:[],...o?[`Docs: ${this.docsBaseUrl}${o}.html${t.docsSlug?`#${t.docsSlug}`:""}`]:[],...r?[`Details: ${r}`]:[],`Version: ${this.version}`].join("\n"),t.cause&&(this.cause=t.cause),this.details=r,this.docsPath=o,this.metaMessages=t.metaMessages,this.shortMessage=e}walk(e){return d(this,n,"m",i).call(this,this,e)}}n=new WeakSet,i=function e(t,r){return r?.(t)?t:t.cause?d(this,n,"m",e).call(this,t.cause,r):t},e.s(["BaseError",0,h],51221);class y extends h{constructor(){super(...arguments),Object.defineProperty(this,"name",{enumerable:!0,configurable:!0,writable:!0,value:"WagmiError"})}get docsBaseUrl(){return"https://wagmi.sh/react"}get version(){return"wagmi@2.19.5"}}class f extends y{constructor(){super("`useConfig` must be used within `WagmiProvider`.",{docsPath:"/api/WagmiProvider"}),Object.defineProperty(this,"name",{enumerable:!0,configurable:!0,writable:!0,value:"WagmiProviderNotFoundError"})}}function m(e={}){let t=e.config??(0,a.useContext)(u);if(!t)throw new f;return t}e.s(["useConfig",0,m],32162);var w=e.i(23859);let b=e=>"object"==typeof e&&!Array.isArray(e);e.s(["useAccount",0,function(e={}){let n=m(e);return function(e,t,o=t,n=r){let i=(0,a.useRef)([]),s=(0,w.useSyncExternalStoreWithSelector)(e,t,o,e=>e,(e,t)=>{if(b(e)&&b(t)&&i.current.length){for(let r of i.current)if(!n(e[r],t[r]))return!1;return!0}return n(e,t)});return(0,a.useMemo)(()=>{if(b(s)){let e={...s},t={};for(let[r,o]of Object.entries(e))t={...t,[r]:{configurable:!1,enumerable:!0,get:()=>(i.current.includes(r)||i.current.push(r),o)}};return Object.defineProperties(e,t),e}return s},[s])}(e=>o(n,{onChange:e}),()=>t(n))}],10056);var g=e.i(91531);function v(e,t,r){let o=e[t.name];if("function"==typeof o)return o;let n=e[r];return"function"==typeof n?n:r=>t(e,r)}e.s(["getAction",0,v],16269),e.s(["readContract",0,function(e,t){let{chainId:r,...o}=t;return v(e.getClient({chainId:r}),g.readContract,"readContract")(o)}],97245);var C=e.i(32186);function k(e){return JSON.stringify(e,(e,t)=>!function(e){if(!x(e))return!1;let t=e.constructor;if(void 0===t)return!0;let r=t.prototype;return!!x(r)&&!!r.hasOwnProperty("isPrototypeOf")}(t)?"bigint"==typeof t?t.toString():t:Object.keys(t).sort().reduce((e,r)=>(e[r]=t[r],e),{}))}function x(e){return"[object Object]"===Object.prototype.toString.call(e)}e.s(["filterQueryOptions",0,function(e){let{_defaulted:t,behavior:r,gcTime:o,initialData:n,initialDataUpdatedAt:i,maxPages:a,meta:s,networkMode:c,queryFn:l,queryHash:u,queryKey:p,queryKeyHashFn:d,retry:h,retryDelay:y,structuralSharing:f,getPreviousPageParam:m,getNextPageParam:w,initialPageParam:b,_optimisticResults:g,enabled:v,notifyOnChangeProps:C,placeholderData:k,refetchInterval:x,refetchIntervalInBackground:W,refetchOnMount:O,refetchOnReconnect:_,refetchOnWindowFocus:I,retryOnMount:R,select:S,staleTime:E,suspense:T,throwOnError:P,config:A,connector:q,query:j,...B}=e;return B},"hashFn",0,k,"structuralSharing",0,function(e,t){return(0,C.replaceEqualDeep)(e,t)}],24922);var W=e.i(48541),O=e.i(18486),_=e.i(54891),I=e.i(33461),R=e.i(49509),S=e.i(86884),E=class extends S.Removable{#e;#t;#r;#o;constructor(e){super(),this.#e=e.client,this.mutationId=e.mutationId,this.#r=e.mutationCache,this.#t=[],this.state=e.state||T(),this.setOptions(e.options),this.scheduleGc()}setOptions(e){this.options=e,this.updateGcTime(this.options.gcTime)}get meta(){return this.options.meta}addObserver(e){this.#t.includes(e)||(this.#t.push(e),this.clearGcTimeout(),this.#r.notify({type:"observerAdded",mutation:this,observer:e}))}removeObserver(e){this.#t=this.#t.filter(t=>t!==e),this.scheduleGc(),this.#r.notify({type:"observerRemoved",mutation:this,observer:e})}optionalRemove(){this.#t.length||("pending"===this.state.status?this.scheduleGc():this.#r.remove(this))}continue(){return this.#o?.continue()??("pending"===this.state.status?this.execute(this.state.variables):Promise.resolve())}async execute(e){let t=()=>{this.#n({type:"continue"})},r={client:this.#e,meta:this.options.meta,mutationKey:this.options.mutationKey},o=this.#o=(0,R.createRetryer)({fn:()=>this.options.mutationFn?this.options.mutationFn(e,r):Promise.reject(Error("No mutationFn found")),onFail:(e,t)=>{this.#n({type:"failed",failureCount:e,error:t})},onPause:()=>{this.#n({type:"pause"})},onContinue:t,retry:this.options.retry??0,retryDelay:this.options.retryDelay,networkMode:this.options.networkMode,canRun:()=>this.#r.canRun(this)}),n="pending"===this.state.status,i=!o.canStart();try{if(n)t();else{this.#n({type:"pending",variables:e,isPaused:i}),this.#r.config.onMutate&&await this.#r.config.onMutate(e,this,r);let t=await this.options.onMutate?.(e,r);t!==this.state.context&&this.#n({type:"pending",context:t,variables:e,isPaused:i})}let a=await o.start();return await this.#r.config.onSuccess?.(a,e,this.state.context,this,r),await this.options.onSuccess?.(a,e,this.state.context,r),await this.#r.config.onSettled?.(a,null,this.state.variables,this.state.context,this,r),await this.options.onSettled?.(a,null,e,this.state.context,r),this.#n({type:"success",data:a}),a}catch(t){try{await this.#r.config.onError?.(t,e,this.state.context,this,r)}catch(e){Promise.reject(e)}try{await this.options.onError?.(t,e,this.state.context,r)}catch(e){Promise.reject(e)}try{await this.#r.config.onSettled?.(void 0,t,this.state.variables,this.state.context,this,r)}catch(e){Promise.reject(e)}try{await this.options.onSettled?.(void 0,t,e,this.state.context,r)}catch(e){Promise.reject(e)}throw this.#n({type:"error",error:t}),t}finally{this.#o===o&&(this.#o=void 0),this.#r.runNext(this)}}#n(e){this.state=(t=>{switch(e.type){case"failed":return{...t,failureCount:e.failureCount,failureReason:e.error};case"pause":return{...t,isPaused:!0};case"continue":return{...t,isPaused:!1};case"pending":return{...t,context:e.context,data:void 0,failureCount:0,failureReason:null,error:null,isPaused:e.isPaused,status:"pending",variables:e.variables,submittedAt:Date.now()};case"success":return{...t,data:e.data,failureCount:0,failureReason:null,error:null,status:"success",isPaused:!1};case"error":return{...t,data:void 0,error:e.error,failureCount:t.failureCount+1,failureReason:e.error,isPaused:!1,status:"error"}}})(this.state),I.notifyManager.batch(()=>{this.#t.forEach(t=>{t.onMutationUpdate(e)}),this.#r.notify({mutation:this,type:"updated",action:e})})}};function T(){return{context:void 0,data:void 0,error:null,failureCount:0,failureReason:null,isPaused:!1,status:"idle",variables:void 0,submittedAt:0}}e.s(["Mutation",0,E,"getDefaultState",0,T],90698);var P=class extends _.Subscribable{#e;#i=void 0;#a;#s;constructor(e,t){super(),this.#e=e,this.setOptions(t),this.bindMethods(),this.#c()}bindMethods(){this.mutate=this.mutate.bind(this),this.reset=this.reset.bind(this)}setOptions(e){let t=this.options;this.options=this.#e.defaultMutationOptions(e),(0,C.shallowEqualObjects)(this.options,t)||this.#e.getMutationCache().notify({type:"observerOptionsUpdated",mutation:this.#a,observer:this}),t?.mutationKey&&this.options.mutationKey&&(0,C.hashKey)(t.mutationKey)!==(0,C.hashKey)(this.options.mutationKey)?this.reset():this.#a?.state.status==="pending"&&this.#a.setOptions(this.options)}onSubscribe(){1===this.listeners.size&&this.#a&&(this.#a.addObserver(this),this.#c())}onUnsubscribe(){this.hasListeners()||this.#a?.removeObserver(this)}onMutationUpdate(e){this.#c(),this.#l(e)}getCurrentResult(){return this.#i}reset(){this.#a?.removeObserver(this),this.#a=void 0,this.#c(),this.#l()}mutate(e,t){return this.#s=t,this.#a?.removeObserver(this),this.#a=this.#e.getMutationCache().build(this.#e,this.options),this.#a.addObserver(this),this.#a.execute(e)}#c(){let e=this.#a?.state??T();this.#i={...e,isPending:"pending"===e.status,isSuccess:"success"===e.status,isError:"error"===e.status,isIdle:"idle"===e.status,mutate:this.mutate,reset:this.reset}}#l(e){I.notifyManager.batch(()=>{if(this.#s&&this.hasListeners()){let t=this.#i.variables,r=this.#i.context,o={client:this.#e,meta:this.options.meta,mutationKey:this.options.mutationKey};if(e?.type==="success"){try{this.#s.onSuccess?.(e.data,t,r,o)}catch(e){Promise.reject(e)}try{this.#s.onSettled?.(e.data,null,t,r,o)}catch(e){Promise.reject(e)}}else if(e?.type==="error"){try{this.#s.onError?.(e.error,t,r,o)}catch(e){Promise.reject(e)}try{this.#s.onSettled?.(void 0,e.error,t,r,o)}catch(e){Promise.reject(e)}}}this.listeners.forEach(e=>{e(this.#i)})})}};function A(e){return e.state.chainId}e.s(["useMutation",0,function(e,t){let r=(0,O.useQueryClient)(t),[o]=a.useState(()=>new P(r,e));a.useEffect(()=>{o.setOptions(e)},[o,e]);let n=a.useSyncExternalStore(a.useCallback(e=>o.subscribe(I.notifyManager.batchCalls(e)),[o]),()=>o.getCurrentResult(),()=>o.getCurrentResult()),i=a.useCallback((...e)=>{o.mutate(e[0],e[1]).catch(C.noop)},[o]);if(n.error&&(0,C.shouldThrowError)(o.options.throwOnError,[n.error]))throw n.error;return{...n,mutate:i,mutateAsync:n.mutate}}],6737),e.s(["useQuery",0,function(e){let t=(0,W.useQuery)({...e,queryKeyHashFn:k});return t.queryKey=e.queryKey,t}],68971),e.s(["useChainId",0,function(e={}){let t=m(e);return(0,a.useSyncExternalStore)(e=>(function(e,t){let{onChange:r}=t;return e.subscribe(e=>e.chainId,r)})(t,{onChange:e}),()=>A(t),()=>A(t))}],1591)},79265,e=>{"use strict";var t=e.i(45267),r=e.i(75906),o=e.i(13991),n=e.i(74274),i=e.i(16269);let a={ether:-18,gwei:-9};function s(e){return"number"==typeof e?e:"wei"===e?0:Math.abs(a[e])}var c=e.i(19858),l=e.i(54293);async function u(e,t){let{allowFailure:r=!0,chainId:o,contracts:n,...a}=t,s=e.getClient({chainId:o});return(0,i.getAction)(s,l.multicall,"multicall")({allowFailure:r,contracts:n,...a})}var p=e.i(97245);async function d(e,t){let{allowFailure:r=!0,blockNumber:o,blockTag:n,...i}=t,a=t.contracts;try{let t={};for(let[r,o]of a.entries()){let n=o.chainId??e.state.chainId;t[n]||(t[n]=[]),t[n]?.push({contract:o,index:r})}let s=(await Promise.all(Object.entries(t).map(([t,a])=>u(e,{...i,allowFailure:r,blockNumber:o,blockTag:n,chainId:Number.parseInt(t,10),contracts:a.map(({contract:e})=>e)})))).flat(),c=Object.values(t).flatMap(e=>e.map(({index:e})=>e));return s.reduce((e,t,r)=>(e&&(e[c[r]]=t),e),[])}catch(i){if(i instanceof c.ContractFunctionExecutionError)throw i;let t=()=>a.map(t=>(0,p.readContract)(e,{...t,blockNumber:o,blockTag:n}));if(r)return(await Promise.allSettled(t())).map(e=>"fulfilled"===e.status?{result:e.value,status:"success"}:{error:e.reason,result:void 0,status:"failure"});return await Promise.all(t())}}async function h(e,a){let{address:c,blockNumber:l,blockTag:u,chainId:p,token:d,unit:h="ether"}=a;if(d)try{return await y(e,{balanceAddress:c,chainId:p,symbolType:"string",tokenAddress:d})}catch(t){if("ContractFunctionExecutionError"===t.name){let t=await y(e,{balanceAddress:c,chainId:p,symbolType:"bytes32",tokenAddress:d}),n=(0,r.hexToString)((0,o.trim)(t.symbol,{dir:"right"}));return{...t,symbol:n}}throw t}let f=e.getClient({chainId:p}),m=(0,i.getAction)(f,n.getBalance,"getBalance"),w=await m(l?{address:c,blockNumber:l}:{address:c,blockTag:u}),b=e.chains.find(e=>e.id===p)??f.chain;return{decimals:b.nativeCurrency.decimals,formatted:(0,t.formatUnits)(w,s(h)),symbol:b.nativeCurrency.symbol,value:w}}async function y(e,r){let{balanceAddress:o,chainId:n,symbolType:i,tokenAddress:a,unit:c}=r,l={abi:[{type:"function",name:"balanceOf",stateMutability:"view",inputs:[{type:"address"}],outputs:[{type:"uint256"}]},{type:"function",name:"decimals",stateMutability:"view",inputs:[],outputs:[{type:"uint8"}]},{type:"function",name:"symbol",stateMutability:"view",inputs:[],outputs:[{type:i}]}],address:a},[u,p,h]=await d(e,{allowFailure:!1,contracts:[{...l,functionName:"balanceOf",args:[o],chainId:n},{...l,functionName:"decimals",chainId:n},{...l,functionName:"symbol",chainId:n}]}),y=(0,t.formatUnits)(u??"0",s(c??p));return{decimals:p,formatted:y,symbol:h,value:u}}var f=e.i(24922),m=e.i(68971),w=e.i(1591),b=e.i(32162);e.s(["useBalance",0,function(e={}){let{address:t,query:r={}}=e,o=(0,b.useConfig)(e),n=(0,w.useChainId)({config:o}),i=function(e,t={}){return{async queryFn({queryKey:t}){let{address:r,scopeKey:o,...n}=t[1];if(!r)throw Error("address is required");return await h(e,{...n,address:r})??null},queryKey:function(e={}){return["balance",(0,f.filterQueryOptions)(e)]}(t)}}(o,{...e,chainId:e.chainId??n}),a=!!(t&&(r.enabled??!0));return(0,m.useQuery)({...r,...i,enabled:a})}],79265)}]);