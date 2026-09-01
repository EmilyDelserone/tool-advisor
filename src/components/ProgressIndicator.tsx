type ProgressIndicatorProps = {
  currentIndex: number;
  totalQuestions: number;
};

export function ProgressIndicator({ currentIndex, totalQuestions }: ProgressIndicatorProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
          fontWeight: 600,
          color: '#0f172a',
        }}
      >
        <span>Question {currentIndex + 1}</span>
        <span>{totalQuestions} total</span>
      </div>
      <div
        aria-label="Progress"
        style={{
          width: '100%',
          background: '#e2e8f0',
          height: '12px',
          borderRadius: '999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
            borderRadius: '999px',
            transition: 'width 0.2s ease',
          }}
        />
      </div>
    </div>
  );
}
