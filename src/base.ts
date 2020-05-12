import axios, { AxiosResponse, AxiosInstance, AxiosStatic } from 'axios';
import { CookieJar, Cookie } from 'tough-cookie';
import * as fs from 'fs';
import * as path from 'path';

declare module 'axios' {
    export interface AxiosRequestConfig {
        jar?: CookieJar;
    }
}



export class Base {

    cookieJar: CookieJar;
    instance: AxiosInstance

    constructor(instance: AxiosInstance) {
        this.instance = instance
        this.instance.interceptors.request.use(config => {
            if (config.jar) {
                if (!config.headers) { config.headers = {} };
                config.headers['cookie'] = config.jar.getCookieStringSync(config.url!);
            }
            return config;
        }, error => Promise.reject(error));
        
        // @ts-ignore：https://github.com/axios/axios/issues/1663 请求拦截器的顺序异常
        this.instance.interceptors.request.handlers.reverse();
        this.instance.interceptors.response.use(response => {
            const config = response.config;
            const cookies = response.headers['set-cookie'] as [string];
            if (cookies) {
                cookies.forEach(cookie => {
                    config.jar!.setCookieSync(cookie, response.config.url!, { ignoreError: true });
                });
            }
            return response;
        }, error => Promise.reject(error));
        // @ts-ignore
        this.instance.interceptors.response.handlers.reverse();
        this.cookieJar = new CookieJar();
    }

    // http methods

    get(url: string, headers?: any) {
        return this.instance.get(url, {
            jar: this.cookieJar,
            withCredentials: true,
            headers
        });
    }

    post(url: string, data?: any, headers?: any) {
        return this.instance.post(url, data, {
            jar: this.cookieJar,
            withCredentials: true,
            headers
        });
    }

    delete(url: string, headers?: any) {
        return this.instance.delete(url, {
            jar: this.cookieJar,
            withCredentials: true,
            headers
        });
    }

    patch(url: string, data?: any, headers?: any) {
        return this.instance.patch(url, data, {
            jar: this.cookieJar,
            withCredentials: true,
            headers
        });
    }
    put(url: string, data?: any, headers?: any) {
        return this.instance.put(url, data, {
            jar: this.cookieJar,
            withCredentials: true,
            headers
        });
    }
}

export interface CommonResponse<T> {
    data?: T;
    messages?: { error: string, info: string, warn: string };
    statusCode?: string;
    meta?: {
        paging: {
            total: number;
            limit: number;
        }
    };
    links?: any;
    included?: any;
}

export interface IrisCommonDataFormat<T> {
    type: string;
    id: string;
    attributes: T;
    relationships?: any;
    links?: any;
}

