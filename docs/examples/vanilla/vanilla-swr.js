!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("SWR",[],e):"object"==typeof exports?exports.SWR=e():t.SWR=e()}(self,(function(){return(()=>{"use strict";var t={949:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.noop=e.deepEqual=e.isFunction=e.isObservable=void 0,e.isObservable=function(t){return void 0!==(null==t?void 0:t.watch)},e.isFunction=function(t){return"function"==typeof t},e.deepEqual=function(t,i){var n,o=Object.prototype.hasOwnProperty;if(t===i)return!0;if(t&&i&&(n=t.constructor)===i.constructor){if(t instanceof Date&&i instanceof Date)return t.getTime()===i.getTime();if(t instanceof RegExp&&i instanceof RegExp)return t.toString()===i.toString();if(t instanceof Array&&i instanceof Array){var r=void 0;if((r=t.length)===i.length)for(;r--&&(0,e.deepEqual)(t[r],i[r]););return-1===r}if(!n||"object"==typeof t){for(n in r=0,t){if(o.call(t,n)&&++r&&!o.call(i,n))return!1;if(!(n in i)||!(0,e.deepEqual)(t[n],i[n]))return!1}return Object.keys(i).length===r}}return t!=t&&i!=i},e.noop=function(){}},607:function(t,e,i){var n=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0});var o=n(i(566));e.default=o.default},529:function(t,e,i){var n=this&&this.__assign||function(){return(n=Object.assign||function(t){for(var e,i=1,n=arguments.length;i<n;i++)for(var o in e=arguments[i])Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o]);return t}).apply(this,arguments)};Object.defineProperty(e,"__esModule",{value:!0}),e.Observable=void 0;var o=i(949),r={compare:o.deepEqual,dedupingInterval:2e3,fallbackData:void 0,onSuccess:o.noop,onError:o.noop,shouldRetryOnError:!0,errorRetryInterval:5e3,errorRetryCount:5,refreshInterval:0,revalidateOnWatch:!0,revalidateOnFocus:!0,revalidateOnReconnect:!0,refreshWhenHidden:!1,refreshWhenOffline:!1},s="visibilitychange",a="focus",c="online",l="offline",h=function(){function t(t,e,i){this._options=r,this._data=void 0,this._error=void 0,this._isValidating=!1,this._lastFetchTs=0,this._errorRetryCounter=0,this._online=!0,this._listeners={},this._watchers=[],this._key=t,this._fetcher=e,this._keyIsFunction=(0,o.isFunction)(t),this._online="boolean"!=typeof(null===navigator||void 0===navigator?void 0:navigator.onLine)||navigator.onLine,this._setOptions(i)}return Object.defineProperty(t.prototype,"response",{get:function(){return{data:this._data,error:this._error,isValidating:this._isValidating}},enumerable:!1,configurable:!0}),t.prototype._setOptions=function(t){this._options=n(n({},r),t),void 0===this._data&&(this._data=this._options.fallbackData),this._options.revalidateOnFocus?this._initFocus():this._clearFocus(),this._options.revalidateOnReconnect?this._initReconnect():this._clearReconnect()},t.prototype.setFetcher=function(t,e){void 0===e&&(e=!1),this._fetcher&&!e||(this._fetcher=t)},t.prototype.watch=function(t){var e=new u(t);this._watchers.push(e),(this._options.revalidateOnWatch||void 0===this._data)&&this._callFetcher();try{t(this.response)}catch(t){}return e},t.prototype.mutate=function(t){void 0!==t&&this._setOptions(t),this._callFetcher()},t.prototype._callWatchers=function(){var t=[];for(var e in this._watchers){var i=this._watchers[e];if("function"==typeof i._callback)try{i._callback(this.response)}catch(t){}else t.push(parseInt(e))}for(var n=0,o=t;n<o.length;n++)e=o[n],this._watchers.splice(e,1)},t.prototype._callFetcher=function(){var t=this;if(this._fetcher){var e=Date.now();if(!(e-this._lastFetchTs<this._options.dedupingInterval)){this._lastFetchTs=e;var i=this._key;if(this._keyIsFunction)try{i=i()}catch(t){i=null}if("string"==typeof i&&(i=[i]),null!==i)try{this._isValidating=!0,Promise.resolve(this._fetcher.apply(this._fetcher,i)).then((function(e){var n=t._data;t._data=e,t._error=void 0,t._isValidating=!1;var o=t._options.onSuccess;o.apply(o,[e,i[0],t._options]),t._options.compare(n,e)||t._callWatchers(),t._lastFetchTs=0,t._errorRetryCounter=0,t._options.refreshInterval>0&&(t._timer=setTimeout((function(){t._callFetcher()}),t._options.refreshInterval))})).catch((function(e){return t._errorHandler(e,i[0])}))}catch(t){this._errorHandler(t,i[0])}}}},t.prototype._errorHandler=function(t,e){var i=this;this._data=this._options.fallbackData,this._error=t,this._isValidating=!1,this._lastFetchTs=0;var n=this._options.onError;if(n.apply(n,[this._error,e,this._options]),this._callWatchers(),this._options.shouldRetryOnError&&this._errorRetryCounter<this._options.errorRetryCount)if(this._options.onErrorRetry){var o={retryCount:this._errorRetryCounter++};this._options.onErrorRetry(this._error,e,this._options,this._callFetcher.bind(this),o)}else{var r=~~((Math.random()+.5)*(1<<Math.min(this._errorRetryCounter,8)))*this._options.errorRetryInterval;setTimeout((function(){i._errorRetryCounter++,i._callFetcher()}),r)}},t.prototype._isVisible=function(){return"hidden"!==(null===document||void 0===document?void 0:document.visibilityState)},t.prototype._visibilityListener=function(){this._isVisible()?this._callFetcher():this._timer&&!this._options.refreshWhenHidden&&clearTimeout(this._timer)},t.prototype._onlineListener=function(){this._online=!0,this._callFetcher()},t.prototype._offlineListener=function(){this._online=!1,this._timer&&!this._options.refreshWhenOffline&&clearTimeout(this._timer)},t.prototype._initFocus=function(){this._listeners.focus=this._visibilityListener.bind(this),"function"==typeof(null===document||void 0===document?void 0:document.addEventListener)&&document.addEventListener(s,this._listeners.focus),"function"==typeof(null===window||void 0===window?void 0:window.addEventListener)&&window.addEventListener(a,this._listeners.focus)},t.prototype._initReconnect=function(){this._listeners.online=this._onlineListener.bind(this),this._listeners.offline=this._offlineListener.bind(this),"function"==typeof(null===window||void 0===window?void 0:window.addEventListener)&&(window.addEventListener(c,this._listeners.online),window.addEventListener(l,this._listeners.offline))},t.prototype._clearFocus=function(){"function"==typeof(null===document||void 0===document?void 0:document.removeEventListener)&&document.removeEventListener(s,this._listeners.focus),"function"==typeof(null===window||void 0===window?void 0:window.removeEventListener)&&document.removeEventListener(a,this._listeners.focus),delete this._listeners.focus},t.prototype._clearReconnect=function(){"function"==typeof(null===window||void 0===window?void 0:window.removeEventListener)&&(window.removeEventListener(c,this._listeners.online),window.removeEventListener(l,this._listeners.offline))},t}();e.Observable=h;var u=function(){function t(t){this._callback=t}return t.prototype.unwatch=function(){this._callback=null},t}()},566:(t,e,i)=>{Object.defineProperty(e,"__esModule",{value:!0});var n=i(949),o=i(529),r=new Map;e.default=function(t,e,i){var s=function(t){return"string"==typeof t?t:"function"==typeof(null==t?void 0:t.toString)?t.toString():""}(t),a=r.get(s);return(0,n.isObservable)(a)?e&&a.setFetcher(e):(a=new o.Observable(t,e,i),r.set(s,a)),a}}},e={},i=function i(n){var o=e[n];if(void 0!==o)return o.exports;var r=e[n]={exports:{}};return t[n].call(r.exports,r,r.exports,i),r.exports}(607);return i.default})()}));