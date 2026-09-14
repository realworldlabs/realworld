(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,90167,t=>{"use strict";t.i(95126);var e=t.i(41449),r=t.i(18444);t.i(75353);var i=t.i(1908),o=t.i(76425),n=t.i(97882),a=t.i(12906),l=t.i(53519);t.i(51203);var s=t.i(73883);t.i(51456);var c=e,u=t.i(72072);t.i(83601);var d=t.i(18153),p=t.i(68761),h=t.i(37292),g=t.i(89344),w=e;t.i(43573),t.i(83733),t.i(12371);var f=t.i(30333),m=e;t.i(56702);var b=e;t.i(48690);var v=t.i(40697);let y=v.css`
  :host {
    position: relative;
    background-color: var(--wui-color-gray-glass-002);
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--local-size);
    height: var(--local-size);
    border-radius: inherit;
    border-radius: var(--local-border-radius);
  }

  :host > wui-flex {
    overflow: hidden;
    border-radius: inherit;
    border-radius: var(--local-border-radius);
  }

  :host::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: inherit;
    border: 1px solid var(--wui-color-gray-glass-010);
    pointer-events: none;
  }

  :host([name='Extension'])::after {
    border: 1px solid var(--wui-color-accent-glass-010);
  }

  :host([data-wallet-icon='allWallets']) {
    background-color: var(--wui-all-wallets-bg-100);
  }

  :host([data-wallet-icon='allWallets'])::after {
    border: 1px solid var(--wui-color-accent-glass-010);
  }

  wui-icon[data-parent-size='inherit'] {
    width: 75%;
    height: 75%;
    align-items: center;
  }

  wui-icon[data-parent-size='sm'] {
    width: 18px;
    height: 18px;
  }

  wui-icon[data-parent-size='md'] {
    width: 24px;
    height: 24px;
  }

  wui-icon[data-parent-size='lg'] {
    width: 42px;
    height: 42px;
  }

  wui-icon[data-parent-size='full'] {
    width: 100%;
    height: 100%;
  }

  :host > wui-icon-box {
    position: absolute;
    overflow: hidden;
    right: -1px;
    bottom: -2px;
    z-index: 1;
    border: 2px solid var(--wui-color-bg-150, #1e1f1f);
    padding: 1px;
  }
`;var x=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let C=class extends b.LitElement{constructor(){super(...arguments),this.size="md",this.name="",this.installed=!1,this.badgeSize="xs"}render(){let t="xxs";return t="lg"===this.size?"m":"md"===this.size?"xs":"xxs",this.style.cssText=`
       --local-border-radius: var(--wui-border-radius-${t});
       --local-size: var(--wui-wallet-image-size-${this.size});
   `,this.walletIcon&&(this.dataset.walletIcon=this.walletIcon),r.html`
      <wui-flex justifyContent="center" alignItems="center"> ${this.templateVisual()} </wui-flex>
    `}templateVisual(){return this.imageSrc?r.html`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`:this.walletIcon?r.html`<wui-icon
        data-parent-size="md"
        size="md"
        color="inherit"
        name=${this.walletIcon}
      ></wui-icon>`:r.html`<wui-icon
      data-parent-size=${this.size}
      size="inherit"
      color="inherit"
      name="walletPlaceholder"
    ></wui-icon>`}};C.styles=[f.elementStyles,f.resetStyles,y],x([(0,u.property)()],C.prototype,"size",void 0),x([(0,u.property)()],C.prototype,"name",void 0),x([(0,u.property)()],C.prototype,"imageSrc",void 0),x([(0,u.property)()],C.prototype,"walletIcon",void 0),x([(0,u.property)({type:Boolean})],C.prototype,"installed",void 0),x([(0,u.property)()],C.prototype,"badgeSize",void 0),C=x([(0,s.customElement)("wui-wallet-image")],C);let $=v.css`
  :host {
    position: relative;
    border-radius: var(--wui-border-radius-xxs);
    width: 40px;
    height: 40px;
    overflow: hidden;
    background: var(--wui-color-gray-glass-002);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--wui-spacing-4xs);
    padding: 3.75px !important;
  }

  :host::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: inherit;
    border: 1px solid var(--wui-color-gray-glass-010);
    pointer-events: none;
  }

  :host > wui-wallet-image {
    width: 14px;
    height: 14px;
    border-radius: var(--wui-border-radius-5xs);
  }

  :host > wui-flex {
    padding: 2px;
    position: fixed;
    overflow: hidden;
    left: 34px;
    bottom: 8px;
    background: var(--dark-background-150, #1e1f1f);
    border-radius: 50%;
    z-index: 2;
    display: flex;
  }
`;var E=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let k=class extends m.LitElement{constructor(){super(...arguments),this.walletImages=[]}render(){let t=this.walletImages.length<4;return r.html`${this.walletImages.slice(0,4).map(({src:t,walletName:e})=>r.html`
            <wui-wallet-image
              size="inherit"
              imageSrc=${t}
              name=${(0,d.ifDefined)(e)}
            ></wui-wallet-image>
          `)}
      ${t?[...Array(4-this.walletImages.length)].map(()=>r.html` <wui-wallet-image size="inherit" name=""></wui-wallet-image>`):null}
      <wui-flex>
        <wui-icon-box
          size="xxs"
          iconSize="xxs"
          iconcolor="success-100"
          backgroundcolor="success-100"
          icon="checkmark"
          background="opaque"
        ></wui-icon-box>
      </wui-flex>`}};k.styles=[f.resetStyles,$],E([(0,u.property)({type:Array})],k.prototype,"walletImages",void 0),k=E([(0,s.customElement)("wui-all-wallets-image")],k),t.i(45270);let R=v.css`
  button {
    column-gap: var(--wui-spacing-s);
    padding: 7px var(--wui-spacing-l) 7px var(--wui-spacing-xs);
    width: 100%;
    background-color: var(--wui-color-gray-glass-002);
    border-radius: var(--wui-border-radius-xs);
    color: var(--wui-color-fg-100);
  }

  button > wui-text:nth-child(2) {
    display: flex;
    flex: 1;
  }

  button:disabled {
    background-color: var(--wui-color-gray-glass-015);
    color: var(--wui-color-gray-glass-015);
  }

  button:disabled > wui-tag {
    background-color: var(--wui-color-gray-glass-010);
    color: var(--wui-color-fg-300);
  }

  wui-icon {
    color: var(--wui-color-fg-200) !important;
  }
`;var I=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let S=class extends w.LitElement{constructor(){super(...arguments),this.walletImages=[],this.imageSrc="",this.name="",this.tabIdx=void 0,this.installed=!1,this.disabled=!1,this.showAllWallets=!1,this.loading=!1,this.loadingSpinnerColor="accent-100"}render(){return r.html`
      <button ?disabled=${this.disabled} tabindex=${(0,d.ifDefined)(this.tabIdx)}>
        ${this.templateAllWallets()} ${this.templateWalletImage()}
        <wui-text variant="paragraph-500" color="inherit">${this.name}</wui-text>
        ${this.templateStatus()}
      </button>
    `}templateAllWallets(){return this.showAllWallets&&this.imageSrc?r.html` <wui-all-wallets-image .imageeSrc=${this.imageSrc}> </wui-all-wallets-image> `:this.showAllWallets&&this.walletIcon?r.html` <wui-wallet-image .walletIcon=${this.walletIcon} size="sm"> </wui-wallet-image> `:null}templateWalletImage(){return!this.showAllWallets&&this.imageSrc?r.html`<wui-wallet-image
        size="sm"
        imageSrc=${this.imageSrc}
        name=${this.name}
        .installed=${this.installed}
      ></wui-wallet-image>`:this.showAllWallets||this.imageSrc?null:r.html`<wui-wallet-image size="sm" name=${this.name}></wui-wallet-image>`}templateStatus(){return this.loading?r.html`<wui-loading-spinner
        size="lg"
        color=${this.loadingSpinnerColor}
      ></wui-loading-spinner>`:this.tagLabel&&this.tagVariant?r.html`<wui-tag variant=${this.tagVariant}>${this.tagLabel}</wui-tag>`:this.icon?r.html`<wui-icon color="inherit" size="sm" name=${this.icon}></wui-icon>`:null}};S.styles=[f.resetStyles,f.elementStyles,R],I([(0,u.property)({type:Array})],S.prototype,"walletImages",void 0),I([(0,u.property)()],S.prototype,"imageSrc",void 0),I([(0,u.property)()],S.prototype,"name",void 0),I([(0,u.property)()],S.prototype,"tagLabel",void 0),I([(0,u.property)()],S.prototype,"tagVariant",void 0),I([(0,u.property)()],S.prototype,"icon",void 0),I([(0,u.property)()],S.prototype,"walletIcon",void 0),I([(0,u.property)()],S.prototype,"tabIdx",void 0),I([(0,u.property)({type:Boolean})],S.prototype,"installed",void 0),I([(0,u.property)({type:Boolean})],S.prototype,"disabled",void 0),I([(0,u.property)({type:Boolean})],S.prototype,"showAllWallets",void 0),I([(0,u.property)({type:Boolean})],S.prototype,"loading",void 0),I([(0,u.property)({type:String})],S.prototype,"loadingSpinnerColor",void 0),S=I([(0,s.customElement)("wui-list-wallet")],S);var T=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let L=class extends c.LitElement{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=p.ConnectorController.state.connectors,this.count=o.ApiController.state.count,this.filteredCount=o.ApiController.state.filteredWallets.length,this.isFetchingRecommendedWallets=o.ApiController.state.isFetchingRecommendedWallets,this.unsubscribe.push(p.ConnectorController.subscribeKey("connectors",t=>this.connectors=t),o.ApiController.subscribeKey("count",t=>this.count=t),o.ApiController.subscribeKey("filteredWallets",t=>this.filteredCount=t.length),o.ApiController.subscribeKey("isFetchingRecommendedWallets",t=>this.isFetchingRecommendedWallets=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){let t=this.connectors.find(t=>"walletConnect"===t.id),{allWallets:e}=a.OptionsController.state;if(!t||"HIDE"===e||"ONLY_MOBILE"===e&&!n.CoreHelperUtil.isMobile())return null;let i=o.ApiController.state.featured.length,l=this.count+i,s=l<10?l:10*Math.floor(l/10),c=this.filteredCount>0?this.filteredCount:s,u=`${c}`;return this.filteredCount>0?u=`${this.filteredCount}`:c<l&&(u=`${c}+`),r.html`
      <wui-list-wallet
        name="All Wallets"
        walletIcon="allWallets"
        showAllWallets
        @click=${this.onAllWallets.bind(this)}
        tagLabel=${u}
        tagVariant="shade"
        data-testid="all-wallets"
        tabIdx=${(0,d.ifDefined)(this.tabIdx)}
        .loading=${this.isFetchingRecommendedWallets}
        loadingSpinnerColor=${this.isFetchingRecommendedWallets?"fg-300":"accent-100"}
      ></wui-list-wallet>
    `}onAllWallets(){h.EventsController.sendEvent({type:"track",event:"CLICK_ALL_WALLETS"}),g.RouterController.push("AllWallets")}};T([(0,u.property)()],L.prototype,"tabIdx",void 0),T([(0,i.state)()],L.prototype,"connectors",void 0),T([(0,i.state)()],L.prototype,"count",void 0),T([(0,i.state)()],L.prototype,"filteredCount",void 0),T([(0,i.state)()],L.prototype,"isFetchingRecommendedWallets",void 0),L=T([(0,s.customElement)("w3m-all-wallets-widget")],L);var O=e,A=e,P=t.i(82869),U=t.i(8215),j=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let D=class extends A.LitElement{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=p.ConnectorController.state.connectors,this.unsubscribe.push(p.ConnectorController.subscribeKey("connectors",t=>this.connectors=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){let t=this.connectors.filter(t=>"ANNOUNCED"===t.type);return t?.length?r.html`
      <wui-flex flexDirection="column" gap="xs">
        ${t.filter(U.ConnectorUtil.showConnector).map(t=>r.html`
              <wui-list-wallet
                imageSrc=${(0,d.ifDefined)(P.AssetUtil.getConnectorImage(t))}
                name=${t.name??"Unknown"}
                @click=${()=>this.onConnector(t)}
                tagVariant="success"
                tagLabel="installed"
                data-testid=${`wallet-selector-${t.id}`}
                .installed=${!0}
                tabIdx=${(0,d.ifDefined)(this.tabIdx)}
              >
              </wui-list-wallet>
            `)}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnector(t){"walletConnect"===t.id?n.CoreHelperUtil.isMobile()?g.RouterController.push("AllWallets"):g.RouterController.push("ConnectingWalletConnect"):g.RouterController.push("ConnectingExternal",{connector:t})}};j([(0,u.property)()],D.prototype,"tabIdx",void 0),j([(0,i.state)()],D.prototype,"connectors",void 0),D=j([(0,s.customElement)("w3m-connect-announced-widget")],D);var z=e,B=t.i(46328),W=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let N=class extends z.LitElement{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=p.ConnectorController.state.connectors,this.loading=!1,this.unsubscribe.push(p.ConnectorController.subscribeKey("connectors",t=>this.connectors=t)),n.CoreHelperUtil.isTelegram()&&n.CoreHelperUtil.isIos()&&(this.loading=!B.ConnectionController.state.wcUri,this.unsubscribe.push(B.ConnectionController.subscribeKey("wcUri",t=>this.loading=!t)))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){let{customWallets:t}=a.OptionsController.state;if(!t?.length)return this.style.cssText="display: none",null;let e=this.filterOutDuplicateWallets(t);return r.html`<wui-flex flexDirection="column" gap="xs">
      ${e.map(t=>r.html`
          <wui-list-wallet
            imageSrc=${(0,d.ifDefined)(P.AssetUtil.getWalletImage(t))}
            name=${t.name??"Unknown"}
            @click=${()=>this.onConnectWallet(t)}
            data-testid=${`wallet-selector-${t.id}`}
            tabIdx=${(0,d.ifDefined)(this.tabIdx)}
            ?loading=${this.loading}
          >
          </wui-list-wallet>
        `)}
    </wui-flex>`}filterOutDuplicateWallets(t){let e=l.StorageUtil.getRecentWallets(),r=this.connectors.map(t=>t.info?.rdns).filter(Boolean),i=e.map(t=>t.rdns).filter(Boolean),o=r.concat(i);if(o.includes("io.metamask.mobile")&&n.CoreHelperUtil.isMobile()){let t=o.indexOf("io.metamask.mobile");o[t]="io.metamask"}return t.filter(t=>!o.includes(String(t?.rdns)))}onConnectWallet(t){this.loading||g.RouterController.push("ConnectingWalletConnect",{wallet:t})}};W([(0,u.property)()],N.prototype,"tabIdx",void 0),W([(0,i.state)()],N.prototype,"connectors",void 0),W([(0,i.state)()],N.prototype,"loading",void 0),N=W([(0,s.customElement)("w3m-connect-custom-widget")],N);var M=e,H=t.i(10861),_=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let q=class extends M.LitElement{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=p.ConnectorController.state.connectors,this.unsubscribe.push(p.ConnectorController.subscribeKey("connectors",t=>this.connectors=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){let t=this.connectors.filter(t=>"EXTERNAL"===t.type).filter(U.ConnectorUtil.showConnector).filter(t=>t.id!==H.ConstantsUtil.CONNECTOR_ID.COINBASE_SDK);return t?.length?r.html`
      <wui-flex flexDirection="column" gap="xs">
        ${t.map(t=>r.html`
            <wui-list-wallet
              imageSrc=${(0,d.ifDefined)(P.AssetUtil.getConnectorImage(t))}
              .installed=${!0}
              name=${t.name??"Unknown"}
              data-testid=${`wallet-selector-external-${t.id}`}
              @click=${()=>this.onConnector(t)}
              tabIdx=${(0,d.ifDefined)(this.tabIdx)}
            >
            </wui-list-wallet>
          `)}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnector(t){g.RouterController.push("ConnectingExternal",{connector:t})}};_([(0,u.property)()],q.prototype,"tabIdx",void 0),_([(0,i.state)()],q.prototype,"connectors",void 0),q=_([(0,s.customElement)("w3m-connect-external-widget")],q);var K=e,V=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let F=class extends K.LitElement{constructor(){super(...arguments),this.tabIdx=void 0,this.wallets=[]}render(){return this.wallets.length?r.html`
      <wui-flex flexDirection="column" gap="xs">
        ${this.wallets.map(t=>r.html`
            <wui-list-wallet
              data-testid=${`wallet-selector-featured-${t.id}`}
              imageSrc=${(0,d.ifDefined)(P.AssetUtil.getWalletImage(t))}
              name=${t.name??"Unknown"}
              @click=${()=>this.onConnectWallet(t)}
              tabIdx=${(0,d.ifDefined)(this.tabIdx)}
            >
            </wui-list-wallet>
          `)}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnectWallet(t){p.ConnectorController.selectWalletConnector(t)}};V([(0,u.property)()],F.prototype,"tabIdx",void 0),V([(0,u.property)()],F.prototype,"wallets",void 0),F=V([(0,s.customElement)("w3m-connect-featured-widget")],F);var Y=e,G=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let J=class extends Y.LitElement{constructor(){super(...arguments),this.tabIdx=void 0,this.connectors=[]}render(){let t=this.connectors.filter(U.ConnectorUtil.showConnector);return 0===t.length?(this.style.cssText="display: none",null):r.html`
      <wui-flex flexDirection="column" gap="xs">
        ${t.map(t=>r.html`
            <wui-list-wallet
              imageSrc=${(0,d.ifDefined)(P.AssetUtil.getConnectorImage(t))}
              .installed=${!0}
              name=${t.name??"Unknown"}
              tagVariant="success"
              tagLabel="installed"
              data-testid=${`wallet-selector-${t.id}`}
              @click=${()=>this.onConnector(t)}
              tabIdx=${(0,d.ifDefined)(this.tabIdx)}
            >
            </wui-list-wallet>
          `)}
      </wui-flex>
    `}onConnector(t){p.ConnectorController.setActiveConnector(t),g.RouterController.push("ConnectingExternal",{connector:t})}};G([(0,u.property)()],J.prototype,"tabIdx",void 0),G([(0,u.property)()],J.prototype,"connectors",void 0),J=G([(0,s.customElement)("w3m-connect-injected-widget")],J);var Q=e,X=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let Z=class extends Q.LitElement{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=p.ConnectorController.state.connectors,this.unsubscribe.push(p.ConnectorController.subscribeKey("connectors",t=>this.connectors=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){let t=this.connectors.filter(t=>"MULTI_CHAIN"===t.type&&"WalletConnect"!==t.name);return t?.length?r.html`
      <wui-flex flexDirection="column" gap="xs">
        ${t.map(t=>r.html`
            <wui-list-wallet
              imageSrc=${(0,d.ifDefined)(P.AssetUtil.getConnectorImage(t))}
              .installed=${!0}
              name=${t.name??"Unknown"}
              tagVariant="shade"
              tagLabel="multichain"
              data-testid=${`wallet-selector-${t.id}`}
              @click=${()=>this.onConnector(t)}
              tabIdx=${(0,d.ifDefined)(this.tabIdx)}
            >
            </wui-list-wallet>
          `)}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnector(t){p.ConnectorController.setActiveConnector(t),g.RouterController.push("ConnectingMultiChain")}};X([(0,u.property)()],Z.prototype,"tabIdx",void 0),X([(0,i.state)()],Z.prototype,"connectors",void 0),Z=X([(0,s.customElement)("w3m-connect-multi-chain-widget")],Z);var tt=e,te=t.i(55920),tr=t.i(14201),ti=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let to=class extends tt.LitElement{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=p.ConnectorController.state.connectors,this.loading=!1,this.unsubscribe.push(p.ConnectorController.subscribeKey("connectors",t=>this.connectors=t)),n.CoreHelperUtil.isTelegram()&&n.CoreHelperUtil.isIos()&&(this.loading=!B.ConnectionController.state.wcUri,this.unsubscribe.push(B.ConnectionController.subscribeKey("wcUri",t=>this.loading=!t)))}render(){let t=l.StorageUtil.getRecentWallets().filter(t=>!tr.WalletUtil.isExcluded(t)).filter(t=>!this.hasWalletConnector(t)).filter(t=>this.isWalletCompatibleWithCurrentChain(t));return t.length?r.html`
      <wui-flex flexDirection="column" gap="xs">
        ${t.map(t=>r.html`
            <wui-list-wallet
              imageSrc=${(0,d.ifDefined)(P.AssetUtil.getWalletImage(t))}
              name=${t.name??"Unknown"}
              @click=${()=>this.onConnectWallet(t)}
              tagLabel="recent"
              tagVariant="shade"
              tabIdx=${(0,d.ifDefined)(this.tabIdx)}
              ?loading=${this.loading}
            >
            </wui-list-wallet>
          `)}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnectWallet(t){this.loading||p.ConnectorController.selectWalletConnector(t)}hasWalletConnector(t){return this.connectors.some(e=>e.id===t.id||e.name===t.name)}isWalletCompatibleWithCurrentChain(t){let e=te.ChainController.state.activeChain;return!e||!t.chains||t.chains.some(t=>e===t.split(":")[0])}};ti([(0,u.property)()],to.prototype,"tabIdx",void 0),ti([(0,i.state)()],to.prototype,"connectors",void 0),ti([(0,i.state)()],to.prototype,"loading",void 0),to=ti([(0,s.customElement)("w3m-connect-recent-widget")],to);var tn=e,ta=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let tl=class extends tn.LitElement{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.wallets=[],this.loading=!1,n.CoreHelperUtil.isTelegram()&&n.CoreHelperUtil.isIos()&&(this.loading=!B.ConnectionController.state.wcUri,this.unsubscribe.push(B.ConnectionController.subscribeKey("wcUri",t=>this.loading=!t)))}render(){let{connectors:t}=p.ConnectorController.state,{customWallets:e,featuredWalletIds:i}=a.OptionsController.state,o=l.StorageUtil.getRecentWallets(),n=t.find(t=>"walletConnect"===t.id),s=t.filter(t=>"INJECTED"===t.type||"ANNOUNCED"===t.type||"MULTI_CHAIN"===t.type).filter(t=>"Browser Wallet"!==t.name);if(!n)return null;if(i||e||!this.wallets.length)return this.style.cssText="display: none",null;let c=Math.max(0,2-(s.length+o.length)),u=tr.WalletUtil.filterOutDuplicateWallets(this.wallets).slice(0,c);return u.length?r.html`
      <wui-flex flexDirection="column" gap="xs">
        ${u.map(t=>r.html`
            <wui-list-wallet
              imageSrc=${(0,d.ifDefined)(P.AssetUtil.getWalletImage(t))}
              name=${t?.name??"Unknown"}
              @click=${()=>this.onConnectWallet(t)}
              tabIdx=${(0,d.ifDefined)(this.tabIdx)}
              ?loading=${this.loading}
            >
            </wui-list-wallet>
          `)}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnectWallet(t){if(this.loading)return;let e=p.ConnectorController.getConnector(t.id,t.rdns);e?g.RouterController.push("ConnectingExternal",{connector:e}):g.RouterController.push("ConnectingWalletConnect",{wallet:t})}};ta([(0,u.property)()],tl.prototype,"tabIdx",void 0),ta([(0,u.property)()],tl.prototype,"wallets",void 0),ta([(0,i.state)()],tl.prototype,"loading",void 0),tl=ta([(0,s.customElement)("w3m-connect-recommended-widget")],tl);var ts=e,tc=t.i(4595),tu=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let td=class extends ts.LitElement{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=p.ConnectorController.state.connectors,this.connectorImages=tc.AssetController.state.connectorImages,this.unsubscribe.push(p.ConnectorController.subscribeKey("connectors",t=>this.connectors=t),tc.AssetController.subscribeKey("connectorImages",t=>this.connectorImages=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){if(n.CoreHelperUtil.isMobile())return this.style.cssText="display: none",null;let t=this.connectors.find(t=>"walletConnect"===t.id);if(!t)return this.style.cssText="display: none",null;let e=t.imageUrl||this.connectorImages[t?.imageId??""];return r.html`
      <wui-list-wallet
        imageSrc=${(0,d.ifDefined)(e)}
        name=${t.name??"Unknown"}
        @click=${()=>this.onConnector(t)}
        tagLabel="qr code"
        tagVariant="main"
        tabIdx=${(0,d.ifDefined)(this.tabIdx)}
        data-testid="wallet-selector-walletconnect"
      >
      </wui-list-wallet>
    `}onConnector(t){p.ConnectorController.setActiveConnector(t),g.RouterController.push("ConnectingWalletConnect")}};tu([(0,u.property)()],td.prototype,"tabIdx",void 0),tu([(0,i.state)()],td.prototype,"connectors",void 0),tu([(0,i.state)()],td.prototype,"connectorImages",void 0),td=tu([(0,s.customElement)("w3m-connect-walletconnect-widget")],td);let tp=v.css`
  :host {
    margin-top: var(--wui-spacing-3xs);
  }
  wui-separator {
    margin: var(--wui-spacing-m) calc(var(--wui-spacing-m) * -1) var(--wui-spacing-xs)
      calc(var(--wui-spacing-m) * -1);
    width: calc(100% + var(--wui-spacing-s) * 2);
  }
`;var th=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let tg=class extends O.LitElement{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=p.ConnectorController.state.connectors,this.recommended=o.ApiController.state.recommended,this.featured=o.ApiController.state.featured,this.unsubscribe.push(p.ConnectorController.subscribeKey("connectors",t=>this.connectors=t),o.ApiController.subscribeKey("recommended",t=>this.recommended=t),o.ApiController.subscribeKey("featured",t=>this.featured=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){return r.html`
      <wui-flex flexDirection="column" gap="xs"> ${this.connectorListTemplate()} </wui-flex>
    `}connectorListTemplate(){let{custom:t,recent:e,announced:i,injected:o,multiChain:n,recommended:a,featured:l,external:s}=U.ConnectorUtil.getConnectorsByType(this.connectors,this.recommended,this.featured);return U.ConnectorUtil.getConnectorTypeOrder({custom:t,recent:e,announced:i,injected:o,multiChain:n,recommended:a,featured:l,external:s}).map(t=>{switch(t){case"injected":return r.html`
            ${n.length?r.html`<w3m-connect-multi-chain-widget
                  tabIdx=${(0,d.ifDefined)(this.tabIdx)}
                ></w3m-connect-multi-chain-widget>`:null}
            ${i.length?r.html`<w3m-connect-announced-widget
                  tabIdx=${(0,d.ifDefined)(this.tabIdx)}
                ></w3m-connect-announced-widget>`:null}
            ${o.length?r.html`<w3m-connect-injected-widget
                  .connectors=${o}
                  tabIdx=${(0,d.ifDefined)(this.tabIdx)}
                ></w3m-connect-injected-widget>`:null}
          `;case"walletConnect":return r.html`<w3m-connect-walletconnect-widget
            tabIdx=${(0,d.ifDefined)(this.tabIdx)}
          ></w3m-connect-walletconnect-widget>`;case"recent":return r.html`<w3m-connect-recent-widget
            tabIdx=${(0,d.ifDefined)(this.tabIdx)}
          ></w3m-connect-recent-widget>`;case"featured":return r.html`<w3m-connect-featured-widget
            .wallets=${l}
            tabIdx=${(0,d.ifDefined)(this.tabIdx)}
          ></w3m-connect-featured-widget>`;case"custom":return r.html`<w3m-connect-custom-widget
            tabIdx=${(0,d.ifDefined)(this.tabIdx)}
          ></w3m-connect-custom-widget>`;case"external":return r.html`<w3m-connect-external-widget
            tabIdx=${(0,d.ifDefined)(this.tabIdx)}
          ></w3m-connect-external-widget>`;case"recommended":return r.html`<w3m-connect-recommended-widget
            .wallets=${a}
            tabIdx=${(0,d.ifDefined)(this.tabIdx)}
          ></w3m-connect-recommended-widget>`;default:return console.warn(`Unknown connector type: ${t}`),null}})}};tg.styles=tp,th([(0,u.property)()],tg.prototype,"tabIdx",void 0),th([(0,i.state)()],tg.prototype,"connectors",void 0),th([(0,i.state)()],tg.prototype,"recommended",void 0),th([(0,i.state)()],tg.prototype,"featured",void 0),tg=th([(0,s.customElement)("w3m-connector-list")],tg);var tw=e,tf=t.i(35517),tm=t.i(54012),tb=e,tv=e;let ty=v.css`
  :host {
    display: inline-flex;
    background-color: var(--wui-color-gray-glass-002);
    border-radius: var(--wui-border-radius-3xl);
    padding: var(--wui-spacing-3xs);
    position: relative;
    height: 36px;
    min-height: 36px;
    overflow: hidden;
  }

  :host::before {
    content: '';
    position: absolute;
    pointer-events: none;
    top: 4px;
    left: 4px;
    display: block;
    width: var(--local-tab-width);
    height: 28px;
    border-radius: var(--wui-border-radius-3xl);
    background-color: var(--wui-color-gray-glass-002);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-002);
    transform: translateX(calc(var(--local-tab) * var(--local-tab-width)));
    transition: transform var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: background-color, opacity;
  }

  :host([data-type='flex'])::before {
    left: 3px;
    transform: translateX(calc((var(--local-tab) * 34px) + (var(--local-tab) * 4px)));
  }

  :host([data-type='flex']) {
    display: flex;
    padding: 0px 0px 0px 12px;
    gap: 4px;
  }

  :host([data-type='flex']) > button > wui-text {
    position: absolute;
    left: 18px;
    opacity: 0;
  }

  button[data-active='true'] > wui-icon,
  button[data-active='true'] > wui-text {
    color: var(--wui-color-fg-100);
  }

  button[data-active='false'] > wui-icon,
  button[data-active='false'] > wui-text {
    color: var(--wui-color-fg-200);
  }

  button[data-active='true']:disabled,
  button[data-active='false']:disabled {
    background-color: transparent;
    opacity: 0.5;
    cursor: not-allowed;
  }

  button[data-active='true']:disabled > wui-text {
    color: var(--wui-color-fg-200);
  }

  button[data-active='false']:disabled > wui-text {
    color: var(--wui-color-fg-300);
  }

  button > wui-icon,
  button > wui-text {
    pointer-events: none;
    transition: color var(--wui-e ase-out-power-1) var(--wui-duration-md);
    will-change: color;
  }

  button {
    width: var(--local-tab-width);
    transition: background-color var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: background-color;
  }

  :host([data-type='flex']) > button {
    width: 34px;
    position: relative;
    display: flex;
    justify-content: flex-start;
  }

  button:hover:enabled,
  button:active:enabled {
    background-color: transparent !important;
  }

  button:hover:enabled > wui-icon,
  button:active:enabled > wui-icon {
    transition: all var(--wui-ease-out-power-1) var(--wui-duration-lg);
    color: var(--wui-color-fg-125);
  }

  button:hover:enabled > wui-text,
  button:active:enabled > wui-text {
    transition: all var(--wui-ease-out-power-1) var(--wui-duration-lg);
    color: var(--wui-color-fg-125);
  }

  button {
    border-radius: var(--wui-border-radius-3xl);
  }
`;var tx=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let tC=class extends tv.LitElement{constructor(){super(...arguments),this.tabs=[],this.onTabChange=()=>null,this.buttons=[],this.disabled=!1,this.localTabWidth="100px",this.activeTab=0,this.isDense=!1}render(){return this.isDense=this.tabs.length>3,this.style.cssText=`
      --local-tab: ${this.activeTab};
      --local-tab-width: ${this.localTabWidth};
    `,this.dataset.type=this.isDense?"flex":"block",this.tabs.map((t,e)=>{let i=e===this.activeTab;return r.html`
        <button
          ?disabled=${this.disabled}
          @click=${()=>this.onTabClick(e)}
          data-active=${i}
          data-testid="tab-${t.label?.toLowerCase()}"
        >
          ${this.iconTemplate(t)}
          <wui-text variant="small-600" color="inherit"> ${t.label} </wui-text>
        </button>
      `})}firstUpdated(){this.shadowRoot&&this.isDense&&(this.buttons=[...this.shadowRoot.querySelectorAll("button")],setTimeout(()=>{this.animateTabs(0,!0)},0))}iconTemplate(t){return t.icon?r.html`<wui-icon size="xs" color="inherit" name=${t.icon}></wui-icon>`:null}onTabClick(t){this.buttons&&this.animateTabs(t,!1),this.activeTab=t,this.onTabChange(t)}animateTabs(t,e){let r=this.buttons[this.activeTab],i=this.buttons[t],o=r?.querySelector("wui-text"),n=i?.querySelector("wui-text"),a=i?.getBoundingClientRect(),l=n?.getBoundingClientRect();r&&o&&!e&&t!==this.activeTab&&(o.animate([{opacity:0}],{duration:50,easing:"ease",fill:"forwards"}),r.animate([{width:"34px"}],{duration:500,easing:"ease",fill:"forwards"})),i&&a&&l&&n&&(t!==this.activeTab||e)&&(this.localTabWidth=`${Math.round(a.width+l.width)+6}px`,i.animate([{width:`${a.width+l.width}px`}],{duration:500*!e,fill:"forwards",easing:"ease"}),n.animate([{opacity:1}],{duration:125*!e,delay:200*!e,fill:"forwards",easing:"ease"}))}};tC.styles=[f.resetStyles,f.elementStyles,ty],tx([(0,u.property)({type:Array})],tC.prototype,"tabs",void 0),tx([(0,u.property)()],tC.prototype,"onTabChange",void 0),tx([(0,u.property)({type:Array})],tC.prototype,"buttons",void 0),tx([(0,u.property)({type:Boolean})],tC.prototype,"disabled",void 0),tx([(0,u.property)()],tC.prototype,"localTabWidth",void 0),tx([(0,i.state)()],tC.prototype,"activeTab",void 0),tx([(0,i.state)()],tC.prototype,"isDense",void 0),tC=tx([(0,s.customElement)("wui-tabs")],tC);var t$=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let tE=class extends tb.LitElement{constructor(){super(...arguments),this.platformTabs=[],this.unsubscribe=[],this.platforms=[],this.onSelectPlatfrom=void 0}disconnectCallback(){this.unsubscribe.forEach(t=>t())}render(){let t=this.generateTabs();return r.html`
      <wui-flex justifyContent="center" .padding=${["0","0","l","0"]}>
        <wui-tabs .tabs=${t} .onTabChange=${this.onTabChange.bind(this)}></wui-tabs>
      </wui-flex>
    `}generateTabs(){let t=this.platforms.map(t=>{if("browser"===t)return{label:"Browser",icon:"extension",platform:"browser"};if("mobile"===t)return{label:"Mobile",icon:"mobile",platform:"mobile"};if("qrcode"===t)return{label:"Mobile",icon:"mobile",platform:"qrcode"};if("web"===t)return{label:"Webapp",icon:"browser",platform:"web"};if("desktop"===t)return{label:"Desktop",icon:"desktop",platform:"desktop"};return{label:"Browser",icon:"extension",platform:"unsupported"}});return this.platformTabs=t.map(({platform:t})=>t),t}onTabChange(t){let e=this.platformTabs[t];e&&this.onSelectPlatfrom?.(e)}};t$([(0,u.property)({type:Array})],tE.prototype,"platforms",void 0),t$([(0,u.property)()],tE.prototype,"onSelectPlatfrom",void 0),tE=t$([(0,s.customElement)("w3m-connecting-header")],tE);var tk=e,tR=t.i(99878),tI=e;t.i(93792);let tS=v.css`
  :host {
    width: var(--local-width);
    position: relative;
  }

  button {
    border: none;
    border-radius: var(--local-border-radius);
    width: var(--local-width);
    white-space: nowrap;
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='md'] {
    padding: 8.2px var(--wui-spacing-l) 9px var(--wui-spacing-l);
    height: 36px;
  }

  button[data-size='md'][data-icon-left='true'][data-icon-right='false'] {
    padding: 8.2px var(--wui-spacing-l) 9px var(--wui-spacing-s);
  }

  button[data-size='md'][data-icon-right='true'][data-icon-left='false'] {
    padding: 8.2px var(--wui-spacing-s) 9px var(--wui-spacing-l);
  }

  button[data-size='lg'] {
    padding: var(--wui-spacing-m) var(--wui-spacing-2l);
    height: 48px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-variant='main'] {
    background-color: var(--wui-color-accent-100);
    color: var(--wui-color-inverse-100);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-010);
  }

  button[data-variant='inverse'] {
    background-color: var(--wui-color-inverse-100);
    color: var(--wui-color-inverse-000);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-010);
  }

  button[data-variant='accent'] {
    background-color: var(--wui-color-accent-glass-010);
    color: var(--wui-color-accent-100);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
  }

  button[data-variant='accent-error'] {
    background: var(--wui-color-error-glass-015);
    color: var(--wui-color-error-100);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-error-glass-010);
  }

  button[data-variant='accent-success'] {
    background: var(--wui-color-success-glass-015);
    color: var(--wui-color-success-100);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-success-glass-010);
  }

  button[data-variant='neutral'] {
    background: transparent;
    color: var(--wui-color-fg-100);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
  }

  /* -- Focus states --------------------------------------------------- */
  button[data-variant='main']:focus-visible:enabled {
    background-color: var(--wui-color-accent-090);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0 0 0 4px var(--wui-color-accent-glass-020);
  }
  button[data-variant='inverse']:focus-visible:enabled {
    background-color: var(--wui-color-inverse-100);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-gray-glass-010),
      0 0 0 4px var(--wui-color-accent-glass-020);
  }
  button[data-variant='accent']:focus-visible:enabled {
    background-color: var(--wui-color-accent-glass-010);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0 0 0 4px var(--wui-color-accent-glass-020);
  }
  button[data-variant='accent-error']:focus-visible:enabled {
    background: var(--wui-color-error-glass-015);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-error-100),
      0 0 0 4px var(--wui-color-error-glass-020);
  }
  button[data-variant='accent-success']:focus-visible:enabled {
    background: var(--wui-color-success-glass-015);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-success-100),
      0 0 0 4px var(--wui-color-success-glass-020);
  }
  button[data-variant='neutral']:focus-visible:enabled {
    background: var(--wui-color-gray-glass-005);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-gray-glass-010),
      0 0 0 4px var(--wui-color-gray-glass-002);
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
    button[data-variant='main']:hover:enabled {
      background-color: var(--wui-color-accent-090);
    }

    button[data-variant='main']:active:enabled {
      background-color: var(--wui-color-accent-080);
    }

    button[data-variant='accent']:hover:enabled {
      background-color: var(--wui-color-accent-glass-015);
    }

    button[data-variant='accent']:active:enabled {
      background-color: var(--wui-color-accent-glass-020);
    }

    button[data-variant='accent-error']:hover:enabled {
      background: var(--wui-color-error-glass-020);
      color: var(--wui-color-error-100);
    }

    button[data-variant='accent-error']:active:enabled {
      background: var(--wui-color-error-glass-030);
      color: var(--wui-color-error-100);
    }

    button[data-variant='accent-success']:hover:enabled {
      background: var(--wui-color-success-glass-020);
      color: var(--wui-color-success-100);
    }

    button[data-variant='accent-success']:active:enabled {
      background: var(--wui-color-success-glass-030);
      color: var(--wui-color-success-100);
    }

    button[data-variant='neutral']:hover:enabled {
      background: var(--wui-color-gray-glass-002);
    }

    button[data-variant='neutral']:active:enabled {
      background: var(--wui-color-gray-glass-005);
    }

    button[data-size='lg'][data-icon-left='true'][data-icon-right='false'] {
      padding-left: var(--wui-spacing-m);
    }

    button[data-size='lg'][data-icon-right='true'][data-icon-left='false'] {
      padding-right: var(--wui-spacing-m);
    }
  }

  /* -- Disabled state --------------------------------------------------- */
  button:disabled {
    background-color: var(--wui-color-gray-glass-002);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-002);
    color: var(--wui-color-gray-glass-020);
    cursor: not-allowed;
  }

  button > wui-text {
    transition: opacity var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: opacity;
    opacity: var(--local-opacity-100);
  }

  ::slotted(*) {
    transition: opacity var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: opacity;
    opacity: var(--local-opacity-100);
  }

  wui-loading-spinner {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    opacity: var(--local-opacity-000);
  }
`;var tT=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let tL={main:"inverse-100",inverse:"inverse-000",accent:"accent-100","accent-error":"error-100","accent-success":"success-100",neutral:"fg-100",disabled:"gray-glass-020"},tO={lg:"paragraph-600",md:"small-600"},tA={lg:"md",md:"md"},tP=class extends tI.LitElement{constructor(){super(...arguments),this.size="lg",this.disabled=!1,this.fullWidth=!1,this.loading=!1,this.variant="main",this.hasIconLeft=!1,this.hasIconRight=!1,this.borderRadius="m"}render(){this.style.cssText=`
    --local-width: ${this.fullWidth?"100%":"auto"};
    --local-opacity-100: ${+!this.loading};
    --local-opacity-000: ${+!!this.loading};
    --local-border-radius: var(--wui-border-radius-${this.borderRadius});
    `;let t=this.textVariant??tO[this.size];return r.html`
      <button
        data-variant=${this.variant}
        data-icon-left=${this.hasIconLeft}
        data-icon-right=${this.hasIconRight}
        data-size=${this.size}
        ?disabled=${this.disabled}
      >
        ${this.loadingTemplate()}
        <slot name="iconLeft" @slotchange=${()=>this.handleSlotLeftChange()}></slot>
        <wui-text variant=${t} color="inherit">
          <slot></slot>
        </wui-text>
        <slot name="iconRight" @slotchange=${()=>this.handleSlotRightChange()}></slot>
      </button>
    `}handleSlotLeftChange(){this.hasIconLeft=!0}handleSlotRightChange(){this.hasIconRight=!0}loadingTemplate(){if(this.loading){let t=tA[this.size],e=this.disabled?tL.disabled:tL[this.variant];return r.html`<wui-loading-spinner color=${e} size=${t}></wui-loading-spinner>`}return r.html``}};tP.styles=[f.resetStyles,f.elementStyles,tS],tT([(0,u.property)()],tP.prototype,"size",void 0),tT([(0,u.property)({type:Boolean})],tP.prototype,"disabled",void 0),tT([(0,u.property)({type:Boolean})],tP.prototype,"fullWidth",void 0),tT([(0,u.property)({type:Boolean})],tP.prototype,"loading",void 0),tT([(0,u.property)()],tP.prototype,"variant",void 0),tT([(0,u.property)({type:Boolean})],tP.prototype,"hasIconLeft",void 0),tT([(0,u.property)({type:Boolean})],tP.prototype,"hasIconRight",void 0),tT([(0,u.property)()],tP.prototype,"borderRadius",void 0),tT([(0,u.property)()],tP.prototype,"textVariant",void 0),tP=tT([(0,s.customElement)("wui-button")],tP),t.i(46351);var tU=e;let tj=v.css`
  button {
    padding: var(--wui-spacing-4xs) var(--wui-spacing-xxs);
    border-radius: var(--wui-border-radius-3xs);
    background-color: transparent;
    color: var(--wui-color-accent-100);
  }

  button:disabled {
    background-color: transparent;
    color: var(--wui-color-gray-glass-015);
  }

  button:hover {
    background-color: var(--wui-color-gray-glass-005);
  }
`;var tD=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let tz=class extends tU.LitElement{constructor(){super(...arguments),this.tabIdx=void 0,this.disabled=!1,this.color="inherit"}render(){return r.html`
      <button ?disabled=${this.disabled} tabindex=${(0,d.ifDefined)(this.tabIdx)}>
        <slot name="iconLeft"></slot>
        <wui-text variant="small-600" color=${this.color}>
          <slot></slot>
        </wui-text>
        <slot name="iconRight"></slot>
      </button>
    `}};tz.styles=[f.resetStyles,f.elementStyles,tj],tD([(0,u.property)()],tz.prototype,"tabIdx",void 0),tD([(0,u.property)({type:Boolean})],tz.prototype,"disabled",void 0),tD([(0,u.property)()],tz.prototype,"color",void 0),tz=tD([(0,s.customElement)("wui-link")],tz);var tB=e;let tW=v.css`
  :host {
    display: block;
    width: var(--wui-box-size-md);
    height: var(--wui-box-size-md);
  }

  svg {
    width: var(--wui-box-size-md);
    height: var(--wui-box-size-md);
  }

  rect {
    fill: none;
    stroke: var(--wui-color-accent-100);
    stroke-width: 4px;
    stroke-linecap: round;
    animation: dash 1s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: 0px;
    }
  }
`;var tN=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let tM=class extends tB.LitElement{constructor(){super(...arguments),this.radius=36}render(){return this.svgLoaderTemplate()}svgLoaderTemplate(){let t=this.radius>50?50:this.radius,e=36-t;return r.html`
      <svg viewBox="0 0 110 110" width="110" height="110">
        <rect
          x="2"
          y="2"
          width="106"
          height="106"
          rx=${t}
          stroke-dasharray="${116+e} ${245+e}"
          stroke-dashoffset=${360+1.75*e}
        />
      </svg>
    `}};tM.styles=[f.resetStyles,tW],tN([(0,u.property)({type:Number})],tM.prototype,"radius",void 0),tM=tN([(0,s.customElement)("wui-loading-thumbnail")],tM),t.i(82122);var tH=e,t_=t.i(3850),tq=e,tK=e;let tV=v.css`
  button {
    border: none;
    border-radius: var(--wui-border-radius-3xl);
  }

  button[data-variant='main'] {
    background-color: var(--wui-color-accent-100);
    color: var(--wui-color-inverse-100);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-010);
  }

  button[data-variant='accent'] {
    background-color: var(--wui-color-accent-glass-010);
    color: var(--wui-color-accent-100);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
  }

  button[data-variant='gray'] {
    background-color: transparent;
    color: var(--wui-color-fg-200);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-010);
  }

  button[data-variant='shade'] {
    background-color: transparent;
    color: var(--wui-color-accent-100);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-010);
  }

  button[data-size='sm'] {
    height: 32px;
    padding: 0 var(--wui-spacing-s);
  }

  button[data-size='md'] {
    height: 40px;
    padding: 0 var(--wui-spacing-l);
  }

  button[data-size='sm'] > wui-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='md'] > wui-image {
    width: 24px;
    height: 24px;
  }

  button[data-size='sm'] > wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] > wui-icon {
    width: 14px;
    height: 14px;
  }

  wui-image {
    border-radius: var(--wui-border-radius-3xl);
    overflow: hidden;
  }

  button.disabled > wui-icon,
  button.disabled > wui-image {
    filter: grayscale(1);
  }

  button[data-variant='main'] > wui-image {
    box-shadow: inset 0 0 0 1px var(--wui-color-accent-090);
  }

  button[data-variant='shade'] > wui-image,
  button[data-variant='gray'] > wui-image {
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-010);
  }

  @media (hover: hover) and (pointer: fine) {
    button[data-variant='main']:focus-visible {
      background-color: var(--wui-color-accent-090);
    }

    button[data-variant='main']:hover:enabled {
      background-color: var(--wui-color-accent-090);
    }

    button[data-variant='main']:active:enabled {
      background-color: var(--wui-color-accent-080);
    }

    button[data-variant='accent']:hover:enabled {
      background-color: var(--wui-color-accent-glass-015);
    }

    button[data-variant='accent']:active:enabled {
      background-color: var(--wui-color-accent-glass-020);
    }

    button[data-variant='shade']:focus-visible,
    button[data-variant='gray']:focus-visible,
    button[data-variant='shade']:hover,
    button[data-variant='gray']:hover {
      background-color: var(--wui-color-gray-glass-002);
    }

    button[data-variant='gray']:active,
    button[data-variant='shade']:active {
      background-color: var(--wui-color-gray-glass-005);
    }
  }

  button.disabled {
    color: var(--wui-color-gray-glass-020);
    background-color: var(--wui-color-gray-glass-002);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-002);
    pointer-events: none;
  }
`;var tF=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let tY=class extends tK.LitElement{constructor(){super(...arguments),this.variant="accent",this.imageSrc="",this.disabled=!1,this.icon="externalLink",this.size="md",this.text=""}render(){let t="sm"===this.size?"small-600":"paragraph-600";return r.html`
      <button
        class=${this.disabled?"disabled":""}
        data-variant=${this.variant}
        data-size=${this.size}
      >
        ${this.imageSrc?r.html`<wui-image src=${this.imageSrc}></wui-image>`:null}
        <wui-text variant=${t} color="inherit"> ${this.text} </wui-text>
        <wui-icon name=${this.icon} color="inherit" size="inherit"></wui-icon>
      </button>
    `}};tY.styles=[f.resetStyles,f.elementStyles,tV],tF([(0,u.property)()],tY.prototype,"variant",void 0),tF([(0,u.property)()],tY.prototype,"imageSrc",void 0),tF([(0,u.property)({type:Boolean})],tY.prototype,"disabled",void 0),tF([(0,u.property)()],tY.prototype,"icon",void 0),tF([(0,u.property)()],tY.prototype,"size",void 0),tF([(0,u.property)()],tY.prototype,"text",void 0),tY=tF([(0,s.customElement)("wui-chip-button")],tY);let tG=v.css`
  wui-flex {
    width: 100%;
    background-color: var(--wui-color-gray-glass-002);
    border-radius: var(--wui-border-radius-xs);
  }
`;var tJ=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let tQ=class extends tq.LitElement{constructor(){super(...arguments),this.disabled=!1,this.label="",this.buttonLabel=""}render(){return r.html`
      <wui-flex
        justifyContent="space-between"
        alignItems="center"
        .padding=${["1xs","2l","1xs","2l"]}
      >
        <wui-text variant="paragraph-500" color="fg-200">${this.label}</wui-text>
        <wui-chip-button size="sm" variant="shade" text=${this.buttonLabel} icon="chevronRight">
        </wui-chip-button>
      </wui-flex>
    `}};tQ.styles=[f.resetStyles,f.elementStyles,tG],tJ([(0,u.property)({type:Boolean})],tQ.prototype,"disabled",void 0),tJ([(0,u.property)()],tQ.prototype,"label",void 0),tJ([(0,u.property)()],tQ.prototype,"buttonLabel",void 0),tQ=tJ([(0,s.customElement)("wui-cta-button")],tQ);let tX=v.css`
  :host {
    display: block;
    padding: 0 var(--wui-spacing-xl) var(--wui-spacing-xl);
  }
`;var tZ=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let t0=class extends tH.LitElement{constructor(){super(...arguments),this.wallet=void 0}render(){if(!this.wallet)return this.style.display="none",null;let{name:t,app_store:e,play_store:i,chrome_store:o,homepage:a}=this.wallet,l=n.CoreHelperUtil.isMobile(),s=n.CoreHelperUtil.isIos(),c=n.CoreHelperUtil.isAndroid(),u=[e,i,a,o].filter(Boolean).length>1,d=t_.UiHelperUtil.getTruncateString({string:t,charsStart:12,charsEnd:0,truncate:"end"});return u&&!l?r.html`
        <wui-cta-button
          label=${`Don't have ${d}?`}
          buttonLabel="Get"
          @click=${()=>g.RouterController.push("Downloads",{wallet:this.wallet})}
        ></wui-cta-button>
      `:!u&&a?r.html`
        <wui-cta-button
          label=${`Don't have ${d}?`}
          buttonLabel="Get"
          @click=${this.onHomePage.bind(this)}
        ></wui-cta-button>
      `:e&&s?r.html`
        <wui-cta-button
          label=${`Don't have ${d}?`}
          buttonLabel="Get"
          @click=${this.onAppStore.bind(this)}
        ></wui-cta-button>
      `:i&&c?r.html`
        <wui-cta-button
          label=${`Don't have ${d}?`}
          buttonLabel="Get"
          @click=${this.onPlayStore.bind(this)}
        ></wui-cta-button>
      `:(this.style.display="none",null)}onAppStore(){this.wallet?.app_store&&n.CoreHelperUtil.openHref(this.wallet.app_store,"_blank")}onPlayStore(){this.wallet?.play_store&&n.CoreHelperUtil.openHref(this.wallet.play_store,"_blank")}onHomePage(){this.wallet?.homepage&&n.CoreHelperUtil.openHref(this.wallet.homepage,"_blank")}};t0.styles=[tX],tZ([(0,u.property)({type:Object})],t0.prototype,"wallet",void 0),t0=tZ([(0,s.customElement)("w3m-mobile-download-links")],t0);let t1=v.css`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-icon-box {
    position: absolute;
    right: calc(var(--wui-spacing-3xs) * -1);
    bottom: calc(var(--wui-spacing-3xs) * -1);
    opacity: 0;
    transform: scale(0.5);
    transition-property: opacity, transform;
    transition-duration: var(--wui-duration-lg);
    transition-timing-function: var(--wui-ease-out-power-2);
    will-change: opacity, transform;
  }

  wui-text[align='center'] {
    width: 100%;
    padding: 0px var(--wui-spacing-l);
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }
`;var t3=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};class t2 extends tk.LitElement{constructor(){super(),this.wallet=g.RouterController.state.data?.wallet,this.connector=g.RouterController.state.data?.connector,this.timeout=void 0,this.secondaryBtnIcon="refresh",this.onConnect=void 0,this.onRender=void 0,this.onAutoConnect=void 0,this.isWalletConnect=!0,this.unsubscribe=[],this.imageSrc=P.AssetUtil.getWalletImage(this.wallet)??P.AssetUtil.getConnectorImage(this.connector),this.name=this.wallet?.name??this.connector?.name??"Wallet",this.isRetrying=!1,this.uri=B.ConnectionController.state.wcUri,this.error=B.ConnectionController.state.wcError,this.ready=!1,this.showRetry=!1,this.secondaryBtnLabel="Try again",this.secondaryLabel="Accept connection request in the wallet",this.isLoading=!1,this.isMobile=!1,this.onRetry=void 0,this.unsubscribe.push(B.ConnectionController.subscribeKey("wcUri",t=>{this.uri=t,this.isRetrying&&this.onRetry&&(this.isRetrying=!1,this.onConnect?.())}),B.ConnectionController.subscribeKey("wcError",t=>this.error=t)),(n.CoreHelperUtil.isTelegram()||n.CoreHelperUtil.isSafari())&&n.CoreHelperUtil.isIos()&&B.ConnectionController.state.wcUri&&this.onConnect?.()}firstUpdated(){this.onAutoConnect?.(),this.showRetry=!this.onAutoConnect}disconnectedCallback(){this.unsubscribe.forEach(t=>t()),B.ConnectionController.setWcError(!1),clearTimeout(this.timeout)}render(){this.onRender?.(),this.onShowRetry();let t=this.error?"Connection can be declined if a previous request is still active":this.secondaryLabel,e=`Continue in ${this.name}`;return this.error&&(e="Connection declined"),r.html`
      <wui-flex
        data-error=${(0,d.ifDefined)(this.error)}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${["3xl","xl","xl","xl"]}
        gap="xl"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-wallet-image size="lg" imageSrc=${(0,d.ifDefined)(this.imageSrc)}></wui-wallet-image>

          ${this.error?null:this.loaderTemplate()}

          <wui-icon-box
            backgroundColor="error-100"
            background="opaque"
            iconColor="error-100"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="xs">
          <wui-text variant="paragraph-500" color=${this.error?"error-100":"fg-100"}>
            ${e}
          </wui-text>
          <wui-text align="center" variant="small-500" color="fg-200">${t}</wui-text>
        </wui-flex>

        ${this.secondaryBtnLabel?r.html`
              <wui-button
                variant="accent"
                size="md"
                ?disabled=${this.isRetrying||this.isLoading}
                @click=${this.onTryAgain.bind(this)}
                data-testid="w3m-connecting-widget-secondary-button"
              >
                <wui-icon color="inherit" slot="iconLeft" name=${this.secondaryBtnIcon}></wui-icon>
                ${this.secondaryBtnLabel}
              </wui-button>
            `:null}
      </wui-flex>

      ${this.isWalletConnect?r.html`
            <wui-flex .padding=${["0","xl","xl","xl"]} justifyContent="center">
              <wui-link @click=${this.onCopyUri} color="fg-200" data-testid="wui-link-copy">
                <wui-icon size="xs" color="fg-200" slot="iconLeft" name="copy"></wui-icon>
                Copy link
              </wui-link>
            </wui-flex>
          `:null}

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}onShowRetry(){if(this.error&&!this.showRetry){this.showRetry=!0;let t=this.shadowRoot?.querySelector("wui-button");t?.animate([{opacity:0},{opacity:1}],{fill:"forwards",easing:"ease"})}}onTryAgain(){B.ConnectionController.setWcError(!1),this.onRetry?(this.isRetrying=!0,this.onRetry?.()):this.onConnect?.()}loaderTemplate(){let t=tR.ThemeController.state.themeVariables["--w3m-border-radius-master"],e=t?parseInt(t.replace("px",""),10):4;return r.html`<wui-loading-thumbnail radius=${9*e}></wui-loading-thumbnail>`}onCopyUri(){try{this.uri&&(n.CoreHelperUtil.copyToClopboard(this.uri),tm.SnackController.showSuccess("Link copied"))}catch{tm.SnackController.showError("Failed to copy")}}}t2.styles=t1,t3([(0,i.state)()],t2.prototype,"isRetrying",void 0),t3([(0,i.state)()],t2.prototype,"uri",void 0),t3([(0,i.state)()],t2.prototype,"error",void 0),t3([(0,i.state)()],t2.prototype,"ready",void 0),t3([(0,i.state)()],t2.prototype,"showRetry",void 0),t3([(0,i.state)()],t2.prototype,"secondaryBtnLabel",void 0),t3([(0,i.state)()],t2.prototype,"secondaryLabel",void 0),t3([(0,i.state)()],t2.prototype,"isLoading",void 0),t3([(0,u.property)({type:Boolean})],t2.prototype,"isMobile",void 0),t3([(0,u.property)()],t2.prototype,"onRetry",void 0);let t5=class extends t2{constructor(){if(super(),!this.wallet)throw Error("w3m-connecting-wc-browser: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onAutoConnect=this.onConnectProxy.bind(this),h.EventsController.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser"}})}async onConnectProxy(){try{this.error=!1;let{connectors:t}=p.ConnectorController.state,e=t.find(t=>"ANNOUNCED"===t.type&&t.info?.rdns===this.wallet?.rdns||"INJECTED"===t.type||t.name===this.wallet?.name);if(e)await B.ConnectionController.connectExternal(e,e.chain);else throw Error("w3m-connecting-wc-browser: No connector found");tf.ModalController.close(),h.EventsController.sendEvent({type:"track",event:"CONNECT_SUCCESS",properties:{method:"browser",name:this.wallet?.name||"Unknown"}})}catch(t){h.EventsController.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:t?.message??"Unknown"}}),this.error=!0}}};t5=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a}([(0,s.customElement)("w3m-connecting-wc-browser")],t5);let t4=class extends t2{constructor(){if(super(),!this.wallet)throw Error("w3m-connecting-wc-desktop: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onRender=this.onRenderProxy.bind(this),h.EventsController.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"desktop"}})}onRenderProxy(){!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onConnectProxy(){if(this.wallet?.desktop_link&&this.uri)try{this.error=!1;let{desktop_link:t,name:e}=this.wallet,{redirect:r,href:i}=n.CoreHelperUtil.formatNativeUrl(t,this.uri);B.ConnectionController.setWcLinking({name:e,href:i}),B.ConnectionController.setRecentWallet(this.wallet),n.CoreHelperUtil.openHref(r,"_blank")}catch{this.error=!0}}};t4=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a}([(0,s.customElement)("w3m-connecting-wc-desktop")],t4);var t6=t.i(68119),t8=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let t9=class extends t2{constructor(){if(super(),this.btnLabelTimeout=void 0,this.redirectDeeplink=void 0,this.redirectUniversalLink=void 0,this.target=void 0,this.preferUniversalLinks=a.OptionsController.state.experimental_preferUniversalLinks,this.isLoading=!0,this.onConnect=()=>{if(this.wallet?.mobile_link&&this.uri)try{this.error=!1;let{mobile_link:t,link_mode:e,name:r}=this.wallet,{redirect:i,redirectUniversalLink:o,href:a}=n.CoreHelperUtil.formatNativeUrl(t,this.uri,e);this.redirectDeeplink=i,this.redirectUniversalLink=o,this.target=n.CoreHelperUtil.isIframe()?"_top":"_self",B.ConnectionController.setWcLinking({name:r,href:a}),B.ConnectionController.setRecentWallet(this.wallet),this.preferUniversalLinks&&this.redirectUniversalLink?n.CoreHelperUtil.openHref(this.redirectUniversalLink,this.target):n.CoreHelperUtil.openHref(this.redirectDeeplink,this.target)}catch(t){h.EventsController.sendEvent({type:"track",event:"CONNECT_PROXY_ERROR",properties:{message:t instanceof Error?t.message:"Error parsing the deeplink",uri:this.uri,mobile_link:this.wallet.mobile_link,name:this.wallet.name}}),this.error=!0}},!this.wallet)throw Error("w3m-connecting-wc-mobile: No wallet provided");this.secondaryBtnLabel="Open",this.secondaryLabel=t6.ConstantsUtil.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.onHandleURI(),this.unsubscribe.push(B.ConnectionController.subscribeKey("wcUri",()=>{this.onHandleURI()})),h.EventsController.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"mobile"}})}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.btnLabelTimeout)}onHandleURI(){this.isLoading=!this.uri,!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onTryAgain(){B.ConnectionController.setWcError(!1),this.onConnect?.()}};t8([(0,i.state)()],t9.prototype,"redirectDeeplink",void 0),t8([(0,i.state)()],t9.prototype,"redirectUniversalLink",void 0),t8([(0,i.state)()],t9.prototype,"target",void 0),t8([(0,i.state)()],t9.prototype,"preferUniversalLinks",void 0),t8([(0,i.state)()],t9.prototype,"isLoading",void 0),t9=t8([(0,s.customElement)("w3m-connecting-wc-mobile")],t9);var t7=e,et=t.i(9626);function ee(t,e,r){return t!==e&&(t-e<0?e-t:t-e)<=r+.1}let er={generate({uri:t,size:e,logoSize:i,dotColor:o="#141414"}){let n,a,l=[],s=(a=Math.sqrt((n=Array.prototype.slice.call(et.default.create(t,{errorCorrectionLevel:"Q"}).modules.data,0)).length),n.reduce((t,e,r)=>(r%a==0?t.push([e]):t[t.length-1].push(e))&&t,[])),c=e/s.length,u=[{x:0,y:0},{x:1,y:0},{x:0,y:1}];u.forEach(({x:t,y:e})=>{let i=(s.length-7)*c*t,n=(s.length-7)*c*e;for(let t=0;t<u.length;t+=1){let e=c*(7-2*t);l.push(r.svg`
            <rect
              fill=${2===t?o:"transparent"}
              width=${0===t?e-5:e}
              rx= ${0===t?(e-5)*.45:.45*e}
              ry= ${0===t?(e-5)*.45:.45*e}
              stroke=${o}
              stroke-width=${5*(0===t)}
              height=${0===t?e-5:e}
              x= ${0===t?n+c*t+2.5:n+c*t}
              y= ${0===t?i+c*t+2.5:i+c*t}
            />
          `)}});let d=Math.floor((i+25)/c),p=s.length/2-d/2,h=s.length/2+d/2-1,g=[];s.forEach((t,e)=>{t.forEach((t,r)=>{!s[e][r]||e<7&&r<7||e>s.length-8&&r<7||e<7&&r>s.length-8||e>p&&e<h&&r>p&&r<h||g.push([e*c+c/2,r*c+c/2])})});let w={};return g.forEach(([t,e])=>{w[t]?w[t]?.push(e):w[t]=[e]}),Object.entries(w).map(([t,e])=>{let r=e.filter(t=>e.every(e=>!ee(t,e,c)));return[Number(t),r]}).forEach(([t,e])=>{e.forEach(e=>{l.push(r.svg`<circle cx=${t} cy=${e} fill=${o} r=${c/2.5} />`)})}),Object.entries(w).filter(([t,e])=>e.length>1).map(([t,e])=>{let r=e.filter(t=>e.some(e=>ee(t,e,c)));return[Number(t),r]}).map(([t,e])=>{e.sort((t,e)=>t<e?-1:1);let r=[];for(let t of e){let e=r.find(e=>e.some(e=>ee(t,e,c)));e?e.push(t):r.push([t])}return[t,r.map(t=>[t[0],t[t.length-1]])]}).forEach(([t,e])=>{e.forEach(([e,i])=>{l.push(r.svg`
              <line
                x1=${t}
                x2=${t}
                y1=${e}
                y2=${i}
                stroke=${o}
                stroke-width=${c/1.25}
                stroke-linecap="round"
              />
            `)})}),l}},ei=v.css`
  :host {
    position: relative;
    user-select: none;
    display: block;
    overflow: hidden;
    aspect-ratio: 1 / 1;
    width: var(--local-size);
  }

  :host([data-theme='dark']) {
    border-radius: clamp(0px, var(--wui-border-radius-l), 40px);
    background-color: var(--wui-color-inverse-100);
    padding: var(--wui-spacing-l);
  }

  :host([data-theme='light']) {
    box-shadow: 0 0 0 1px var(--wui-color-bg-125);
    background-color: var(--wui-color-bg-125);
  }

  :host([data-clear='true']) > wui-icon {
    display: none;
  }

  svg:first-child,
  wui-image,
  wui-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
  }

  wui-image {
    width: 25%;
    height: 25%;
    border-radius: var(--wui-border-radius-xs);
  }

  wui-icon {
    width: 100%;
    height: 100%;
    color: var(--local-icon-color) !important;
    transform: translateY(-50%) translateX(-50%) scale(0.25);
  }
`;var eo=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let en=class extends t7.LitElement{constructor(){super(...arguments),this.uri="",this.size=0,this.theme="dark",this.imageSrc=void 0,this.alt=void 0,this.arenaClear=void 0,this.farcaster=void 0}render(){return this.dataset.theme=this.theme,this.dataset.clear=String(this.arenaClear),this.style.cssText=`
     --local-size: ${this.size}px;
     --local-icon-color: ${this.color??"#3396ff"}
    `,r.html`${this.templateVisual()} ${this.templateSvg()}`}templateSvg(){let t="light"===this.theme?this.size:this.size-32;return r.svg`
      <svg height=${t} width=${t}>
        ${er.generate({uri:this.uri,size:t,logoSize:this.arenaClear?0:t/4,dotColor:this.color})}
      </svg>
    `}templateVisual(){return this.imageSrc?r.html`<wui-image src=${this.imageSrc} alt=${this.alt??"logo"}></wui-image>`:this.farcaster?r.html`<wui-icon
        class="farcaster"
        size="inherit"
        color="inherit"
        name="farcaster"
      ></wui-icon>`:r.html`<wui-icon size="inherit" color="inherit" name="walletConnect"></wui-icon>`}};en.styles=[f.resetStyles,ei],eo([(0,u.property)()],en.prototype,"uri",void 0),eo([(0,u.property)({type:Number})],en.prototype,"size",void 0),eo([(0,u.property)()],en.prototype,"theme",void 0),eo([(0,u.property)()],en.prototype,"imageSrc",void 0),eo([(0,u.property)()],en.prototype,"alt",void 0),eo([(0,u.property)()],en.prototype,"color",void 0),eo([(0,u.property)({type:Boolean})],en.prototype,"arenaClear",void 0),eo([(0,u.property)({type:Boolean})],en.prototype,"farcaster",void 0),en=eo([(0,s.customElement)("wui-qr-code")],en);var ea=e;let el=v.css`
  :host {
    display: block;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
    background: linear-gradient(
      120deg,
      var(--wui-color-bg-200) 5%,
      var(--wui-color-bg-200) 48%,
      var(--wui-color-bg-300) 55%,
      var(--wui-color-bg-300) 60%,
      var(--wui-color-bg-300) calc(60% + 10px),
      var(--wui-color-bg-200) calc(60% + 12px),
      var(--wui-color-bg-200) 100%
    );
    background-size: 250%;
    animation: shimmer 3s linear infinite reverse;
  }

  :host([variant='light']) {
    background: linear-gradient(
      120deg,
      var(--wui-color-bg-150) 5%,
      var(--wui-color-bg-150) 48%,
      var(--wui-color-bg-200) 55%,
      var(--wui-color-bg-200) 60%,
      var(--wui-color-bg-200) calc(60% + 10px),
      var(--wui-color-bg-150) calc(60% + 12px),
      var(--wui-color-bg-150) 100%
    );
    background-size: 250%;
  }

  @keyframes shimmer {
    from {
      background-position: -250% 0;
    }
    to {
      background-position: 250% 0;
    }
  }
`;var es=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let ec=class extends ea.LitElement{constructor(){super(...arguments),this.width="",this.height="",this.borderRadius="m",this.variant="default"}render(){return this.style.cssText=`
      width: ${this.width};
      height: ${this.height};
      border-radius: clamp(0px,var(--wui-border-radius-${this.borderRadius}), 40px);
    `,r.html`<slot></slot>`}};ec.styles=[el],es([(0,u.property)()],ec.prototype,"width",void 0),es([(0,u.property)()],ec.prototype,"height",void 0),es([(0,u.property)()],ec.prototype,"borderRadius",void 0),es([(0,u.property)()],ec.prototype,"variant",void 0),ec=es([(0,s.customElement)("wui-shimmer")],ec);var eu=e;let ed=v.css`
  .reown-logo {
    height: var(--wui-spacing-xxl);
  }

  a {
    text-decoration: none;
    cursor: pointer;
  }

  a:hover {
    opacity: 0.9;
  }
`,ep=class extends eu.LitElement{render(){return r.html`
      <a
        data-testid="ux-branding-reown"
        href=${"https://reown.com"}
        rel="noreferrer"
        target="_blank"
        style="text-decoration: none;"
      >
        <wui-flex
          justifyContent="center"
          alignItems="center"
          gap="xs"
          .padding=${["0","0","l","0"]}
        >
          <wui-text variant="small-500" color="fg-100"> UX by </wui-text>
          <wui-icon name="reown" size="xxxl" class="reown-logo"></wui-icon>
        </wui-flex>
      </a>
    `}};ep.styles=[f.resetStyles,f.elementStyles,ed],ep=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a}([(0,s.customElement)("wui-ux-by-reown")],ep);let eh=v.css`
  @keyframes fadein {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  wui-shimmer {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: clamp(0px, var(--wui-border-radius-l), 40px) !important;
  }

  wui-qr-code {
    opacity: 0;
    animation-duration: 200ms;
    animation-timing-function: ease;
    animation-name: fadein;
    animation-fill-mode: forwards;
  }
`,eg=class extends t2{constructor(){super(),this.forceUpdate=()=>{this.requestUpdate()},window.addEventListener("resize",this.forceUpdate),h.EventsController.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet?.name??"WalletConnect",platform:"qrcode"}})}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.forEach(t=>t()),window.removeEventListener("resize",this.forceUpdate)}render(){return this.onRenderProxy(),r.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["0","xl","xl","xl"]}
        gap="xl"
      >
        <wui-shimmer borderRadius="l" width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>

        <wui-text variant="paragraph-500" color="fg-100">
          Scan this QR Code with your phone
        </wui-text>
        ${this.copyTemplate()}
      </wui-flex>
      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}onRenderProxy(){!this.ready&&this.uri&&(this.timeout=setTimeout(()=>{this.ready=!0},200))}qrCodeTemplate(){if(!this.uri||!this.ready)return null;let t=this.getBoundingClientRect().width-40,e=this.wallet?this.wallet.name:void 0;return B.ConnectionController.setWcLinking(void 0),B.ConnectionController.setRecentWallet(this.wallet),r.html` <wui-qr-code
      size=${t}
      theme=${tR.ThemeController.state.themeMode}
      uri=${this.uri}
      imageSrc=${(0,d.ifDefined)(P.AssetUtil.getWalletImage(this.wallet))}
      color=${(0,d.ifDefined)(tR.ThemeController.state.themeVariables["--w3m-qr-color"])}
      alt=${(0,d.ifDefined)(e)}
      data-testid="wui-qr-code"
    ></wui-qr-code>`}copyTemplate(){let t=!this.uri||!this.ready;return r.html`<wui-link
      .disabled=${t}
      @click=${this.onCopyUri}
      color="fg-200"
      data-testid="copy-wc2-uri"
    >
      <wui-icon size="xs" color="fg-200" slot="iconLeft" name="copy"></wui-icon>
      Copy link
    </wui-link>`}};eg.styles=eh,eg=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a}([(0,s.customElement)("w3m-connecting-wc-qrcode")],eg);var ew=e;let ef=class extends ew.LitElement{constructor(){if(super(),this.wallet=g.RouterController.state.data?.wallet,!this.wallet)throw Error("w3m-connecting-wc-unsupported: No wallet provided");h.EventsController.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser"}})}render(){return r.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["3xl","xl","xl","xl"]}
        gap="xl"
      >
        <wui-wallet-image
          size="lg"
          imageSrc=${(0,d.ifDefined)(P.AssetUtil.getWalletImage(this.wallet))}
        ></wui-wallet-image>

        <wui-text variant="paragraph-500" color="fg-100">Not Detected</wui-text>
      </wui-flex>

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}};ef=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a}([(0,s.customElement)("w3m-connecting-wc-unsupported")],ef);var em=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let eb=class extends t2{constructor(){if(super(),this.isLoading=!0,!this.wallet)throw Error("w3m-connecting-wc-web: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.secondaryBtnLabel="Open",this.secondaryLabel=t6.ConstantsUtil.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.updateLoadingState(),this.unsubscribe.push(B.ConnectionController.subscribeKey("wcUri",()=>{this.updateLoadingState()})),h.EventsController.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"web"}})}updateLoadingState(){this.isLoading=!this.uri}onConnectProxy(){if(this.wallet?.webapp_link&&this.uri)try{this.error=!1;let{webapp_link:t,name:e}=this.wallet,{redirect:r,href:i}=n.CoreHelperUtil.formatUniversalUrl(t,this.uri);B.ConnectionController.setWcLinking({name:e,href:i}),B.ConnectionController.setRecentWallet(this.wallet),n.CoreHelperUtil.openHref(r,"_blank")}catch{this.error=!0}}};em([(0,i.state)()],eb.prototype,"isLoading",void 0),eb=em([(0,s.customElement)("w3m-connecting-wc-web")],eb);var ev=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let ey=class extends tw.LitElement{constructor(){super(),this.wallet=g.RouterController.state.data?.wallet,this.unsubscribe=[],this.platform=void 0,this.platforms=[],this.isSiwxEnabled=!!a.OptionsController.state.siwx,this.remoteFeatures=a.OptionsController.state.remoteFeatures,this.determinePlatforms(),this.initializeConnection(),this.unsubscribe.push(a.OptionsController.subscribeKey("remoteFeatures",t=>this.remoteFeatures=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){return r.html`
      ${this.headerTemplate()}
      <div>${this.platformTemplate()}</div>
      ${this.reownBrandingTemplate()}
    `}reownBrandingTemplate(){return this.remoteFeatures?.reownBranding?r.html`<wui-ux-by-reown></wui-ux-by-reown>`:null}async initializeConnection(t=!1){if("browser"!==this.platform&&(!a.OptionsController.state.manualWCControl||t))try{let{wcPairingExpiry:e,status:r}=B.ConnectionController.state;(t||a.OptionsController.state.enableEmbedded||n.CoreHelperUtil.isPairingExpired(e)||"connecting"===r)&&(await B.ConnectionController.connectWalletConnect(),this.isSiwxEnabled||tf.ModalController.close())}catch(t){h.EventsController.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:t?.message??"Unknown"}}),B.ConnectionController.setWcError(!0),tm.SnackController.showError(t.message??"Connection error"),B.ConnectionController.resetWcConnection(),g.RouterController.goBack()}}determinePlatforms(){if(!this.wallet){this.platforms.push("qrcode"),this.platform="qrcode";return}if(this.platform)return;let{mobile_link:t,desktop_link:e,webapp_link:r,injected:i,rdns:o}=this.wallet,l=i?.map(({injected_id:t})=>t).filter(Boolean),s=[...o?[o]:l??[]],c=!a.OptionsController.state.isUniversalProvider&&s.length,u=B.ConnectionController.checkInstalled(s),d=c&&u,p=e&&!n.CoreHelperUtil.isMobile();d&&!te.ChainController.state.noAdapters&&this.platforms.push("browser"),t&&this.platforms.push(n.CoreHelperUtil.isMobile()?"mobile":"qrcode"),r&&this.platforms.push("web"),p&&this.platforms.push("desktop"),d||!c||te.ChainController.state.noAdapters||this.platforms.push("unsupported"),this.platform=this.platforms[0]}platformTemplate(){switch(this.platform){case"browser":return r.html`<w3m-connecting-wc-browser></w3m-connecting-wc-browser>`;case"web":return r.html`<w3m-connecting-wc-web></w3m-connecting-wc-web>`;case"desktop":return r.html`
          <w3m-connecting-wc-desktop .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-desktop>
        `;case"mobile":return r.html`
          <w3m-connecting-wc-mobile isMobile .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-mobile>
        `;case"qrcode":return r.html`<w3m-connecting-wc-qrcode></w3m-connecting-wc-qrcode>`;default:return r.html`<w3m-connecting-wc-unsupported></w3m-connecting-wc-unsupported>`}}headerTemplate(){return this.platforms.length>1?r.html`
      <w3m-connecting-header
        .platforms=${this.platforms}
        .onSelectPlatfrom=${this.onSelectPlatform.bind(this)}
      >
      </w3m-connecting-header>
    `:null}async onSelectPlatform(t){let e=this.shadowRoot?.querySelector("div");e&&(await e.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.platform=t,e.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}};ev([(0,i.state)()],ey.prototype,"platform",void 0),ev([(0,i.state)()],ey.prototype,"platforms",void 0),ev([(0,i.state)()],ey.prototype,"isSiwxEnabled",void 0),ev([(0,i.state)()],ey.prototype,"remoteFeatures",void 0),ey=ev([(0,s.customElement)("w3m-connecting-wc-view")],ey);var ex=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let eC=class extends e.LitElement{constructor(){super(...arguments),this.isMobile=n.CoreHelperUtil.isMobile()}render(){if(this.isMobile){let{featured:t,recommended:e}=o.ApiController.state,{customWallets:i}=a.OptionsController.state,n=l.StorageUtil.getRecentWallets(),s=t.length||e.length||i?.length||n.length;return r.html`<wui-flex
        flexDirection="column"
        gap="xs"
        .margin=${["3xs","s","s","s"]}
      >
        ${s?r.html`<w3m-connector-list></w3m-connector-list>`:null}
        <w3m-all-wallets-widget></w3m-all-wallets-widget>
      </wui-flex>`}return r.html`<wui-flex flexDirection="column" .padding=${["0","0","l","0"]}>
      <w3m-connecting-wc-view></w3m-connecting-wc-view>
      <wui-flex flexDirection="column" .padding=${["0","m","0","m"]}>
        <w3m-all-wallets-widget></w3m-all-wallets-widget> </wui-flex
    ></wui-flex>`}};ex([(0,i.state)()],eC.prototype,"isMobile",void 0),eC=ex([(0,s.customElement)("w3m-connecting-wc-basic-view")],eC),t.s(["W3mConnectingWcBasicView",0,eC],99277);var e$=e,eE=e,ek=e,eR=t.i(60025),eI=t.i(26964);let eS=()=>new eT;class eT{}let eL=new WeakMap,eO=(0,eI.directive)(class extends eR.AsyncDirective{render(t){return r.nothing}update(t,[e]){let i=e!==this.G;return i&&this.rt(void 0),(i||this.lt!==this.ct)&&(this.G=e,this.ht=t.options?.host,this.rt(this.ct=t.element)),r.nothing}rt(t){if(void 0!==this.G)if(this.isConnected||(t=void 0),"function"==typeof this.G){let e=this.ht??globalThis,r=eL.get(e);void 0===r&&(r=new WeakMap,eL.set(e,r)),void 0!==r.get(this.G)&&this.G.call(this.ht,void 0),r.set(this.G,t),void 0!==t&&this.G.call(this.ht,t)}else this.G.value=t}get lt(){return"function"==typeof this.G?eL.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}}),eA=v.css`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  label {
    position: relative;
    display: inline-block;
    width: 32px;
    height: 22px;
  }

  input {
    width: 0;
    height: 0;
    opacity: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--wui-color-blue-100);
    border-width: 1px;
    border-style: solid;
    border-color: var(--wui-color-gray-glass-002);
    border-radius: 999px;
    transition:
      background-color var(--wui-ease-inout-power-1) var(--wui-duration-md),
      border-color var(--wui-ease-inout-power-1) var(--wui-duration-md);
    will-change: background-color, border-color;
  }

  span:before {
    position: absolute;
    content: '';
    height: 16px;
    width: 16px;
    left: 3px;
    top: 2px;
    background-color: var(--wui-color-inverse-100);
    transition: transform var(--wui-ease-inout-power-1) var(--wui-duration-lg);
    will-change: transform;
    border-radius: 50%;
  }

  input:checked + span {
    border-color: var(--wui-color-gray-glass-005);
    background-color: var(--wui-color-blue-100);
  }

  input:not(:checked) + span {
    background-color: var(--wui-color-gray-glass-010);
  }

  input:checked + span:before {
    transform: translateX(calc(100% - 7px));
  }
`;var eP=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let eU=class extends ek.LitElement{constructor(){super(...arguments),this.inputElementRef=eS(),this.checked=void 0}render(){return r.html`
      <label>
        <input
          ${eO(this.inputElementRef)}
          type="checkbox"
          ?checked=${(0,d.ifDefined)(this.checked)}
          @change=${this.dispatchChangeEvent.bind(this)}
        />
        <span></span>
      </label>
    `}dispatchChangeEvent(){this.dispatchEvent(new CustomEvent("switchChange",{detail:this.inputElementRef.value?.checked,bubbles:!0,composed:!0}))}};eU.styles=[f.resetStyles,f.elementStyles,f.colorStyles,eA],eP([(0,u.property)({type:Boolean})],eU.prototype,"checked",void 0),eU=eP([(0,s.customElement)("wui-switch")],eU);let ej=v.css`
  :host {
    height: 100%;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: var(--wui-spacing-1xs);
    padding: var(--wui-spacing-xs) var(--wui-spacing-s);
    background-color: var(--wui-color-gray-glass-002);
    border-radius: var(--wui-border-radius-xs);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-002);
    transition: background-color var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: background-color;
    cursor: pointer;
  }

  wui-switch {
    pointer-events: none;
  }
`;var eD=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let ez=class extends eE.LitElement{constructor(){super(...arguments),this.checked=void 0}render(){return r.html`
      <button>
        <wui-icon size="xl" name="walletConnectBrown"></wui-icon>
        <wui-switch ?checked=${(0,d.ifDefined)(this.checked)}></wui-switch>
      </button>
    `}};ez.styles=[f.resetStyles,f.elementStyles,ej],eD([(0,u.property)({type:Boolean})],ez.prototype,"checked",void 0),ez=eD([(0,s.customElement)("wui-certified-switch")],ez);var eB=e,eW=e;let eN=v.css`
  button {
    background-color: var(--wui-color-fg-300);
    border-radius: var(--wui-border-radius-4xs);
    width: 16px;
    height: 16px;
  }

  button:disabled {
    background-color: var(--wui-color-bg-300);
  }

  wui-icon {
    color: var(--wui-color-bg-200) !important;
  }

  button:focus-visible {
    background-color: var(--wui-color-fg-250);
    border: 1px solid var(--wui-color-accent-100);
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      background-color: var(--wui-color-fg-250);
    }

    button:active:enabled {
      background-color: var(--wui-color-fg-225);
    }
  }
`;var eM=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let eH=class extends eW.LitElement{constructor(){super(...arguments),this.icon="copy"}render(){return r.html`
      <button>
        <wui-icon color="inherit" size="xxs" name=${this.icon}></wui-icon>
      </button>
    `}};eH.styles=[f.resetStyles,f.elementStyles,eN],eM([(0,u.property)()],eH.prototype,"icon",void 0),eH=eM([(0,s.customElement)("wui-input-element")],eH);var e_=e;t.i(52283);var eq=t.i(36441);let eK=v.css`
  :host {
    position: relative;
    width: 100%;
    display: inline-block;
    color: var(--wui-color-fg-275);
  }

  input {
    width: 100%;
    border-radius: var(--wui-border-radius-xs);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-002);
    background: var(--wui-color-gray-glass-002);
    font-size: var(--wui-font-size-paragraph);
    letter-spacing: var(--wui-letter-spacing-paragraph);
    color: var(--wui-color-fg-100);
    transition:
      background-color var(--wui-ease-inout-power-1) var(--wui-duration-md),
      border-color var(--wui-ease-inout-power-1) var(--wui-duration-md),
      box-shadow var(--wui-ease-inout-power-1) var(--wui-duration-md);
    will-change: background-color, border-color, box-shadow;
    caret-color: var(--wui-color-accent-100);
  }

  input:disabled {
    cursor: not-allowed;
    border: 1px solid var(--wui-color-gray-glass-010);
  }

  input:disabled::placeholder,
  input:disabled + wui-icon {
    color: var(--wui-color-fg-300);
  }

  input::placeholder {
    color: var(--wui-color-fg-275);
  }

  input:focus:enabled {
    background-color: var(--wui-color-gray-glass-005);
    -webkit-box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0px 0px 0px 4px var(--wui-box-shadow-blue);
    -moz-box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0px 0px 0px 4px var(--wui-box-shadow-blue);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0px 0px 0px 4px var(--wui-box-shadow-blue);
  }

  input:hover:enabled {
    background-color: var(--wui-color-gray-glass-005);
  }

  wui-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }

  .wui-size-sm {
    padding: 9px var(--wui-spacing-m) 10px var(--wui-spacing-s);
  }

  wui-icon + .wui-size-sm {
    padding: 9px var(--wui-spacing-m) 10px 36px;
  }

  wui-icon[data-input='sm'] {
    left: var(--wui-spacing-s);
  }

  .wui-size-md {
    padding: 15px var(--wui-spacing-m) var(--wui-spacing-l) var(--wui-spacing-m);
  }

  wui-icon + .wui-size-md,
  wui-loading-spinner + .wui-size-md {
    padding: 10.5px var(--wui-spacing-3xl) 10.5px var(--wui-spacing-3xl);
  }

  wui-icon[data-input='md'] {
    left: var(--wui-spacing-l);
  }

  .wui-size-lg {
    padding: var(--wui-spacing-s) var(--wui-spacing-s) var(--wui-spacing-s) var(--wui-spacing-l);
    letter-spacing: var(--wui-letter-spacing-medium-title);
    font-size: var(--wui-font-size-medium-title);
    font-weight: var(--wui-font-weight-light);
    line-height: 130%;
    color: var(--wui-color-fg-100);
    height: 64px;
  }

  .wui-padding-right-xs {
    padding-right: var(--wui-spacing-xs);
  }

  .wui-padding-right-s {
    padding-right: var(--wui-spacing-s);
  }

  .wui-padding-right-m {
    padding-right: var(--wui-spacing-m);
  }

  .wui-padding-right-l {
    padding-right: var(--wui-spacing-l);
  }

  .wui-padding-right-xl {
    padding-right: var(--wui-spacing-xl);
  }

  .wui-padding-right-2xl {
    padding-right: var(--wui-spacing-2xl);
  }

  .wui-padding-right-3xl {
    padding-right: var(--wui-spacing-3xl);
  }

  .wui-padding-right-4xl {
    padding-right: var(--wui-spacing-4xl);
  }

  .wui-padding-right-5xl {
    padding-right: var(--wui-spacing-5xl);
  }

  wui-icon + .wui-size-lg,
  wui-loading-spinner + .wui-size-lg {
    padding-left: 50px;
  }

  wui-icon[data-input='lg'] {
    left: var(--wui-spacing-l);
  }

  .wui-size-mdl {
    padding: 17.25px var(--wui-spacing-m) 17.25px var(--wui-spacing-m);
  }
  wui-icon + .wui-size-mdl,
  wui-loading-spinner + .wui-size-mdl {
    padding: 17.25px var(--wui-spacing-3xl) 17.25px 40px;
  }
  wui-icon[data-input='mdl'] {
    left: var(--wui-spacing-m);
  }

  input:placeholder-shown ~ ::slotted(wui-input-element),
  input:placeholder-shown ~ ::slotted(wui-icon) {
    opacity: 0;
    pointer-events: none;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }

  ::slotted(wui-input-element),
  ::slotted(wui-icon) {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  ::slotted(wui-input-element) {
    right: var(--wui-spacing-m);
  }

  ::slotted(wui-icon) {
    right: 0px;
  }
`;var eV=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let eF=class extends e_.LitElement{constructor(){super(...arguments),this.inputElementRef=eS(),this.size="md",this.disabled=!1,this.placeholder="",this.type="text",this.value=""}render(){let t=`wui-padding-right-${this.inputRightPadding}`,e={[`wui-size-${this.size}`]:!0,[t]:!!this.inputRightPadding};return r.html`${this.templateIcon()}
      <input
        data-testid="wui-input-text"
        ${eO(this.inputElementRef)}
        class=${(0,eq.classMap)(e)}
        type=${this.type}
        enterkeyhint=${(0,d.ifDefined)(this.enterKeyHint)}
        ?disabled=${this.disabled}
        placeholder=${this.placeholder}
        @input=${this.dispatchInputChangeEvent.bind(this)}
        .value=${this.value||""}
        tabindex=${(0,d.ifDefined)(this.tabIdx)}
      />
      <slot></slot>`}templateIcon(){return this.icon?r.html`<wui-icon
        data-input=${this.size}
        size=${this.size}
        color="inherit"
        name=${this.icon}
      ></wui-icon>`:null}dispatchInputChangeEvent(){this.dispatchEvent(new CustomEvent("inputChange",{detail:this.inputElementRef.value?.value,bubbles:!0,composed:!0}))}};eF.styles=[f.resetStyles,f.elementStyles,eK],eV([(0,u.property)()],eF.prototype,"size",void 0),eV([(0,u.property)()],eF.prototype,"icon",void 0),eV([(0,u.property)({type:Boolean})],eF.prototype,"disabled",void 0),eV([(0,u.property)()],eF.prototype,"placeholder",void 0),eV([(0,u.property)()],eF.prototype,"type",void 0),eV([(0,u.property)()],eF.prototype,"keyHint",void 0),eV([(0,u.property)()],eF.prototype,"value",void 0),eV([(0,u.property)()],eF.prototype,"inputRightPadding",void 0),eV([(0,u.property)()],eF.prototype,"tabIdx",void 0),eF=eV([(0,s.customElement)("wui-input-text")],eF);let eY=v.css`
  :host {
    position: relative;
    display: inline-block;
    width: 100%;
  }
`,eG=class extends eB.LitElement{constructor(){super(...arguments),this.inputComponentRef=eS()}render(){return r.html`
      <wui-input-text
        ${eO(this.inputComponentRef)}
        placeholder="Search wallet"
        icon="search"
        type="search"
        enterKeyHint="search"
        size="sm"
      >
        <wui-input-element @click=${this.clearValue} icon="close"></wui-input-element>
      </wui-input-text>
    `}clearValue(){let t=this.inputComponentRef.value,e=t?.inputElementRef.value;e&&(e.value="",e.focus(),e.dispatchEvent(new Event("input")))}};eG.styles=[f.resetStyles,eY],eG=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a}([(0,s.customElement)("wui-search-bar")],eG);var eJ=e,eQ=e;let eX=r.svg`<svg  viewBox="0 0 48 54" fill="none">
  <path
    d="M43.4605 10.7248L28.0485 1.61089C25.5438 0.129705 22.4562 0.129705 19.9515 1.61088L4.53951 10.7248C2.03626 12.2051 0.5 14.9365 0.5 17.886V36.1139C0.5 39.0635 2.03626 41.7949 4.53951 43.2752L19.9515 52.3891C22.4562 53.8703 25.5438 53.8703 28.0485 52.3891L43.4605 43.2752C45.9637 41.7949 47.5 39.0635 47.5 36.114V17.8861C47.5 14.9365 45.9637 12.2051 43.4605 10.7248Z"
  />
</svg>`,eZ=v.css`
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 104px;
    row-gap: var(--wui-spacing-xs);
    padding: var(--wui-spacing-xs) 10px;
    background-color: var(--wui-color-gray-glass-002);
    border-radius: clamp(0px, var(--wui-border-radius-xs), 20px);
    position: relative;
  }

  wui-shimmer[data-type='network'] {
    border: none;
    -webkit-clip-path: var(--wui-path-network);
    clip-path: var(--wui-path-network);
  }

  svg {
    position: absolute;
    width: 48px;
    height: 54px;
    z-index: 1;
  }

  svg > path {
    stroke: var(--wui-color-gray-glass-010);
    stroke-width: 1px;
  }

  @media (max-width: 350px) {
    :host {
      width: 100%;
    }
  }
