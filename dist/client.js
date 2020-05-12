"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
const axios_1 = require("axios");
class Client extends base_1.Base {
    constructor(appleId, password, axiosInstance = axios_1.default.create()) {
        super(axiosInstance);
        this.signinUrl = 'https://idmsa.apple.com/appleauth/auth/signin';
        this.authRequestUrl = 'https://idmsa.apple.com/appleauth/auth';
        this.wdigetKeyUrl = 'https://appstoreconnect.apple.com/olympus/v1/app/config?hostname=itunesconnect.apple.com';
        this.securityCodeUrl = 'https://idmsa.apple.com/appleauth/auth/verify/phone/securitycode';
        this.phonesUrl = 'https://idmsa.apple.com/appleauth/auth/verify/phone';
        // api end point
        this.apiEndPoint = 'https://appstoreconnect.apple.com';
        this.trustUrl = 'https://idmsa.apple.com/appleauth/auth/2sv/trust';
        this.headers = {};
        this.password = password;
        this.appleId = appleId;
    }
    widgetKey() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.authServiceWidgetKey) {
                return this.authServiceWidgetKey;
            }
            const response = yield this.get(this.wdigetKeyUrl);
            this.authServiceWidgetKey = response.data.authServiceKey;
            return this.authServiceWidgetKey;
        });
    }
    /**
     * signin with Apple ID and Password
     * !CAUTION: do not support two-step verification
     * @param appleId Apple ID(email format)
     * @param password Apple ID Password (no two-step verification)
     */
    signin() {
        return __awaiter(this, void 0, void 0, function* () {
            const widgetKey = yield this.widgetKey();
            return yield this.post(this.signinUrl, { accountName: this.appleId, password: this.password, rememberMe: false }, { 'X-Apple-Domain-Id': '1', 'X-Requested-With': 'XMLHttpRequest', 'X-Apple-Widget-Key': widgetKey })
                .then(res => {
                return Promise.resolve('ok');
            })
                .catch((e) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                this.updateRequestHeaders(e);
                if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.data.authType) === 'hsa2') {
                    const phones = yield this.authRequest();
                    return phones.trustedPhoneNumbers;
                }
                throw new Error('not surpport');
            }));
        });
    }
    authRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.get(this.authRequestUrl, this.headers);
            return response.data;
        });
    }
    sendSMS(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.put(this.phonesUrl, { "phoneNumber": { id }, "mode": "sms" }, this.headers);
            return response.data;
        });
    }
    /**
     * get session data
     */
    session() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.sessionData) {
                return this.sessionData;
            }
            const response = yield this.get(`${this.apiEndPoint}/olympus/v1/session`);
            this.sessionData = response.data;
            return this.sessionData;
        });
    }
    /**
     * get current provider
     */
    currentProvider() {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.session();
            return session.provider;
        });
    }
    getDetail() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.userDetail) {
                return this.userDetail;
            }
            const response = yield this.get(`${this.apiEndPoint}/WebObjects/iTunesConnect.woa/ra/user/detail`);
            if (response.data.data) {
                this.userDetail = response.data.data;
            }
            return this.userDetail;
        });
    }
    sessionToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const userDetail = yield this.getDetail();
            if (userDetail) {
                return userDetail.sessionToken;
            }
            return undefined;
        });
    }
    selectTeam(providerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const availableProviders = (yield this.session()).availableProviders;
            const currentProvider = yield this.currentProvider();
            if (providerId === currentProvider.providerId.toString()) {
                return;
            }
            const targetProvider = availableProviders.find(provider => provider.providerId.toString() === providerId);
            if (!targetProvider) {
                throw Error(`[Airship Error:] can not select team with providerId: ${providerId}`);
            }
            const token = yield this.sessionToken();
            if (!token) {
                throw Error(`[Airship Error:] missing required session token for switching provider`);
            }
            const data = Object.assign({}, token, { contentProviderId: providerId });
            yield this.post(`${this.apiEndPoint}/WebObjects/iTunesConnect.woa/ra/v1/session/webSession`, data);
            this.sessionData = undefined;
            yield this.session();
        });
    }
    /**
     * list apps in current provider
     */
    listApps() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.apps) {
                return this.apps;
            }
            const response = yield this.get(`${this.apiEndPoint}/WebObjects/iTunesConnect.woa/ra/apps/manageyourapps/summary/v2`);
            if (response.data.data) {
                this.apps = response.data.data.summaries;
            }
            return this.apps;
        });
    }
    updateRequestHeaders(resp) {
        this.headers["X-Apple-Id-Session-Id"] = resp.response.headers["x-apple-id-session-id"];
        this.headers["X-Apple-Widget-Key"] = this.authServiceWidgetKey;
        this.headers["scnt"] = resp.response.headers["scnt"];
    }
    securityCodeRequest(code) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.post(this.securityCodeUrl, {
                securityCode: { code: code }, phoneNumber: { id: 2 }, mode: "sms"
            }, this.headers).then(res => res.data);
        });
    }
    trust() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.get(this.trustUrl, this.headers).then(res => res.data);
        });
    }
}
exports.Client = Client;
function getinfo(name, age) {
    return '';
}
//# sourceMappingURL=client.js.map