"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var platform_browser_dynamic_1 = require("@angular/platform-browser-dynamic");
var app_module_1 = require("./app/app.module");
if (!isLocal()) {
    core_1.enableProdMode();
}
function isLocal() {
    return document.location.href.indexOf('127.0.0.1') > -1
        || document.location.hash.indexOf('localhost') > -1;
}
platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(app_module_1.AppModule)
    .then(function (val) {
    // console.log('app bootstrap');
})
    .catch(function (err) {
    console.error(err);
});
//# sourceMappingURL=main.js.map