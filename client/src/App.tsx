import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import SenderInfoPage from "@/pages/SenderInfoPage";
import ConfessionComposePage from "@/pages/ConfessionComposePage";
import ConfessionViewer from "@/pages/ConfessionViewer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SenderInfoPage} />
      <Route path="/compose" component={ConfessionComposePage} />
      <Route path="/v/:id" component={ConfessionViewer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
