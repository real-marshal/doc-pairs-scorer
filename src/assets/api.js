class BaseHttpRequest {
    constructor(config) {
        this.config = config;
    }
}

class ApiError extends Error {
    constructor(request, response, message) {
        super(message);
        this.name = 'ApiError';
        this.url = response.url;
        this.status = response.status;
        this.statusText = response.statusText;
        this.body = response.body;
        this.request = request;
    }
}

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
class CancelError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CancelError';
    }
    get isCancelled() {
        return true;
    }
}
class CancelablePromise {
    constructor(executor) {
        this._isResolved = false;
        this._isRejected = false;
        this._isCancelled = false;
        this._cancelHandlers = [];
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
            const onResolve = (value) => {
                if (this._isResolved || this._isRejected || this._isCancelled) {
                    return;
                }
                this._isResolved = true;
                this._resolve?.(value);
            };
            const onReject = (reason) => {
                if (this._isResolved || this._isRejected || this._isCancelled) {
                    return;
                }
                this._isRejected = true;
                this._reject?.(reason);
            };
            const onCancel = (cancelHandler) => {
                if (this._isResolved || this._isRejected || this._isCancelled) {
                    return;
                }
                this._cancelHandlers.push(cancelHandler);
            };
            Object.defineProperty(onCancel, 'isResolved', {
                get: () => this._isResolved,
            });
            Object.defineProperty(onCancel, 'isRejected', {
                get: () => this._isRejected,
            });
            Object.defineProperty(onCancel, 'isCancelled', {
                get: () => this._isCancelled,
            });
            return executor(onResolve, onReject, onCancel);
        });
    }
    then(onFulfilled, onRejected) {
        return this._promise.then(onFulfilled, onRejected);
    }
    catch(onRejected) {
        return this._promise.catch(onRejected);
    }
    finally(onFinally) {
        return this._promise.finally(onFinally);
    }
    cancel() {
        if (this._isResolved || this._isRejected || this._isCancelled) {
            return;
        }
        this._isCancelled = true;
        if (this._cancelHandlers.length) {
            try {
                for (const cancelHandler of this._cancelHandlers) {
                    cancelHandler();
                }
            }
            catch (error) {
                console.warn('Cancellation threw an error', error);
                return;
            }
        }
        this._cancelHandlers.length = 0;
        this._reject?.(new CancelError('Request aborted'));
    }
    get isCancelled() {
        return this._isCancelled;
    }
}

