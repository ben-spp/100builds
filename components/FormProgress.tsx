interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  stepFieldCounts: number[]; // Number of fields in each step
  completedFields: number[]; // Number of completed fields per step
  transparent?: boolean; // For sticky mobile version with backdrop wrapper
}

export default function FormProgress({
  currentStep,
  totalSteps,
  stepFieldCounts,
  completedFields,
  transparent = false,
}: FormProgressProps) {
  // Calculate total fields across all steps
  const totalFields = stepFieldCounts.reduce((sum, count) => sum + count, 0);

  // Calculate total completed fields
  const totalCompleted = completedFields.reduce((sum, count) => sum + count, 0);

  // Calculate progress percentage
  const progress = totalFields > 0 ? (totalCompleted / totalFields) * 100 : 0;

  return (
    <div className={`w-full ${transparent ? 'bg-transparent' : 'bg-surface-0'} border-t border-b border-border py-6 px-4`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-text-secondary">
            Step {currentStep} of {totalSteps}
          </div>
          <div className="text-xs text-text-muted">
            {Math.round(progress)}% complete
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
