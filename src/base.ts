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
    appleId: string
    instance: AxiosInstance

    constructor(appleId: string) {
        this.instance = axios.create(
            {
                headers: {
                    'Connection': 'keep-alive',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Apple-Domain-Id': '1',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin'
                },
                withCredentials: true
            }
        );
        this.instance.interceptors.request.use(config => {
            try {
                let cookies = fs.readFileSync(path.resolve(process.cwd(), `${appleId}_cookie.txt`)).toString()
                if (cookies) {
                    config.jar = CookieJar.fromJSON(JSON.parse(cookies))
                }
            } catch (error) {
                
            }
            if (config.jar) {
                if (!config.headers) { config.headers = {} };
                config.headers['cookie'] = config.jar.getCookieStringSync(config.url!);
            }
            return config;
        }, error => Promise.reject(error));
        
        this.instance.interceptors.response.use(response => {
            const config = response.config;
            const cookies = response.headers['set-cookie'] as [string];
            if (cookies) {
                cookies.forEach(cookie => {
                    config.jar!.setCookieSync(cookie, response.config.url!, { ignoreError: true });
                });
                // 序列化
                fs.writeFileSync(path.resolve(process.cwd(), `${appleId}_cookie.txt`), JSON.stringify(config.jar!.toJSON()))
            }
            return response;
        }, error => Promise.reject(error));
        this.appleId = appleId
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

