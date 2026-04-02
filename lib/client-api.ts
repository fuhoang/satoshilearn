type ApiErrorPayload = {
  error?: string;
};

type ApiErrorMessageOptions = {
  badRequestMessage?: string;
  fallbackMessage: string;
  networkMessage?: string;
  rateLimitMessage?: string;
  unauthorizedMessage?: string;
  unavailableMessage?: string;
};

async function readErrorPayload(response: Response) {
  try {
    return (await response.json()) as ApiErrorPayload;
  } catch {
    return null;
  }
}

export async function getApiErrorMessage(
  response: Response,
  options: ApiErrorMessageOptions,
) {
  const payload = await readErrorPayload(response);
  const payloadError = payload?.error;

  if (response.status === 400) {
    return payloadError ?? options.badRequestMessage ?? options.fallbackMessage;
  }

  if (response.status === 401) {
    return payloadError ?? options.unauthorizedMessage ?? options.fallbackMessage;
  }

  if (response.status === 429) {
    return payloadError ?? options.rateLimitMessage ?? options.fallbackMessage;
  }

  if (response.status === 502 || response.status === 503) {
    return payloadError ?? options.unavailableMessage ?? options.fallbackMessage;
  }

  return payloadError ?? options.fallbackMessage;
}

export function getNetworkErrorMessage(options: ApiErrorMessageOptions) {
  return options.networkMessage ?? options.unavailableMessage ?? options.fallbackMessage;
}
