import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export function CvBuilder() {
  const navigate = useNavigate();
  return (
    <Button variant="outline" size="sm" onClick={() => navigate("/cv-builder")}>
      <FileText className="mr-1.5 h-4 w-4" /> Create CV
    </Button>
  );
}
