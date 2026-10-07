import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../shared/layout/AppShell";
import { RutaProtegida } from "./RutaProtegida";
import { ErrorPantalla } from "./ErrorPantalla";
import { LoginPage } from "../features/sesion/LoginPage";
import { InicioPage } from "../features/inicio/InicioPage";
import { CatalogosPage } from "../features/catalogos/CatalogosPage";
import { PortadaPage } from "../features/tramites/PortadaPage";
import { TipoPage } from "../features/impuestos/TipoPage";
import { TramitesPage } from "../features/tramites/TramitesPage";
import { ExpedientePage } from "../features/expediente/ExpedientePage";
import { EquipoPage } from "../features/tramites/EquipoPage";
import { AdministracionPage } from "../features/administracion/AdministracionPage";

/** Sin barra final. Vacío en la raíz; `/Design` en GitHub Pages. */
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

/**
 * Rutas de la aplicación. Cada feature nuevo agrega las suyas aquí.
 * Todo lo que va dentro de RutaProtegida exige sesión iniciada.
 */
export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage />, errorElement: <ErrorPantalla /> },
  {
    element: <RutaProtegida />,
    errorElement: <ErrorPantalla />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <PortadaPage /> },
          { path: "/impuestos/:idImpuesto", element: <TipoPage /> },
          { path: "/impuestos/:idImpuesto/tipos/:idTipo", element: <TramitesPage /> },
          { path: "/impuestos/:idImpuesto/tipos/:idTipo/tramites/:idTramite", element: <ExpedientePage /> },
          { path: "/impuestos/:idImpuesto/tipos/:idTipo/tramites/:idTramite/equipo", element: <EquipoPage /> },
          { path: "/mi-acceso", element: <InicioPage /> },
          { path: "/administracion", element: <AdministracionPage /> },
          { path: "/catalogos", element: <CatalogosPage /> }
        ]
      }
    ]
  }
], { basename });
