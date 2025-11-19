import httpOrigin from "@/constants/http-origin"


export async function makeRequest(input: RequestInfo | URL, init: RequestInit) {
  const fullUrl = `${httpOrigin}${input}`;
  
  try {
    const response = await fetch(fullUrl, init);
    const result = await response.json();

    if (!response.ok) {
      const { message = "Unknown reason" } = result ?? {};
      throw new Error(`Wystąpił błąd: ${message}. Kod: ${response.status}.`);
    }

    return result;
  
  } catch (error) {
    throw error;
  }
  
}