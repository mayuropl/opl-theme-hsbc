"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptDecryptComponent = void 0;
var core_1 = require("@angular/core");
var aes_gcm_encryption_service_1 = require("src/app/service/encryption/aes-gcm-encryption.service");
var EncryptDecryptComponent = function () {
    var _classDecorators = [(0, core_1.Component)({
            selector: 'app-encrypt-decrypt',
            templateUrl: './encrypt-decrypt.component.html',
            styleUrls: ['./encrypt-decrypt.component.scss']
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var EncryptDecryptComponent = _classThis = /** @class */ (function () {
        function EncryptDecryptComponent_1(commonMethod) {
            this.commonMethod = commonMethod;
            this.tab = 1;
        }
        EncryptDecryptComponent_1.prototype.ngOnInit = function () {
            this.breadCrumbItems = [{ label: 'Dashboard', path: '/' }, { label: 'Reports', path: '/', active: true }];
        };
        // tab
        EncryptDecryptComponent_1.prototype.activeClick = function (tabId) {
            this.tab = tabId;
        };
        EncryptDecryptComponent_1.prototype.convertData = function (request) {
            // this.requestData = CommonService.decryptText(request);
            this.requestData = aes_gcm_encryption_service_1.AesGcmEncryptionService.getDecPayload(request);
            try {
                this.requestData = JSON.parse(this.requestData.toString());
            }
            catch (ex) {
                this.requestData = this.requestData;
            }
        };
        EncryptDecryptComponent_1.prototype.convertUrlData = function (request) {
            // this.urlRequestData = CommonService.decryptFuntion(request);
            this.urlRequestData = aes_gcm_encryption_service_1.AesGcmEncryptionService.getDecPayload(request);
            try {
                this.urlRequestData = this.urlRequestData.toString();
            }
            catch (ex) {
                this.urlRequestData = this.urlRequestData;
            }
        };
        EncryptDecryptComponent_1.prototype.decryptUrlData = function (request) {
            // this.urlResponseData = CommonService.encryptFuntion(request);
            this.urlResponseData = aes_gcm_encryption_service_1.AesGcmEncryptionService.getEncPayload(request);
            try {
                this.urlResponseData = this.urlResponseData.toString();
            }
            catch (ex) {
                this.urlResponseData = this.urlResponseData;
            }
        };
        EncryptDecryptComponent_1.prototype.convertDecData = function (response) {
            // this.responseData = CommonService.encryptText(response);
            this.responseData = aes_gcm_encryption_service_1.AesGcmEncryptionService.getEncPayload(response);
        };
        EncryptDecryptComponent_1.prototype.copyToClipBoard = function (data, isJson) {
            this.commonMethod.copyToClipBoard(data, isJson);
        };
        return EncryptDecryptComponent_1;
    }());
    __setFunctionName(_classThis, "EncryptDecryptComponent");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EncryptDecryptComponent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EncryptDecryptComponent = _classThis;
}();
exports.EncryptDecryptComponent = EncryptDecryptComponent;