`;var e0=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let e1=class extends eQ.LitElement{constructor(){super(...arguments),this.type="wallet"}render(){return r.html`
      ${this.shimmerTemplate()}
      <wui-shimmer width="56px" height="20px" borderRadius="xs"></wui-shimmer>
    `}shimmerTemplate(){return"network"===this.type?r.html` <wui-shimmer
          data-type=${this.type}
          width="48px"
          height="54px"
          borderRadius="xs"
        ></wui-shimmer>
        ${eX}`:r.html`<wui-shimmer width="56px" height="56px" borderRadius="xs"></wui-shimmer>`}};e1.styles=[f.resetStyles,f.elementStyles,eZ],e0([(0,u.property)()],e1.prototype,"type",void 0),e1=e0([(0,s.customElement)("wui-card-select-loader")],e1);var e3=e;let e2=v.css`
  :host {
    display: grid;
    width: inherit;
    height: inherit;
  }
`;var e5=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let e4=class extends e3.LitElement{render(){return this.style.cssText=`
      grid-template-rows: ${this.gridTemplateRows};
      grid-template-columns: ${this.gridTemplateColumns};
      justify-items: ${this.justifyItems};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      align-content: ${this.alignContent};
      column-gap: ${this.columnGap&&`var(--wui-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap&&`var(--wui-spacing-${this.rowGap})`};
      gap: ${this.gap&&`var(--wui-spacing-${this.gap})`};
      padding-top: ${this.padding&&t_.UiHelperUtil.getSpacingStyles(this.padding,0)};
      padding-right: ${this.padding&&t_.UiHelperUtil.getSpacingStyles(this.padding,1)};
      padding-bottom: ${this.padding&&t_.UiHelperUtil.getSpacingStyles(this.padding,2)};
      padding-left: ${this.padding&&t_.UiHelperUtil.getSpacingStyles(this.padding,3)};
      margin-top: ${this.margin&&t_.UiHelperUtil.getSpacingStyles(this.margin,0)};
      margin-right: ${this.margin&&t_.UiHelperUtil.getSpacingStyles(this.margin,1)};
      margin-bottom: ${this.margin&&t_.UiHelperUtil.getSpacingStyles(this.margin,2)};
      margin-left: ${this.margin&&t_.UiHelperUtil.getSpacingStyles(this.margin,3)};
    `,r.html`<slot></slot>`}};e4.styles=[f.resetStyles,e2],e5([(0,u.property)()],e4.prototype,"gridTemplateRows",void 0),e5([(0,u.property)()],e4.prototype,"gridTemplateColumns",void 0),e5([(0,u.property)()],e4.prototype,"justifyItems",void 0),e5([(0,u.property)()],e4.prototype,"alignItems",void 0),e5([(0,u.property)()],e4.prototype,"justifyContent",void 0),e5([(0,u.property)()],e4.prototype,"alignContent",void 0),e5([(0,u.property)()],e4.prototype,"columnGap",void 0),e5([(0,u.property)()],e4.prototype,"rowGap",void 0),e5([(0,u.property)()],e4.prototype,"gap",void 0),e5([(0,u.property)()],e4.prototype,"padding",void 0),e5([(0,u.property)()],e4.prototype,"margin",void 0),e4=e5([(0,s.customElement)("wui-grid")],e4);var e6=e;let e8=v.css`
  button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    width: 104px;
    row-gap: var(--wui-spacing-xs);
    padding: var(--wui-spacing-s) var(--wui-spacing-0);
    background-color: var(--wui-color-gray-glass-002);
    border-radius: clamp(0px, var(--wui-border-radius-xs), 20px);
    transition:
      color var(--wui-duration-lg) var(--wui-ease-out-power-1),
      background-color var(--wui-duration-lg) var(--wui-ease-out-power-1),
      border-radius var(--wui-duration-lg) var(--wui-ease-out-power-1);
    will-change: background-color, color, border-radius;
    outline: none;
    border: none;
  }

  button > wui-flex > wui-text {
    color: var(--wui-color-fg-100);
    max-width: 86px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: center;
  }

  button > wui-flex > wui-text.certified {
    max-width: 66px;
  }

  button:hover:enabled {
    background-color: var(--wui-color-gray-glass-005);
  }

  button:disabled > wui-flex > wui-text {
    color: var(--wui-color-gray-glass-015);
  }

  [data-selected='true'] {
    background-color: var(--wui-color-accent-glass-020);
  }

  @media (hover: hover) and (pointer: fine) {
    [data-selected='true']:hover:enabled {
      background-color: var(--wui-color-accent-glass-015);
    }
  }

  [data-selected='true']:active:enabled {
    background-color: var(--wui-color-accent-glass-010);
  }

  @media (max-width: 350px) {
    button {
      width: 100%;
    }
  }
`;var e9=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let e7=class extends e6.LitElement{constructor(){super(),this.observer=new IntersectionObserver(()=>void 0),this.visible=!1,this.imageSrc=void 0,this.imageLoading=!1,this.wallet=void 0,this.observer=new IntersectionObserver(t=>{t.forEach(t=>{t.isIntersecting?(this.visible=!0,this.fetchImageSrc()):this.visible=!1})},{threshold:.01})}firstUpdated(){this.observer.observe(this)}disconnectedCallback(){this.observer.disconnect()}render(){let t=this.wallet?.badge_type==="certified";return r.html`
      <button>
        ${this.imageTemplate()}
        <wui-flex flexDirection="row" alignItems="center" justifyContent="center" gap="3xs">
          <wui-text
            variant="tiny-500"
            color="inherit"
            class=${(0,d.ifDefined)(t?"certified":void 0)}
            >${this.wallet?.name}</wui-text
          >
          ${t?r.html`<wui-icon size="sm" name="walletConnectBrown"></wui-icon>`:null}
        </wui-flex>
      </button>
    `}imageTemplate(){return(this.visible||this.imageSrc)&&!this.imageLoading?r.html`
      <wui-wallet-image
        size="md"
        imageSrc=${(0,d.ifDefined)(this.imageSrc)}
        name=${this.wallet?.name}
        .installed=${this.wallet?.installed}
        badgeSize="sm"
      >
      </wui-wallet-image>
    `:this.shimmerTemplate()}shimmerTemplate(){return r.html`<wui-shimmer width="56px" height="56px" borderRadius="xs"></wui-shimmer>`}async fetchImageSrc(){!this.wallet||(this.imageSrc=P.AssetUtil.getWalletImage(this.wallet),this.imageSrc||(this.imageLoading=!0,this.imageSrc=await P.AssetUtil.fetchWalletImage(this.wallet.image_id),this.imageLoading=!1))}};e7.styles=e8,e9([(0,i.state)()],e7.prototype,"visible",void 0),e9([(0,i.state)()],e7.prototype,"imageSrc",void 0),e9([(0,i.state)()],e7.prototype,"imageLoading",void 0),e9([(0,u.property)()],e7.prototype,"wallet",void 0),e7=e9([(0,s.customElement)("w3m-all-wallets-list-item")],e7);let rt=v.css`
  wui-grid {
    max-height: clamp(360px, 400px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-loading-spinner {
    padding-top: var(--wui-spacing-l);
    padding-bottom: var(--wui-spacing-l);
    justify-content: center;
    grid-column: 1 / span 4;
  }
`;var re=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let rr="local-paginator",ri=class extends eJ.LitElement{constructor(){super(),this.unsubscribe=[],this.paginationObserver=void 0,this.loading=!o.ApiController.state.wallets.length,this.wallets=o.ApiController.state.wallets,this.recommended=o.ApiController.state.recommended,this.featured=o.ApiController.state.featured,this.filteredWallets=o.ApiController.state.filteredWallets,this.unsubscribe.push(o.ApiController.subscribeKey("wallets",t=>this.wallets=t),o.ApiController.subscribeKey("recommended",t=>this.recommended=t),o.ApiController.subscribeKey("featured",t=>this.featured=t),o.ApiController.subscribeKey("filteredWallets",t=>this.filteredWallets=t))}firstUpdated(){this.initialFetch(),this.createPaginationObserver()}disconnectedCallback(){this.unsubscribe.forEach(t=>t()),this.paginationObserver?.disconnect()}render(){return r.html`
      <wui-grid
        data-scroll=${!this.loading}
        .padding=${["0","s","s","s"]}
        columnGap="xxs"
        rowGap="l"
        justifyContent="space-between"
      >
        ${this.loading?this.shimmerTemplate(16):this.walletsTemplate()}
        ${this.paginationLoaderTemplate()}
      </wui-grid>
    `}async initialFetch(){this.loading=!0;let t=this.shadowRoot?.querySelector("wui-grid");t&&(await o.ApiController.fetchWalletsByPage({page:1}),await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.loading=!1,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}shimmerTemplate(t,e){return[...Array(t)].map(()=>r.html`
        <wui-card-select-loader type="wallet" id=${(0,d.ifDefined)(e)}></wui-card-select-loader>
      `)}walletsTemplate(){let t=this.filteredWallets?.length>0?n.CoreHelperUtil.uniqueBy([...this.featured,...this.recommended,...this.filteredWallets],"id"):n.CoreHelperUtil.uniqueBy([...this.featured,...this.recommended,...this.wallets],"id");return tr.WalletUtil.markWalletsAsInstalled(t).map(t=>r.html`
        <w3m-all-wallets-list-item
          @click=${()=>this.onConnectWallet(t)}
          .wallet=${t}
        ></w3m-all-wallets-list-item>
      `)}paginationLoaderTemplate(){let{wallets:t,recommended:e,featured:r,count:i}=o.ApiController.state,n=window.innerWidth<352?3:4,a=t.length+e.length,l=Math.ceil(a/n)*n-a+n;return(l-=t.length?r.length%n:0,0===i&&r.length>0)?null:0===i||[...r,...t,...e].length<i?this.shimmerTemplate(l,rr):null}createPaginationObserver(){let t=this.shadowRoot?.querySelector(`#${rr}`);t&&(this.paginationObserver=new IntersectionObserver(([t])=>{if(t?.isIntersecting&&!this.loading){let{page:t,count:e,wallets:r}=o.ApiController.state;r.length<e&&o.ApiController.fetchWalletsByPage({page:t+1})}}),this.paginationObserver.observe(t))}onConnectWallet(t){p.ConnectorController.selectWalletConnector(t)}};ri.styles=rt,re([(0,i.state)()],ri.prototype,"loading",void 0),re([(0,i.state)()],ri.prototype,"wallets",void 0),re([(0,i.state)()],ri.prototype,"recommended",void 0),re([(0,i.state)()],ri.prototype,"featured",void 0),re([(0,i.state)()],ri.prototype,"filteredWallets",void 0),ri=re([(0,s.customElement)("w3m-all-wallets-list")],ri);var ro=e;let rn=v.css`
  wui-grid,
  wui-loading-spinner,
  wui-flex {
    height: 360px;
  }

  wui-grid {
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-loading-spinner {
    justify-content: center;
    align-items: center;
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;var ra=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let rl=class extends ro.LitElement{constructor(){super(...arguments),this.prevQuery="",this.prevBadge=void 0,this.loading=!0,this.query=""}render(){return this.onSearch(),this.loading?r.html`<wui-loading-spinner color="accent-100"></wui-loading-spinner>`:this.walletsTemplate()}async onSearch(){(this.query.trim()!==this.prevQuery.trim()||this.badge!==this.prevBadge)&&(this.prevQuery=this.query,this.prevBadge=this.badge,this.loading=!0,await o.ApiController.searchWallet({search:this.query,badge:this.badge}),this.loading=!1)}walletsTemplate(){let{search:t}=o.ApiController.state,e=tr.WalletUtil.markWalletsAsInstalled(t);return t.length?r.html`
      <wui-grid
        data-testid="wallet-list"
        .padding=${["0","s","s","s"]}
        rowGap="l"
        columnGap="xs"
        justifyContent="space-between"
      >
        ${e.map(t=>r.html`
            <w3m-all-wallets-list-item
              @click=${()=>this.onConnectWallet(t)}
              .wallet=${t}
              data-testid="wallet-search-item-${t.id}"
            ></w3m-all-wallets-list-item>
          `)}
      </wui-grid>
    `:r.html`
        <wui-flex
          data-testid="no-wallet-found"
          justifyContent="center"
          alignItems="center"
          gap="s"
          flexDirection="column"
        >
          <wui-icon-box
            size="lg"
            iconColor="fg-200"
            backgroundColor="fg-300"
            icon="wallet"
            background="transparent"
          ></wui-icon-box>
          <wui-text data-testid="no-wallet-found-text" color="fg-200" variant="paragraph-500">
            No Wallet found
          </wui-text>
        </wui-flex>
      `}onConnectWallet(t){p.ConnectorController.selectWalletConnector(t)}};rl.styles=rn,ra([(0,i.state)()],rl.prototype,"loading",void 0),ra([(0,u.property)()],rl.prototype,"query",void 0),ra([(0,u.property)()],rl.prototype,"badge",void 0),rl=ra([(0,s.customElement)("w3m-all-wallets-search")],rl);var rs=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let rc=class extends e$.LitElement{constructor(){super(...arguments),this.search="",this.onDebouncedSearch=n.CoreHelperUtil.debounce(t=>{this.search=t})}render(){let t=this.search.length>=2;return r.html`
      <wui-flex .padding=${["0","s","s","s"]} gap="xs">
        <wui-search-bar @inputChange=${this.onInputChange.bind(this)}></wui-search-bar>
        <wui-certified-switch
          ?checked=${this.badge}
          @click=${this.onClick.bind(this)}
          data-testid="wui-certified-switch"
        ></wui-certified-switch>
        ${this.qrButtonTemplate()}
      </wui-flex>
      ${t||this.badge?r.html`<w3m-all-wallets-search
            query=${this.search}
            badge=${(0,d.ifDefined)(this.badge)}
          ></w3m-all-wallets-search>`:r.html`<w3m-all-wallets-list badge=${(0,d.ifDefined)(this.badge)}></w3m-all-wallets-list>`}
    `}onInputChange(t){this.onDebouncedSearch(t.detail)}onClick(){if("certified"===this.badge){this.badge=void 0;return}this.badge="certified",tm.SnackController.showSvg("Only WalletConnect certified",{icon:"walletConnectBrown",iconColor:"accent-100"})}qrButtonTemplate(){return n.CoreHelperUtil.isMobile()?r.html`
        <wui-icon-box
          size="lg"
          iconSize="xl"
          iconColor="accent-100"
          backgroundColor="accent-100"
          icon="qrCode"
          background="transparent"
          border
          borderColor="wui-accent-glass-010"
          @click=${this.onWalletConnectQr.bind(this)}
        ></wui-icon-box>
      `:null}onWalletConnectQr(){g.RouterController.push("ConnectingWalletConnect")}};rs([(0,i.state)()],rc.prototype,"search",void 0),rs([(0,i.state)()],rc.prototype,"badge",void 0),rc=rs([(0,s.customElement)("w3m-all-wallets-view")],rc),t.s(["W3mAllWalletsView",0,rc],58128);var ru=e,rd=e;let rp=v.css`
  button {
    column-gap: var(--wui-spacing-s);
    padding: 11px 18px 11px var(--wui-spacing-s);
    width: 100%;
    background-color: var(--wui-color-gray-glass-002);
    border-radius: var(--wui-border-radius-xs);
    color: var(--wui-color-fg-250);
    transition:
      color var(--wui-ease-out-power-1) var(--wui-duration-md),
      background-color var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: color, background-color;
  }

  button[data-iconvariant='square'],
  button[data-iconvariant='square-blue'] {
    padding: 6px 18px 6px 9px;
  }

  button > wui-flex {
    flex: 1;
  }

  button > wui-image {
    width: 32px;
    height: 32px;
    box-shadow: 0 0 0 2px var(--wui-color-gray-glass-005);
    border-radius: var(--wui-border-radius-3xl);
  }

  button > wui-icon {
    width: 36px;
    height: 36px;
    transition: opacity var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: opacity;
  }

  button > wui-icon-box[data-variant='blue'] {
    box-shadow: 0 0 0 2px var(--wui-color-accent-glass-005);
  }

  button > wui-icon-box[data-variant='overlay'] {
    box-shadow: 0 0 0 2px var(--wui-color-gray-glass-005);
  }

  button > wui-icon-box[data-variant='square-blue'] {
    border-radius: var(--wui-border-radius-3xs);
    position: relative;
    border: none;
    width: 36px;
    height: 36px;
  }

  button > wui-icon-box[data-variant='square-blue']::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: inherit;
    border: 1px solid var(--wui-color-accent-glass-010);
    pointer-events: none;
  }

  button > wui-icon:last-child {
    width: 14px;
    height: 14px;
  }

  button:disabled {
    color: var(--wui-color-gray-glass-020);
  }

  button[data-loading='true'] > wui-icon {
    opacity: 0;
  }

  wui-loading-spinner {
    position: absolute;
    right: 18px;
    top: 50%;
    transform: translateY(-50%);
  }
