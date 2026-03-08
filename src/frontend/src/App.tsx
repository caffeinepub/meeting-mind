import { Toaster } from "@/components/ui/sonner";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import HomePage from "./pages/HomePage";
import RecordDetailPage from "./pages/RecordDetailPage";
import RecordFormPage from "./pages/RecordFormPage";
import TranscriptPage from "./pages/TranscriptPage";

// ── Routes ───────────────────────────────────────────────
const rootRoute = createRootRoute();

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const transcriptRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/new/transcript",
  component: TranscriptPage,
});

const newRecordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/new/form",
  component: RecordFormPage,
});

const editRecordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/edit/$id",
  component: RecordFormPage,
});

const detailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/record/$id",
  component: RecordDetailPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  transcriptRoute,
  newRecordRoute,
  editRecordRoute,
  detailRoute,
]);

const memoryHistory = createMemoryHistory({ initialEntries: ["/"] });

const router = createRouter({
  routeTree,
  history: memoryHistory,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </>
  );
}