/* istanbul ignore file */
const isDefined = (value) => {
    return value !== undefined && value !== null;
};
const isString = (value) => {
    return typeof value === 'string';
};
const isStringWithValue = (value) => {
    return isString(value) && value !== '';
};
const isBlob = (value) => {
    return (typeof value === 'object' &&
        typeof value.type === 'string' &&
        typeof value.stream === 'function' &&
        typeof value.arrayBuffer === 'function' &&
        typeof value.constructor === 'function' &&
        typeof value.constructor.name === 'string' &&
        /^(Blob|File)$/.test(value.constructor.name) &&
        /^(Blob|File)$/.test(value[Symbol.toStringTag]));
};
const isFormData = (value) => {
    return value instanceof FormData;
};
const base64 = (str) => {
    try {
        return btoa(str);
    }
    catch (err) {
        // @ts-ignore
        return Buffer.from(str).toString('base64');
    }
};
const getQueryString = (params) => {
    const qs = [];
    const append = (key, value) => {
        qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    };
    const process = (key, value) => {
        if (isDefined(value)) {
            if (Array.isArray(value)) {
                value.forEach(v => {
                    process(key, v);
                });
            }
            else if (typeof value === 'object') {
                Object.entries(value).forEach(([k, v]) => {
                    process(`${key}[${k}]`, v);
                });
            }
            else {
                append(key, value);
            }
        }
    };
    Object.entries(params).forEach(([key, value]) => {
        process(key, value);
    });
    if (qs.length > 0) {
        return `?${qs.join('&')}`;
    }
    return '';
};
const getUrl = (config, options) => {
    const encoder = config.ENCODE_PATH || encodeURI;
    const path = options.url
        .replace('{api-version}', config.VERSION)
        .replace(/{(.*?)}/g, (substring, group) => {
        if (options.path?.hasOwnProperty(group)) {
            return encoder(String(options.path[group]));
        }
        return substring;
    });
    const url = `${config.BASE}${path}`;
    if (options.query) {
        return `${url}${getQueryString(options.query)}`;
    }
    return url;
};
const getFormData = (options) => {
    if (options.formData) {
        const formData = new FormData();
        const process = (key, value) => {
            if (isString(value) || isBlob(value)) {
                formData.append(key, value);
            }
            else {
                formData.append(key, JSON.stringify(value));
            }
        };
        Object.entries(options.formData)
            .filter(([_, value]) => isDefined(value))
            .forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => process(key, v));
            }
            else {
                process(key, value);
            }
        });
        return formData;
    }
    return undefined;
};
const resolve = async (options, resolver) => {
    if (typeof resolver === 'function') {
        return resolver(options);
    }
    return resolver;
};
const getHeaders = async (config, options) => {
    const token = await resolve(options, config.TOKEN);
    const username = await resolve(options, config.USERNAME);
    const password = await resolve(options, config.PASSWORD);
    const additionalHeaders = await resolve(options, config.HEADERS);
    const headers = Object.entries({
        Accept: 'application/json',
        ...additionalHeaders,
        ...options.headers,
    })
        .filter(([_, value]) => isDefined(value))
        .reduce((headers, [key, value]) => ({
        ...headers,
        [key]: String(value),
    }), {});
    if (isStringWithValue(token)) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (isStringWithValue(username) && isStringWithValue(password)) {
        const credentials = base64(`${username}:${password}`);
        headers['Authorization'] = `Basic ${credentials}`;
    }
    if (options.body) {
        if (options.mediaType) {
            headers['Content-Type'] = options.mediaType;
        }
        else if (isBlob(options.body)) {
            headers['Content-Type'] = options.body.type || 'application/octet-stream';
        }
        else if (isString(options.body)) {
            headers['Content-Type'] = 'text/plain';
        }
        else if (!isFormData(options.body)) {
            headers['Content-Type'] = 'application/json';
        }
    }
    return new Headers(headers);
};
const getRequestBody = (options) => {
    if (options.body) {
        if (options.mediaType?.includes('/json')) {
            return JSON.stringify(options.body);
        }
        else if (isString(options.body) || isBlob(options.body) || isFormData(options.body)) {
            return options.body;
        }
        else {
            return JSON.stringify(options.body);
        }
    }
    return undefined;
};
const sendRequest = async (config, options, url, body, formData, headers, onCancel) => {
    const controller = new AbortController();
    const request = {
        headers,
        body: body ?? formData,
        method: options.method,
        signal: controller.signal,
    };
    if (config.WITH_CREDENTIALS) {
        request.credentials = config.CREDENTIALS;
    }
    onCancel(() => controller.abort());
    return await fetch(url, request);
};
const getResponseHeader = (response, responseHeader) => {
    if (responseHeader) {
        const content = response.headers.get(responseHeader);
        if (isString(content)) {
            return content;
        }
    }
    return undefined;
};
const getResponseBody = async (response) => {
    if (response.status !== 204) {
        try {
            const contentType = response.headers.get('Content-Type');
            if (contentType) {
                const isJSON = contentType.toLowerCase().startsWith('application/json');
                if (isJSON) {
                    return await response.json();
                }
                else {
                    return await response.text();
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    return undefined;
};
const catchErrorCodes = (options, result) => {
    const errors = {
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        ...options.errors,
    };
    const error = errors[result.status];
    if (error) {
        throw new ApiError(options, result, error);
    }
    if (!result.ok) {
        throw new ApiError(options, result, 'Generic Error');
    }
};
/**
 * Request method
 * @param config The OpenAPI configuration object
 * @param options The request options from the service
 * @returns CancelablePromise<T>
 * @throws ApiError
 */
const request = (config, options) => {
    return new CancelablePromise(async (resolve, reject, onCancel) => {
        try {
            const url = getUrl(config, options);
            const formData = getFormData(options);
            const body = getRequestBody(options);
            const headers = await getHeaders(config, options);
            if (!onCancel.isCancelled) {
                const response = await sendRequest(config, options, url, body, formData, headers, onCancel);
                const responseBody = await getResponseBody(response);
                const responseHeader = getResponseHeader(response, options.responseHeader);
                const result = {
                    url,
                    ok: response.ok,
                    status: response.status,
                    statusText: response.statusText,
                    body: responseHeader ?? responseBody,
                };
                catchErrorCodes(options, result);
                resolve(result.body);
            }
        }
        catch (error) {
            reject(error);
        }
    });
};

class FetchHttpRequest extends BaseHttpRequest {
    constructor(config) {
        super(config);
    }
    /**
     * Request method
     * @param options The request options from the service
     * @returns CancelablePromise<T>
     * @throws ApiError
     */
    request(options) {
        return request(this.config, options);
    }
}

class DefaultService {
    constructor(httpRequest) {
        this.httpRequest = httpRequest;
    }
    /**
     * @returns any Default Response
     * @throws ApiError
     */
    get() {
        return this.httpRequest.request({
            method: 'GET',
            url: '/',
        });
    }
    /**
     * @param page
     * @returns any Default Response
     * @throws ApiError
     */
    getDocuments(page) {
        return this.httpRequest.request({
            method: 'GET',
            url: '/documents',
            query: {
                'page': page,
            },
        });
    }
    /**
     * @param page
     * @returns any Default Response
     * @throws ApiError
     */
    getScores(page) {
        return this.httpRequest.request({
            method: 'GET',
            url: '/scores',
            query: {
                'page': page,
            },
        });
    }
}

class DocumentService {
    constructor(httpRequest) {
        this.httpRequest = httpRequest;
    }
    /**
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    getDocument(id) {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/document/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    updateDocument(id, requestBody) {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/document/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    deleteDocument(id) {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/document/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param page
     * @param count
     * @param sortDirection
     * @returns any Default Response
     * @throws ApiError
     */
    getDocuments(page, count, sortDirection) {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/document/',
            query: {
                'page': page,
                'count': count,
                'sortDirection': sortDirection,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    createDocument(requestBody) {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/document/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param num
     * @returns any Default Response
     * @throws ApiError
     */
    getRandomPairs(num) {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/document/random-pairs',
            query: {
                'num': num,
            },
        });
    }
    /**
     * @returns number Default Response
     * @throws ApiError
     */
    countPages() {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/document/count',
        });
    }
}

class ScoreService {
    constructor(httpRequest) {
        this.httpRequest = httpRequest;
    }
    /**
     * @param doc1
     * @param doc2
     * @param page
     * @param count
     * @param sortDirection
     * @returns any Default Response
     * @throws ApiError
     */
    getScore(doc1, doc2, page, count, sortDirection) {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/score/',
            query: {
                'doc1': doc1,
                'doc2': doc2,
                'page': page,
                'count': count,
                'sortDirection': sortDirection,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    createScore(requestBody) {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/score/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param doc1
     * @param doc2
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    updateScore(doc1, doc2, requestBody) {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/score/',
            query: {
                'doc1': doc1,
                'doc2': doc2,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param doc1
     * @param doc2
     * @returns any Default Response
     * @throws ApiError
     */
    deleteScore(doc1, doc2) {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/score/',
            query: {
                'doc1': doc1,
                'doc2': doc2,
            },
        });
    }
    /**
     * @returns number Default Response
     * @throws ApiError
     */
    countPages() {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/score/count',
        });
    }
}

class API {
    constructor(config, HttpRequest = FetchHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? '',
            VERSION: config?.VERSION ?? '0.0.1',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });
        this.default = new DefaultService(this.request);
        this.document = new DocumentService(this.request);
        this.score = new ScoreService(this.request);
    }
}

const OpenAPI = {
    BASE: '',
    VERSION: '0.0.1',
    WITH_CREDENTIALS: false,
    CREDENTIALS: 'include',
    TOKEN: undefined,
    USERNAME: undefined,
    PASSWORD: undefined,
    HEADERS: undefined,
    ENCODE_PATH: undefined,
};

export { API, ApiError, BaseHttpRequest, CancelError, CancelablePromise, DefaultService, DocumentService, OpenAPI, ScoreService };
