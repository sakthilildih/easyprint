import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useUser } from "@/store/orders";

// Eagerly import the main in-app pages so tab navigation is instant.
import Dashboard from "./pages/Dashboard";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import OrderSuccess from "./pages/OrderSuccess";
import Admin from "./pages/Admin";

// Keep auth + 404 lazy — they're rarely revisited.
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RequireAuth({ children }: { children: JSX.Element }) {
  const user = useUser();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

const App = () => (
  <BrowserRouter>
    <Suspense fallback={null}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/orders" element={<RequireAuth><MyOrders /></RequireAuth>} />
        <Route path="/orders/:id" element={<RequireAuth><OrderDetails /></RequireAuth>} />
        <Route path="/success/:id" element={<RequireAuth><OrderSuccess /></RequireAuth>} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;
