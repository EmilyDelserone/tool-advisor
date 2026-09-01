type ProgressIndicatorProps = {
  currentIndex: number;
  totalQuestions: number;
  isTiebreaker?: boolean;
};

export function ProgressIndicator({
  currentIndex,
  totalQuestions,
  isTiebreaker = false,
}: ProgressIndicatorProps) {
  const currentPosition = currentIndex + 1;
  const progress = (currentPosition / totalQuestions) * 100;
  const label = isTiebreaker
    ? `Tiebreaker question ${currentPosition} of ${totalQuestions}`
    : `Question ${currentPosition} of ${totalQuestions}`;

  return (
    <div className="progress">
      <div className="progress-labels" aria-live="polite">
        <span>{label}</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Wizard progress"
        aria-valuenow={currentPosition}
        aria-valuemin={1}
        aria-valuemax={totalQuestions}
        aria-valuetext={label}
      >
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
