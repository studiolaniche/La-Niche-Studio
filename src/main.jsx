import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";

// Pages
import Accueil from "./pages/Accueil.jsx";
import Catalogue from "./pages/Catalogue.jsx";
import Nouveautes from "./pages/Nouveautes.jsx";
import Projet from "./pages/Projet.jsx";
import Soutenir from "./pages/Soutenir.jsx";
import Apropos from "./pages/Apropos.jsx";
import Realisateurs from "./pages/Realisateurs.jsx";
import CGU from "./pages/CGU.jsx";
import MentionsLegales from "./pages/MentionsLegales.jsx";

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const NotFound = () => (
  <div className="min-h-[60vh] flex items-center justify-center px-6">
    <h1 className="text-center mt-20 text-2xl">404 - Page introuvable 😢</h1>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Accueil /> },
      { path: "catalogue", element: <Catalogue /> },
      { path: "nouveautes", element: <Nouveautes /> },
      { path: "projet/:id", element: <Projet /> },
      { path: "soutenir", element: <Soutenir /> },
      { path: "apropos", element: <Apropos /> },
      { path: "realisateurs", element: <Realisateurs /> },

      // ✅ Légal
      { path: "cgu", element: <CGU /> },
      { path: "mentions-legales", element: <MentionsLegales /> },

      // 404
      { path: "*", element: <NotFound /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
