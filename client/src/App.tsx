import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import Send from "@/pages/Send";
import Inbox from "@/pages/Inbox";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/to/:slug" component={Send} />
      <Route path="/inbox" component={Inbox} />
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
