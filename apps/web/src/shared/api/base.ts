import axios, { AxiosError, AxiosHeaders, AxiosInstance, InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

class ApiInstance {
	private axiosClient: AxiosInstance;
	private accessToken: string | null = null;
	private refreshPromise: Promise<string | null> | null = null;
	private refreshHandler: (() => Promise<string | null>) | null = null;

	private onAccessTokenChange?: (token: string | null) => void;
	private unauthorizedHandler?: () => void;

	constructor() {
		this.axiosClient = axios.create({
			baseURL: API_URL,
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true,
		});

		this.axiosClient.interceptors.request.use((config) => {
			if (this.accessToken) {
				const headers = AxiosHeaders.from(config.headers);
				headers.set("Authorization", `Bearer ${this.accessToken}`);
				config.headers = headers;
			}
			return config;
		});

		this.axiosClient.interceptors.response.use(
			(response) => response,
			async (error: AxiosError) => {
				const status = error.response?.status;
				const originalRequest = error.config as RetriableRequestConfig | undefined;

				if (status !== 401 || !originalRequest) {
					return Promise.reject(error);
				}

				const requestUrl = originalRequest.url ?? "";
				const isAuthRequest =
					requestUrl.includes("/auth/login") ||
					requestUrl.includes("/auth/register") ||
					requestUrl.includes("/auth/refresh-tokens") ||
					requestUrl.includes("/auth/logout");

				if (isAuthRequest || originalRequest._retry) {
					this.setAccessToken(null);
					this.unauthorizedHandler?.();
					return Promise.reject(error);
				}

				originalRequest._retry = true;

				const newToken = await this.refreshAccessToken();
				if (!newToken) {
					this.setAccessToken(null);
					this.unauthorizedHandler?.();
					return Promise.reject(error);
				}

				const headers = AxiosHeaders.from(originalRequest.headers);
				headers.set("Authorization", `Bearer ${newToken}`);
				originalRequest.headers = headers;

				return this.axiosClient.request(originalRequest);
			},
		);
	}

	setAccessToken(token: string | null) {
		this.accessToken = token;
		this.onAccessTokenChange?.(token);
	}

	onTokenChange(handler: (token: string | null) => void) {
		this.onAccessTokenChange = handler;
	}

	onUnauthorized(handler: () => void) {
		this.unauthorizedHandler = handler;
	}

	setRefreshHandler(handler: () => Promise<string | null>) {
		this.refreshHandler = handler;
	}

	private async refreshAccessToken(): Promise<string | null> {
		if (!this.refreshHandler) {
			return null;
		}

		if (this.refreshPromise) {
			return await this.refreshPromise;
		}

		this.refreshPromise = this.refreshHandler()
			.catch(() => null)
			.finally(() => {
				this.refreshPromise = null;
			});

		const token = await this.refreshPromise;
		if (token) {
			this.setAccessToken(token);
		}
		return token;
	}

	async get<T>(url: string): Promise<T> {
		const response = await this.axiosClient.get<T>(url);
		return response.data;
	}

	async post<TResponse, TBody = unknown>(url: string, body?: TBody): Promise<TResponse> {
		const response = await this.axiosClient.post<TResponse>(url, body);
		return response.data;
	}

	async put<TResponse, TBody = unknown>(url: string, body?: TBody): Promise<TResponse> {
		const response = await this.axiosClient.put<TResponse>(url, body);
		return response.data;
	}

	async patch<TResponse, TBody = unknown>(url: string, body?: TBody): Promise<TResponse> {
		const response = await this.axiosClient.patch<TResponse>(url, body);
		return response.data;
	}

	async delete<T>(url: string): Promise<T> {
		const response = await this.axiosClient.delete<T>(url);
		return response.data;
	}
}

export const api = new ApiInstance();
