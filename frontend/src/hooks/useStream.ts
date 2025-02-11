/**
 * Just use this hook on any Endpoint that returns a stream of data.
 *
 * No need to edit the hook, just pass the getStream function and the optional callbacks.
 *
 */

import { useCallback, useRef, useState } from "react";

interface StreamProps<T> {
  getStream: ((params: T) => Promise<Response>) | (() => Promise<Response>);
  onMessage?: (m: string) => void;
  onError?: (error?: unknown) => void;
  onSuccess?: (text?: string) => void;
}

export const useStream = <T>({
  getStream,
  onMessage,
  onError,
  onSuccess,
}: StreamProps<T>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [text, setText] = useState<string>("");
  const stopRef = useRef(false);
  const abortControllerRef = useRef(new AbortController());

  const start = useCallback(
    async (params?: T) => {
      setIsLoading(true);
      setIsProcessing(true);
      setIsError(false);
      setIsSuccess(false);
      setText("");
      stopRef.current = false;
      abortControllerRef.current = new AbortController();

      try {
        // Determine which version of getStream to call based on params
        const streamRequest = params
          ? getStream(params)
          : (getStream as () => Promise<Response>)();

        // Get the response and set up abort handling
        const stream_source = await streamRequest.then((response) => {
          // Set up cleanup for when abort is triggered
          const abortHandler = () => {
            if (response.body) {
              response.body.cancel();
            }
          };

          abortControllerRef.current.signal.addEventListener(
            "abort",
            abortHandler,
          );
          return response;
        });

        if (!stream_source.ok) {
          if (!stopRef.current) {
            // only set error if not cancelled
            setIsError(true);
            onError && onError();
          }
          console.log("error in useStream");
          throw new Error(`HTTP error! status: ${stream_source.status}`);
        }

        if (stream_source.body) {
          setIsLoading(false);
          const reader = stream_source.body
            .pipeThrough(new TextDecoderStream())
            .getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              setIsSuccess(true);
              setIsProcessing(false);
              onSuccess && onSuccess(text);
              break;
            }
            if (stopRef.current) {
              await reader.cancel();
              stopRef.current = false;
              break;
            }
            // TODO: Error handling, from backend
            // if (value.includes("#error")) {
            //   setIsError(true);
            //   onError && onError();
            //   break;
            // }
            setText((prev) => prev + value);
            onMessage && onMessage(value);
          }
        }
      } catch (e) {
        if (!stopRef.current) {
          onError && onError(e);
          setIsError(true);
          console.error(e);
        }
      } finally {
        setIsLoading(false);
        setIsProcessing(false);
      }
    },
    [onMessage, onError, onSuccess],
  );

  const stop = () => {
    abortControllerRef.current.abort();
    stopRef.current = true;
    setIsSuccess(false);
    setIsProcessing(false);
    setIsError(false);
  };

  return {
    start,
    stop,
    text: text.trim(),
    isLoading,
    isError,
    isSuccess,
    isProcessing,
  };
};
