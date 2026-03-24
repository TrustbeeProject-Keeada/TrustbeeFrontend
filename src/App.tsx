import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { JobProvider } from "@/contexts/JobContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import CreateJob from "./pages/CreateJob";
import EditJob from "./pages/EditJob";
import ManageJobs from "./pages/ManageJobs";
import Messages from "./pages/Messages";
import Saved from "./pages/Saved";
import AIAssistant from "./pages/AIAssistant";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <JobProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/jobs/:id" element={<JobDetail />} />
                    <Route path="/create-job" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
                    <Route path="/edit-job/:id" element={<ProtectedRoute><EditJob /></ProtectedRoute>} />
                    <Route path="/manage-jobs" element={<ProtectedRoute><ManageJobs /></ProtectedRoute>} />
                    <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                    <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
                    <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
                    <Route path="/support" element={<Support />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </JobProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