`;var rh=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a};let rg=class extends rd.LitElement{constructor(){super(...arguments),this.tabIdx=void 0,this.variant="icon",this.disabled=!1,this.imageSrc=void 0,this.alt=void 0,this.chevron=!1,this.loading=!1}render(){return r.html`
      <button
        ?disabled=${!!this.loading||!!this.disabled}
        data-loading=${this.loading}
        data-iconvariant=${(0,d.ifDefined)(this.iconVariant)}
        tabindex=${(0,d.ifDefined)(this.tabIdx)}
      >
        ${this.loadingTemplate()} ${this.visualTemplate()}
        <wui-flex gap="3xs">
          <slot></slot>
        </wui-flex>
        ${this.chevronTemplate()}
      </button>
    `}visualTemplate(){if("image"===this.variant&&this.imageSrc)return r.html`<wui-image src=${this.imageSrc} alt=${this.alt??"list item"}></wui-image>`;if("square"===this.iconVariant&&this.icon&&"icon"===this.variant)return r.html`<wui-icon name=${this.icon}></wui-icon>`;if("icon"===this.variant&&this.icon&&this.iconVariant){let t=["blue","square-blue"].includes(this.iconVariant)?"accent-100":"fg-200",e="square-blue"===this.iconVariant?"mdl":"md",i=this.iconSize?this.iconSize:e;return r.html`
        <wui-icon-box
          data-variant=${this.iconVariant}
          icon=${this.icon}
          iconSize=${i}
          background="transparent"
          iconColor=${t}
          backgroundColor=${t}
          size=${e}
        ></wui-icon-box>
      `}return null}loadingTemplate(){return this.loading?r.html`<wui-loading-spinner
        data-testid="wui-list-item-loading-spinner"
        color="fg-300"
      ></wui-loading-spinner>`:r.html``}chevronTemplate(){return this.chevron?r.html`<wui-icon size="inherit" color="fg-200" name="chevronRight"></wui-icon>`:null}};rg.styles=[f.resetStyles,f.elementStyles,rp],rh([(0,u.property)()],rg.prototype,"icon",void 0),rh([(0,u.property)()],rg.prototype,"iconSize",void 0),rh([(0,u.property)()],rg.prototype,"tabIdx",void 0),rh([(0,u.property)()],rg.prototype,"variant",void 0),rh([(0,u.property)()],rg.prototype,"iconVariant",void 0),rh([(0,u.property)({type:Boolean})],rg.prototype,"disabled",void 0),rh([(0,u.property)()],rg.prototype,"imageSrc",void 0),rh([(0,u.property)()],rg.prototype,"alt",void 0),rh([(0,u.property)({type:Boolean})],rg.prototype,"chevron",void 0),rh([(0,u.property)({type:Boolean})],rg.prototype,"loading",void 0),rg=rh([(0,s.customElement)("wui-list-item")],rg);let rw=class extends ru.LitElement{constructor(){super(...arguments),this.wallet=g.RouterController.state.data?.wallet}render(){if(!this.wallet)throw Error("w3m-downloads-view");return r.html`
      <wui-flex gap="xs" flexDirection="column" .padding=${["s","s","l","s"]}>
        ${this.chromeTemplate()} ${this.iosTemplate()} ${this.androidTemplate()}
        ${this.homepageTemplate()}
      </wui-flex>
    `}chromeTemplate(){return this.wallet?.chrome_store?r.html`<wui-list-item
      variant="icon"
      icon="chromeStore"
      iconVariant="square"
      @click=${this.onChromeStore.bind(this)}
      chevron
    >
      <wui-text variant="paragraph-500" color="fg-100">Chrome Extension</wui-text>
    </wui-list-item>`:null}iosTemplate(){return this.wallet?.app_store?r.html`<wui-list-item
      variant="icon"
      icon="appStore"
      iconVariant="square"
      @click=${this.onAppStore.bind(this)}
      chevron
    >
      <wui-text variant="paragraph-500" color="fg-100">iOS App</wui-text>
    </wui-list-item>`:null}androidTemplate(){return this.wallet?.play_store?r.html`<wui-list-item
      variant="icon"
      icon="playStore"
      iconVariant="square"
      @click=${this.onPlayStore.bind(this)}
      chevron
    >
      <wui-text variant="paragraph-500" color="fg-100">Android App</wui-text>
    </wui-list-item>`:null}homepageTemplate(){return this.wallet?.homepage?r.html`
      <wui-list-item
        variant="icon"
        icon="browser"
        iconVariant="square-blue"
        @click=${this.onHomePage.bind(this)}
        chevron
      >
        <wui-text variant="paragraph-500" color="fg-100">Website</wui-text>
      </wui-list-item>
    `:null}onChromeStore(){this.wallet?.chrome_store&&n.CoreHelperUtil.openHref(this.wallet.chrome_store,"_blank")}onAppStore(){this.wallet?.app_store&&n.CoreHelperUtil.openHref(this.wallet.app_store,"_blank")}onPlayStore(){this.wallet?.play_store&&n.CoreHelperUtil.openHref(this.wallet.play_store,"_blank")}onHomePage(){this.wallet?.homepage&&n.CoreHelperUtil.openHref(this.wallet.homepage,"_blank")}};rw=function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a}([(0,s.customElement)("w3m-downloads-view")],rw),t.s(["W3mDownloadsView",0,rw],24467),t.s([],32194),t.i(32194),t.i(99277),t.i(58128),t.i(24467),t.s(["W3mAllWalletsView",0,rc,"W3mConnectingWcBasicView",0,eC,"W3mDownloadsView",0,rw],90167)},41410,(t,e,r)=>{e.exports=function(){return"function"==typeof Promise&&Promise.prototype&&Promise.prototype.then}},84086,(t,e,r)=>{let i,o=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];r.getSymbolSize=function(t){if(!t)throw Error('"version" cannot be null or undefined');if(t<1||t>40)throw Error('"version" should be in range from 1 to 40');return 4*t+17},r.getSymbolTotalCodewords=function(t){return o[t]},r.getBCHDigit=function(t){let e=0;for(;0!==t;)e++,t>>>=1;return e},r.setToSJISFunction=function(t){if("function"!=typeof t)throw Error('"toSJISFunc" is not a valid function.');i=t},r.isKanjiModeEnabled=function(){return void 0!==i},r.toSJIS=function(t){return i(t)}},69993,(t,e,r)=>{r.L={bit:1},r.M={bit:0},r.Q={bit:3},r.H={bit:2},r.isValid=function(t){return t&&void 0!==t.bit&&t.bit>=0&&t.bit<4},r.from=function(t,e){if(r.isValid(t))return t;try{if("string"!=typeof t)throw Error("Param is not a string");switch(t.toLowerCase()){case"l":case"low":return r.L;case"m":case"medium":return r.M;case"q":case"quartile":return r.Q;case"h":case"high":return r.H;default:throw Error("Unknown EC Level: "+t)}}catch(t){return e}}},54818,(t,e,r)=>{function i(){this.buffer=[],this.length=0}i.prototype={get:function(t){let e=Math.floor(t/8);return(this.buffer[e]>>>7-t%8&1)==1},put:function(t,e){for(let r=0;r<e;r++)this.putBit((t>>>e-r-1&1)==1)},getLengthInBits:function(){return this.length},putBit:function(t){let e=Math.floor(this.length/8);this.buffer.length<=e&&this.buffer.push(0),t&&(this.buffer[e]|=128>>>this.length%8),this.length++}},e.exports=i},5920,(t,e,r)=>{function i(t){if(!t||t<1)throw Error("BitMatrix size must be defined and greater than 0");this.size=t,this.data=new Uint8Array(t*t),this.reservedBit=new Uint8Array(t*t)}i.prototype.set=function(t,e,r,i){let o=t*this.size+e;this.data[o]=r,i&&(this.reservedBit[o]=!0)},i.prototype.get=function(t,e){return this.data[t*this.size+e]},i.prototype.xor=function(t,e,r){this.data[t*this.size+e]^=r},i.prototype.isReserved=function(t,e){return this.reservedBit[t*this.size+e]},e.exports=i},16830,(t,e,r)=>{let i=t.r(84086).getSymbolSize;r.getRowColCoords=function(t){if(1===t)return[];let e=Math.floor(t/7)+2,r=i(t),o=145===r?26:2*Math.ceil((r-13)/(2*e-2)),n=[r-7];for(let t=1;t<e-1;t++)n[t]=n[t-1]-o;return n.push(6),n.reverse()},r.getPositions=function(t){let e=[],i=r.getRowColCoords(t),o=i.length;for(let t=0;t<o;t++)for(let r=0;r<o;r++)(0!==t||0!==r)&&(0!==t||r!==o-1)&&(t!==o-1||0!==r)&&e.push([i[t],i[r]]);return e}},69436,(t,e,r)=>{let i=t.r(84086).getSymbolSize;r.getPositions=function(t){let e=i(t);return[[0,0],[e-7,0],[0,e-7]]}},48130,(t,e,r)=>{r.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};r.isValid=function(t){return null!=t&&""!==t&&!isNaN(t)&&t>=0&&t<=7},r.from=function(t){return r.isValid(t)?parseInt(t,10):void 0},r.getPenaltyN1=function(t){let e=t.size,r=0,i=0,o=0,n=null,a=null;for(let l=0;l<e;l++){i=o=0,n=a=null;for(let s=0;s<e;s++){let e=t.get(l,s);e===n?i++:(i>=5&&(r+=3+(i-5)),n=e,i=1),(e=t.get(s,l))===a?o++:(o>=5&&(r+=3+(o-5)),a=e,o=1)}i>=5&&(r+=3+(i-5)),o>=5&&(r+=3+(o-5))}return r},r.getPenaltyN2=function(t){let e=t.size,r=0;for(let i=0;i<e-1;i++)for(let o=0;o<e-1;o++){let e=t.get(i,o)+t.get(i,o+1)+t.get(i+1,o)+t.get(i+1,o+1);(4===e||0===e)&&r++}return 3*r},r.getPenaltyN3=function(t){let e=t.size,r=0,i=0,o=0;for(let n=0;n<e;n++){i=o=0;for(let a=0;a<e;a++)i=i<<1&2047|t.get(n,a),a>=10&&(1488===i||93===i)&&r++,o=o<<1&2047|t.get(a,n),a>=10&&(1488===o||93===o)&&r++}return 40*r},r.getPenaltyN4=function(t){let e=0,r=t.data.length;for(let i=0;i<r;i++)e+=t.data[i];return 10*Math.abs(Math.ceil(100*e/r/5)-10)},r.applyMask=function(t,e){let i=e.size;for(let o=0;o<i;o++)for(let n=0;n<i;n++)e.isReserved(n,o)||e.xor(n,o,function(t,e,i){switch(t){case r.Patterns.PATTERN000:return(e+i)%2==0;case r.Patterns.PATTERN001:return e%2==0;case r.Patterns.PATTERN010:return i%3==0;case r.Patterns.PATTERN011:return(e+i)%3==0;case r.Patterns.PATTERN100:return(Math.floor(e/2)+Math.floor(i/3))%2==0;case r.Patterns.PATTERN101:return e*i%2+e*i%3==0;case r.Patterns.PATTERN110:return(e*i%2+e*i%3)%2==0;case r.Patterns.PATTERN111:return(e*i%3+(e+i)%2)%2==0;default:throw Error("bad maskPattern:"+t)}}(t,n,o))},r.getBestMask=function(t,e){let i=Object.keys(r.Patterns).length,o=0,n=1/0;for(let a=0;a<i;a++){e(a),r.applyMask(a,t);let i=r.getPenaltyN1(t)+r.getPenaltyN2(t)+r.getPenaltyN3(t)+r.getPenaltyN4(t);r.applyMask(a,t),i<n&&(n=i,o=a)}return o}},81774,(t,e,r)=>{let i=t.r(69993),o=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],n=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];r.getBlocksCount=function(t,e){switch(e){case i.L:return o[(t-1)*4+0];case i.M:return o[(t-1)*4+1];case i.Q:return o[(t-1)*4+2];case i.H:return o[(t-1)*4+3];default:return}},r.getTotalCodewordsCount=function(t,e){switch(e){case i.L:return n[(t-1)*4+0];case i.M:return n[(t-1)*4+1];case i.Q:return n[(t-1)*4+2];case i.H:return n[(t-1)*4+3];default:return}}},92790,(t,e,r)=>{let i=new Uint8Array(512),o=new Uint8Array(256),n=1;for(let t=0;t<255;t++)i[t]=n,o[n]=t,256&(n<<=1)&&(n^=285);for(let t=255;t<512;t++)i[t]=i[t-255];r.log=function(t){if(t<1)throw Error("log("+t+")");return o[t]},r.exp=function(t){return i[t]},r.mul=function(t,e){return 0===t||0===e?0:i[o[t]+o[e]]}},27476,(t,e,r)=>{let i=t.r(92790);r.mul=function(t,e){let r=new Uint8Array(t.length+e.length-1);for(let o=0;o<t.length;o++)for(let n=0;n<e.length;n++)r[o+n]^=i.mul(t[o],e[n]);return r},r.mod=function(t,e){let r=new Uint8Array(t);for(;r.length-e.length>=0;){let t=r[0];for(let o=0;o<e.length;o++)r[o]^=i.mul(e[o],t);let o=0;for(;o<r.length&&0===r[o];)o++;r=r.slice(o)}return r},r.generateECPolynomial=function(t){let e=new Uint8Array([1]);for(let o=0;o<t;o++)e=r.mul(e,new Uint8Array([1,i.exp(o)]));return e}},62351,(t,e,r)=>{let i=t.r(27476);function o(t){this.genPoly=void 0,this.degree=t,this.degree&&this.initialize(this.degree)}o.prototype.initialize=function(t){this.degree=t,this.genPoly=i.generateECPolynomial(this.degree)},o.prototype.encode=function(t){if(!this.genPoly)throw Error("Encoder not initialized");let e=new Uint8Array(t.length+this.degree);e.set(t);let r=i.mod(e,this.genPoly),o=this.degree-r.length;if(o>0){let t=new Uint8Array(this.degree);return t.set(r,o),t}return r},e.exports=o},76198,(t,e,r)=>{r.isValid=function(t){return!isNaN(t)&&t>=1&&t<=40}},20596,(t,e,r)=>{let i="[0-9]+",o="(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+",n="(?:(?![A-Z0-9 $%*+\\-./:]|"+(o=o.replace(/u/g,"\\u"))+")(?:.|[\r\n]))+";r.KANJI=RegExp(o,"g"),r.BYTE_KANJI=RegExp("[^A-Z0-9 $%*+\\-./:]+","g"),r.BYTE=RegExp(n,"g"),r.NUMERIC=RegExp(i,"g"),r.ALPHANUMERIC=RegExp("[A-Z $%*+\\-./:]+","g");let a=RegExp("^"+o+"$"),l=RegExp("^"+i+"$"),s=RegExp("^[A-Z0-9 $%*+\\-./:]+$");r.testKanji=function(t){return a.test(t)},r.testNumeric=function(t){return l.test(t)},r.testAlphanumeric=function(t){return s.test(t)}},98670,(t,e,r)=>{let i=t.r(76198),o=t.r(20596);r.NUMERIC={id:"Numeric",bit:1,ccBits:[10,12,14]},r.ALPHANUMERIC={id:"Alphanumeric",bit:2,ccBits:[9,11,13]},r.BYTE={id:"Byte",bit:4,ccBits:[8,16,16]},r.KANJI={id:"Kanji",bit:8,ccBits:[8,10,12]},r.MIXED={bit:-1},r.getCharCountIndicator=function(t,e){if(!t.ccBits)throw Error("Invalid mode: "+t);if(!i.isValid(e))throw Error("Invalid version: "+e);return e>=1&&e<10?t.ccBits[0]:e<27?t.ccBits[1]:t.ccBits[2]},r.getBestModeForData=function(t){return o.testNumeric(t)?r.NUMERIC:o.testAlphanumeric(t)?r.ALPHANUMERIC:o.testKanji(t)?r.KANJI:r.BYTE},r.toString=function(t){if(t&&t.id)return t.id;throw Error("Invalid mode")},r.isValid=function(t){return t&&t.bit&&t.ccBits},r.from=function(t,e){if(r.isValid(t))return t;try{if("string"!=typeof t)throw Error("Param is not a string");switch(t.toLowerCase()){case"numeric":return r.NUMERIC;case"alphanumeric":return r.ALPHANUMERIC;case"kanji":return r.KANJI;case"byte":return r.BYTE;default:throw Error("Unknown mode: "+t)}}catch(t){return e}}},608,(t,e,r)=>{let i=t.r(84086),o=t.r(81774),n=t.r(69993),a=t.r(98670),l=t.r(76198),s=i.getBCHDigit(7973);function c(t,e){return a.getCharCountIndicator(t,e)+4}r.from=function(t,e){return l.isValid(t)?parseInt(t,10):e},r.getCapacity=function(t,e,r){if(!l.isValid(t))throw Error("Invalid QR Code version");void 0===r&&(r=a.BYTE);let n=(i.getSymbolTotalCodewords(t)-o.getTotalCodewordsCount(t,e))*8;if(r===a.MIXED)return n;let s=n-c(r,t);switch(r){case a.NUMERIC:return Math.floor(s/10*3);case a.ALPHANUMERIC:return Math.floor(s/11*2);case a.KANJI:return Math.floor(s/13);case a.BYTE:default:return Math.floor(s/8)}},r.getBestVersionForData=function(t,e){let i,o=n.from(e,n.M);if(Array.isArray(t)){if(t.length>1){for(let e=1;e<=40;e++)if(function(t,e){let r=0;return t.forEach(function(t){let i=c(t.mode,e);r+=i+t.getBitsLength()}),r}(t,e)<=r.getCapacity(e,o,a.MIXED))return e;return}if(0===t.length)return 1;i=t[0]}else i=t;return function(t,e,i){for(let o=1;o<=40;o++)if(e<=r.getCapacity(o,i,t))return o}(i.mode,i.getLength(),o)},r.getEncodedBits=function(t){if(!l.isValid(t)||t<7)throw Error("Invalid QR Code version");let e=t<<12;for(;i.getBCHDigit(e)-s>=0;)e^=7973<<i.getBCHDigit(e)-s;return t<<12|e}},93368,(t,e,r)=>{let i=t.r(84086),o=i.getBCHDigit(1335);r.getEncodedBits=function(t,e){let r=t.bit<<3|e,n=r<<10;for(;i.getBCHDigit(n)-o>=0;)n^=1335<<i.getBCHDigit(n)-o;return(r<<10|n)^21522}},98080,(t,e,r)=>{let i=t.r(98670);function o(t){this.mode=i.NUMERIC,this.data=t.toString()}o.getBitsLength=function(t){return 10*Math.floor(t/3)+(t%3?t%3*3+1:0)},o.prototype.getLength=function(){return this.data.length},o.prototype.getBitsLength=function(){return o.getBitsLength(this.data.length)},o.prototype.write=function(t){let e,r;for(e=0;e+3<=this.data.length;e+=3)r=parseInt(this.data.substr(e,3),10),t.put(r,10);let i=this.data.length-e;i>0&&(r=parseInt(this.data.substr(e),10),t.put(r,3*i+1))},e.exports=o},49768,(t,e,r)=>{let i=t.r(98670),o=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];function n(t){this.mode=i.ALPHANUMERIC,this.data=t}n.getBitsLength=function(t){return 11*Math.floor(t/2)+t%2*6},n.prototype.getLength=function(){return this.data.length},n.prototype.getBitsLength=function(){return n.getBitsLength(this.data.length)},n.prototype.write=function(t){let e;for(e=0;e+2<=this.data.length;e+=2){let r=45*o.indexOf(this.data[e]);r+=o.indexOf(this.data[e+1]),t.put(r,11)}this.data.length%2&&t.put(o.indexOf(this.data[e]),6)},e.exports=n},2729,(t,e,r)=>{"use strict";e.exports=function(t){for(var e=[],r=t.length,i=0;i<r;i++){var o=t.charCodeAt(i);if(o>=55296&&o<=56319&&r>i+1){var n=t.charCodeAt(i+1);n>=56320&&n<=57343&&(o=(o-55296)*1024+n-56320+65536,i+=1)}if(o<128){e.push(o);continue}if(o<2048){e.push(o>>6|192),e.push(63&o|128);continue}if(o<55296||o>=57344&&o<65536){e.push(o>>12|224),e.push(o>>6&63|128),e.push(63&o|128);continue}if(o>=65536&&o<=1114111){e.push(o>>18|240),e.push(o>>12&63|128),e.push(o>>6&63|128),e.push(63&o|128);continue}e.push(239,191,189)}return new Uint8Array(e).buffer}},83144,(t,e,r)=>{let i=t.r(2729),o=t.r(98670);function n(t){this.mode=o.BYTE,"string"==typeof t&&(t=i(t)),this.data=new Uint8Array(t)}n.getBitsLength=function(t){return 8*t},n.prototype.getLength=function(){return this.data.length},n.prototype.getBitsLength=function(){return n.getBitsLength(this.data.length)},n.prototype.write=function(t){for(let e=0,r=this.data.length;e<r;e++)t.put(this.data[e],8)},e.exports=n},70241,(t,e,r)=>{let i=t.r(98670),o=t.r(84086);function n(t){this.mode=i.KANJI,this.data=t}n.getBitsLength=function(t){return 13*t},n.prototype.getLength=function(){return this.data.length},n.prototype.getBitsLength=function(){return n.getBitsLength(this.data.length)},n.prototype.write=function(t){let e;for(e=0;e<this.data.length;e++){let r=o.toSJIS(this.data[e]);if(r>=33088&&r<=40956)r-=33088;else if(r>=57408&&r<=60351)r-=49472;else throw Error("Invalid SJIS character: "+this.data[e]+"\nMake sure your charset is UTF-8");r=(r>>>8&255)*192+(255&r),t.put(r,13)}},e.exports=n},45759,(t,e,r)=>{"use strict";var i={single_source_shortest_paths:function(t,e,r){var o,n,a,l,s,c,u,d={},p={};p[e]=0;var h=i.PriorityQueue.make();for(h.push(e,0);!h.empty();)for(a in n=(o=h.pop()).value,l=o.cost,s=t[n]||{})s.hasOwnProperty(a)&&(c=l+s[a],u=p[a],(void 0===p[a]||u>c)&&(p[a]=c,h.push(a,c),d[a]=n));if(void 0!==r&&void 0===p[r])throw Error(["Could not find a path from ",e," to ",r,"."].join(""));return d},extract_shortest_path_from_predecessor_list:function(t,e){for(var r=[],i=e;i;)r.push(i),t[i],i=t[i];return r.reverse(),r},find_path:function(t,e,r){var o=i.single_source_shortest_paths(t,e,r);return i.extract_shortest_path_from_predecessor_list(o,r)},PriorityQueue:{make:function(t){var e,r=i.PriorityQueue,o={};for(e in t=t||{},r)r.hasOwnProperty(e)&&(o[e]=r[e]);return o.queue=[],o.sorter=t.sorter||r.default_sorter,o},default_sorter:function(t,e){return t.cost-e.cost},push:function(t,e){this.queue.push({value:t,cost:e}),this.queue.sort(this.sorter)},pop:function(){return this.queue.shift()},empty:function(){return 0===this.queue.length}}};e.exports=i},93490,(t,e,r)=>{let i=t.r(98670),o=t.r(98080),n=t.r(49768),a=t.r(83144),l=t.r(70241),s=t.r(20596),c=t.r(84086),u=t.r(45759);function d(t){return unescape(encodeURIComponent(t)).length}function p(t,e,r){let i,o=[];for(;null!==(i=t.exec(r));)o.push({data:i[0],index:i.index,mode:e,length:i[0].length});return o}function h(t){let e,r,o=p(s.NUMERIC,i.NUMERIC,t),n=p(s.ALPHANUMERIC,i.ALPHANUMERIC,t);return c.isKanjiModeEnabled()?(e=p(s.BYTE,i.BYTE,t),r=p(s.KANJI,i.KANJI,t)):(e=p(s.BYTE_KANJI,i.BYTE,t),r=[]),o.concat(n,e,r).sort(function(t,e){return t.index-e.index}).map(function(t){return{data:t.data,mode:t.mode,length:t.length}})}function g(t,e){switch(e){case i.NUMERIC:return o.getBitsLength(t);case i.ALPHANUMERIC:return n.getBitsLength(t);case i.KANJI:return l.getBitsLength(t);case i.BYTE:return a.getBitsLength(t)}}function w(t,e){let r,s=i.getBestModeForData(t);if((r=i.from(e,s))!==i.BYTE&&r.bit<s.bit)throw Error('"'+t+'" cannot be encoded with mode '+i.toString(r)+".\n Suggested mode is: "+i.toString(s));switch(r===i.KANJI&&!c.isKanjiModeEnabled()&&(r=i.BYTE),r){case i.NUMERIC:return new o(t);case i.ALPHANUMERIC:return new n(t);case i.KANJI:return new l(t);case i.BYTE:return new a(t)}}r.fromArray=function(t){return t.reduce(function(t,e){return"string"==typeof e?t.push(w(e,null)):e.data&&t.push(w(e.data,e.mode)),t},[])},r.fromString=function(t,e){let o=function(t,e){let r={},o={start:{}},n=["start"];for(let a=0;a<t.length;a++){let l=t[a],s=[];for(let t=0;t<l.length;t++){let c=l[t],u=""+a+t;s.push(u),r[u]={node:c,lastCount:0},o[u]={};for(let t=0;t<n.length;t++){let a=n[t];r[a]&&r[a].node.mode===c.mode?(o[a][u]=g(r[a].lastCount+c.length,c.mode)-g(r[a].lastCount,c.mode),r[a].lastCount+=c.length):(r[a]&&(r[a].lastCount=c.length),o[a][u]=g(c.length,c.mode)+4+i.getCharCountIndicator(c.mode,e))}}n=s}for(let t=0;t<n.length;t++)o[n[t]].end=0;return{map:o,table:r}}(function(t){let e=[];for(let r=0;r<t.length;r++){let o=t[r];switch(o.mode){case i.NUMERIC:e.push([o,{data:o.data,mode:i.ALPHANUMERIC,length:o.length},{data:o.data,mode:i.BYTE,length:o.length}]);break;case i.ALPHANUMERIC:e.push([o,{data:o.data,mode:i.BYTE,length:o.length}]);break;case i.KANJI:e.push([o,{data:o.data,mode:i.BYTE,length:d(o.data)}]);break;case i.BYTE:e.push([{data:o.data,mode:i.BYTE,length:d(o.data)}])}}return e}(h(t,c.isKanjiModeEnabled())),e),n=u.find_path(o.map,"start","end"),a=[];for(let t=1;t<n.length-1;t++)a.push(o.table[n[t]].node);return r.fromArray(a.reduce(function(t,e){let r=t.length-1>=0?t[t.length-1]:null;return r&&r.mode===e.mode?t[t.length-1].data+=e.data:t.push(e),t},[]))},r.rawSplit=function(t){return r.fromArray(h(t,c.isKanjiModeEnabled()))}},54118,(t,e,r)=>{let i=t.r(84086),o=t.r(69993),n=t.r(54818),a=t.r(5920),l=t.r(16830),s=t.r(69436),c=t.r(48130),u=t.r(81774),d=t.r(62351),p=t.r(608),h=t.r(93368),g=t.r(98670),w=t.r(93490);function f(t,e,r){let i,o,n=t.size,a=h.getEncodedBits(e,r);for(i=0;i<15;i++)o=(a>>i&1)==1,i<6?t.set(i,8,o,!0):i<8?t.set(i+1,8,o,!0):t.set(n-15+i,8,o,!0),i<8?t.set(8,n-i-1,o,!0):i<9?t.set(8,15-i-1+1,o,!0):t.set(8,15-i-1,o,!0);t.set(n-8,8,1,!0)}r.create=function(t,e){let r,h;if(void 0===t||""===t)throw Error("No input text");let m=o.M;return void 0!==e&&(m=o.from(e.errorCorrectionLevel,o.M),r=p.from(e.version),h=c.from(e.maskPattern),e.toSJISFunc&&i.setToSJISFunction(e.toSJISFunc)),function(t,e,r,o){let h;if(Array.isArray(t))h=w.fromArray(t);else if("string"==typeof t){let i=e;if(!i){let e=w.rawSplit(t);i=p.getBestVersionForData(e,r)}h=w.fromString(t,i||40)}else throw Error("Invalid data");let m=p.getBestVersionForData(h,r);if(!m)throw Error("The amount of data is too big to be stored in a QR Code");if(e){if(e<m)throw Error("\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: "+m+".\n")}else e=m;let b=function(t,e,r){let o=new n;r.forEach(function(e){o.put(e.mode.bit,4),o.put(e.getLength(),g.getCharCountIndicator(e.mode,t)),e.write(o)});let a=(i.getSymbolTotalCodewords(t)-u.getTotalCodewordsCount(t,e))*8;for(o.getLengthInBits()+4<=a&&o.put(0,4);o.getLengthInBits()%8!=0;)o.putBit(0);let l=(a-o.getLengthInBits())/8;for(let t=0;t<l;t++)o.put(t%2?17:236,8);return function(t,e,r){let o,n,a=i.getSymbolTotalCodewords(e),l=a-u.getTotalCodewordsCount(e,r),s=u.getBlocksCount(e,r),c=a%s,p=s-c,h=Math.floor(a/s),g=Math.floor(l/s),w=g+1,f=h-g,m=new d(f),b=0,v=Array(s),y=Array(s),x=0,C=new Uint8Array(t.buffer);for(let t=0;t<s;t++){let e=t<p?g:w;v[t]=C.slice(b,b+e),y[t]=m.encode(v[t]),b+=e,x=Math.max(x,e)}let $=new Uint8Array(a),E=0;for(o=0;o<x;o++)for(n=0;n<s;n++)o<v[n].length&&($[E++]=v[n][o]);for(o=0;o<f;o++)for(n=0;n<s;n++)$[E++]=y[n][o];return $}(o,t,e)}(e,r,h),v=new a(i.getSymbolSize(e));!function(t,e){let r=t.size,i=s.getPositions(e);for(let e=0;e<i.length;e++){let o=i[e][0],n=i[e][1];for(let e=-1;e<=7;e++)if(!(o+e<=-1)&&!(r<=o+e))for(let i=-1;i<=7;i++)n+i<=-1||r<=n+i||(e>=0&&e<=6&&(0===i||6===i)||i>=0&&i<=6&&(0===e||6===e)||e>=2&&e<=4&&i>=2&&i<=4?t.set(o+e,n+i,!0,!0):t.set(o+e,n+i,!1,!0))}}(v,e);let y=v.size;for(let t=8;t<y-8;t++){let e=t%2==0;v.set(t,6,e,!0),v.set(6,t,e,!0)}return!function(t,e){let r=l.getPositions(e);for(let e=0;e<r.length;e++){let i=r[e][0],o=r[e][1];for(let e=-2;e<=2;e++)for(let r=-2;r<=2;r++)-2===e||2===e||-2===r||2===r||0===e&&0===r?t.set(i+e,o+r,!0,!0):t.set(i+e,o+r,!1,!0)}}(v,e),f(v,r,0),e>=7&&function(t,e){let r,i,o,n=t.size,a=p.getEncodedBits(e);for(let e=0;e<18;e++)r=Math.floor(e/3),i=e%3+n-8-3,o=(a>>e&1)==1,t.set(r,i,o,!0),t.set(i,r,o,!0)}(v,e),!function(t,e){let r=t.size,i=-1,o=r-1,n=7,a=0;for(let l=r-1;l>0;l-=2)for(6===l&&l--;;){for(let r=0;r<2;r++)if(!t.isReserved(o,l-r)){let i=!1;a<e.length&&(i=(e[a]>>>n&1)==1),t.set(o,l-r,i),-1==--n&&(a++,n=7)}if((o+=i)<0||r<=o){o-=i,i=-i;break}}}(v,b),isNaN(o)&&(o=c.getBestMask(v,f.bind(null,v,r))),c.applyMask(o,v),f(v,r,o),{modules:v,version:e,errorCorrectionLevel:r,maskPattern:o,segments:h}}(t,r,m,h)}},98352,(t,e,r)=>{function i(t){if("number"==typeof t&&(t=t.toString()),"string"!=typeof t)throw Error("Color should be defined as hex string");let e=t.slice().replace("#","").split("");if(e.length<3||5===e.length||e.length>8)throw Error("Invalid hex color: "+t);(3===e.length||4===e.length)&&(e=Array.prototype.concat.apply([],e.map(function(t){return[t,t]}))),6===e.length&&e.push("F","F");let r=parseInt(e.join(""),16);return{r:r>>24&255,g:r>>16&255,b:r>>8&255,a:255&r,hex:"#"+e.slice(0,6).join("")}}r.getOptions=function(t){t||(t={}),t.color||(t.color={});let e=void 0===t.margin||null===t.margin||t.margin<0?4:t.margin,r=t.width&&t.width>=21?t.width:void 0,o=t.scale||4;return{width:r,scale:r?4:o,margin:e,color:{dark:i(t.color.dark||"#000000ff"),light:i(t.color.light||"#ffffffff")},type:t.type,rendererOpts:t.rendererOpts||{}}},r.getScale=function(t,e){return e.width&&e.width>=t+2*e.margin?e.width/(t+2*e.margin):e.scale},r.getImageWidth=function(t,e){let i=r.getScale(t,e);return Math.floor((t+2*e.margin)*i)},r.qrToImageData=function(t,e,i){let o=e.modules.size,n=e.modules.data,a=r.getScale(o,i),l=Math.floor((o+2*i.margin)*a),s=i.margin*a,c=[i.color.light,i.color.dark];for(let e=0;e<l;e++)for(let r=0;r<l;r++){let u=(e*l+r)*4,d=i.color.light;e>=s&&r>=s&&e<l-s&&r<l-s&&(d=c[+!!n[Math.floor((e-s)/a)*o+Math.floor((r-s)/a)]]),t[u++]=d.r,t[u++]=d.g,t[u++]=d.b,t[u]=d.a}}},98325,(t,e,r)=>{let i=t.r(98352);r.render=function(t,e,r){var o;let n=r,a=e;void 0!==n||e&&e.getContext||(n=e,e=void 0),e||(a=function(){try{return document.createElement("canvas")}catch(t){throw Error("You need to specify a canvas element")}}()),n=i.getOptions(n);let l=i.getImageWidth(t.modules.size,n),s=a.getContext("2d"),c=s.createImageData(l,l);return i.qrToImageData(c.data,t,n),o=a,s.clearRect(0,0,o.width,o.height),o.style||(o.style={}),o.height=l,o.width=l,o.style.height=l+"px",o.style.width=l+"px",s.putImageData(c,0,0),a},r.renderToDataURL=function(t,e,i){let o=i;void 0!==o||e&&e.getContext||(o=e,e=void 0),o||(o={});let n=r.render(t,e,o),a=o.type||"image/png",l=o.rendererOpts||{};return n.toDataURL(a,l.quality)}},98639,(t,e,r)=>{let i=t.r(98352);function o(t,e){let r=t.a/255,i=e+'="'+t.hex+'"';return r<1?i+" "+e+'-opacity="'+r.toFixed(2).slice(1)+'"':i}function n(t,e,r){let i=t+e;return void 0!==r&&(i+=" "+r),i}r.render=function(t,e,r){let a=i.getOptions(e),l=t.modules.size,s=t.modules.data,c=l+2*a.margin,u=a.color.light.a?"<path "+o(a.color.light,"fill")+' d="M0 0h'+c+"v"+c+'H0z"/>':"",d="<path "+o(a.color.dark,"stroke")+' d="'+function(t,e,r){let i="",o=0,a=!1,l=0;for(let s=0;s<t.length;s++){let c=Math.floor(s%e),u=Math.floor(s/e);c||a||(a=!0),t[s]?(l++,s>0&&c>0&&t[s-1]||(i+=a?n("M",c+r,.5+u+r):n("m",o,0),o=0,a=!1),c+1<e&&t[s+1]||(i+=n("h",l),l=0)):o++}return i}(s,l,a.margin)+'"/>',p='<svg xmlns="http://www.w3.org/2000/svg" '+(a.width?'width="'+a.width+'" height="'+a.width+'" ':"")+('viewBox="0 0 '+c+" ")+c+'" shape-rendering="crispEdges">'+u+d+"</svg>\n";return"function"==typeof r&&r(null,p),p}},9626,(t,e,r)=>{let i=t.r(41410),o=t.r(54118),n=t.r(98325),a=t.r(98639);function l(t,e,r,n,a){let l=[].slice.call(arguments,1),s=l.length,c="function"==typeof l[s-1];if(!c&&!i())throw Error("Callback required as last argument");if(c){if(s<2)throw Error("Too few arguments provided");2===s?(a=r,r=e,e=n=void 0):3===s&&(e.getContext&&void 0===a?(a=n,n=void 0):(a=n,n=r,r=e,e=void 0))}else{if(s<1)throw Error("Too few arguments provided");return 1===s?(r=e,e=n=void 0):2!==s||e.getContext||(n=r,r=e,e=void 0),new Promise(function(i,a){try{let a=o.create(r,n);i(t(a,e,n))}catch(t){a(t)}})}try{let i=o.create(r,n);a(null,t(i,e,n))}catch(t){a(t)}}r.create=o.create,r.toCanvas=l.bind(null,n.render),r.toDataURL=l.bind(null,n.renderToDataURL),r.toString=l.bind(null,function(t,e,r){return a.render(t,r)})}]);