import { HttpError } from "./HttpError";

type MakeRequestOptions = {
  method: "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "TRACE" | "CONNECT" | "PATCH";
  headers: Record<string, string>;
  body?: any;
  searchParams?: string[][] | Record<string, string> | string | URLSearchParams;
}

export class ApiClient {
  private scheme;
  private hostName;
  private port;
  private baseUrl;

  constructor(
    scheme: "http" | "https", 
    hostName: string, 
    port?: number,
  ) {
    this.scheme = scheme;
    this.hostName = hostName;
    this.port = port ?? (this.scheme === "http" ? 80 : 443);
    this.baseUrl = `${this.scheme}://${this.hostName}:${this.port}`;
  }

  async makeRequest<T>(path: string, options: MakeRequestOptions): Promise<T> {
    const { method, headers, body, searchParams } = options;

    const searchParamsStr = searchParams ? `?${new URLSearchParams(searchParams).toString()}` : "";
    const fullUrl = this.baseUrl + path + searchParamsStr;
    
    try {
      const response = await fetch(fullUrl, {
        method,
        headers,
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new HttpError(response.status, `Status: ${response.status}. Detail: ${result.detail}`);
      }

      return result;
    
    } catch (error) {
      throw error;
    } 
  }
}