"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tough_cookie_1 = require("tough-cookie");
class Base {
    constructor(instance) {
        this.instance = instance;
        this.instance.interceptors.request.use(config => {
            if (config.jar) {
                if (!config.headers) {
                    config.headers = {};
                }
                ;
                config.headers['cookie'] = config.jar.getCookieStringSync(config.url);
            }
            return config;
        }, error => Promise.reject(error));
        // @ts-ignore：https://github.com/axios/axios/issues/1663 请求拦截器的顺序异常
        this.instance.interceptors.request.handlers.reverse(); //保证自定义的拦截器在前面触发 Ensure that the custom interceptor fires ahead
        this.instance.interceptors.response.use(response => {
            const config = response.config;
            const cookies = response.headers['set-cookie'];
            if (cookies) {
                cookies.forEach(cookie => {
                    config.jar.setCookieSync(cookie, response.config.url, { ignoreError: true });
                });
            }
            return response;
        }, error => Promise.reject(error));
        // @ts-ignore
        this.instance.interceptors.response.handlers.reverse(); // 保证自定义的拦截器在后面触发 Ensure that the custom interceptor fires later
        this.cookieJar = new tough_cookie_1.CookieJar();
    }
    // http methods
    get(url, headers) {
        return this.instance.get(url, {
            jar: this.cookieJar,
            withCredentials: true,
            headers
        });
    }
    post(url, data, headers) {
        return this.instance.post(url, data, {
            jar: this.cookieJar,
            withCredentials: true,
            headers
        });
    }
    delete(url, headers) {
        return this.instance.delete(url, {
            jar: this.cookieJar,
            withCredentials: true,
            headers
        });
    }
    patch(url, data, headers) {
        return this.instance.patch(url, data, {
            jar: this.cookieJar,
            withCredentials: true,
            headers
        });
    }
}
exports.Base = Base;
//# sourceMappingURL=base.js.map