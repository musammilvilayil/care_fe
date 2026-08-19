import { AppUpdateNotifier } from "@/components/Common/AppUpdateNotifier";
import Loading from "@/components/Common/Loading";
import ProductionWarningBanner from "@/components/Common/ProductionWarningBanner";
import { Toaster } from "@/components/ui/sonner";
import { ShortcutProvider } from "@/context/ShortcutContext";
import Integrations from "@/Integrations";
import { OverrideProvider } from "@/lib/override";
import PluginEngine from "@/PluginEngine";
import AuthUserProvider from "@/Providers/AuthUserProvider";
import PublicRouter from "@/Routers/PublicRouter";
import { displayCareConsoleArt } from "@/Utils/consoleArt";
import queryClient from "@/Utils/request/queryClient";
import careConfig from "@careConfig";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useLocationChange } from "raviger";
import { lazy, Suspense, useCallback, useEffect, useRef } from "react";
import { PubSubProvider, usePubSub } from "./Utils/pubsubContext";

const PubSubRenderProbe = () => {
  const { subscribe, unsubscribe } = usePubSub();
  const handler = useCallback(async () => {}, []);
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <div className="fixed right-4 top-20 z-[99999] rounded-lg border bg-white p-4 shadow-xl">
      <div className="font-bold">PubSub Render Probe</div>
      <div className="mb-3">Render count: {renderCount.current}</div>
      <div className="flex gap-2">
        <button
          className="rounded bg-blue-600 px-3 py-2 text-white"
          onClick={() => subscribe("react-scan-demo", handler)}
        >
          Subscribe
        </button>
        <button
          className="rounded bg-red-600 px-3 py-2 text-white"
          onClick={() => unsubscribe("react-scan-demo", handler)}
        >
          Unsubscribe
        </button>
      </div>
    </div>
  );
};

const PatientRouter = lazy(() => import("@/Routers/PatientRouter"));
const AppRouter = lazy(() => import("@/Routers/AppRouter"));

const ScrollToTop = () => {
  useLocationChange(() => {
    window.scrollTo(0, 0);
  });

  return null;
};

const App = () => {
  useEffect(() => {
    displayCareConsoleArt();
  }, []);

  return (
    <>
      <ProductionWarningBanner />
      <QueryClientProvider client={queryClient}>
        <ScrollToTop />
        <Suspense fallback={<Loading />}>
          <PubSubProvider>
            <PubSubRenderProbe />
            <ShortcutProvider>
              <PluginEngine>
                <OverrideProvider>
                  <AuthUserProvider
                    unauthorized={<PublicRouter />}
                    otpAuthorized={
                      <Suspense fallback={<Loading />}>
                        <PatientRouter />
                      </Suspense>
                    }
                  >
                    <Suspense fallback={<Loading />}>
                      <AppRouter />
                    </Suspense>
                  </AuthUserProvider>
                </OverrideProvider>
                <Toaster
                  position={careConfig.toastPosition}
                  theme="light"
                  richColors
                  expand
                  // For `richColors` to work, pass at-least an empty object.
                  // Refer: https://github.com/shadcn-ui/ui/issues/2234.
                  toastOptions={{}}
                  closeButton
                />
                <AppUpdateNotifier />
              </PluginEngine>
            </ShortcutProvider>
          </PubSubProvider>
        </Suspense>

        {/* Devtools are not included in production builds by default */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
      <Integrations.Sentry disabled={!import.meta.env.PROD} />
    </>
  );
};

export default App;
