import { Loader2 } from "lucide-react";

const LoadingSpinner = ({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className="animate-spin text-muted-foreground" size={size} />
    </div>
  );
};

export default LoadingSpinner;
