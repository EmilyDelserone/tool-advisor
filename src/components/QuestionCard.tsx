import type { Question } from '../engine/types';

type QuestionCardProps = {
  question: Question;
  selectedValue?: string;
  isLastQuestion: boolean;
  canGoBack: boolean;
  onSelect: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
};

export function QuestionCard({
  question,
  selectedValue,
  isLastQuestion,
  canGoBack,
  onSelect,
  onNext,
  onBack,
}: QuestionCardProps) {
  const options = question.options ?? [
    { id: 'yes', label: 'Yes' },
    { id: 'no', label: 'No' },
  ];

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (selectedValue) {
          onNext();
        }
      }}
      style={{ display: 'grid', gap: '1rem' }}
    >
      <fieldset style={{ border: '1px solid #dbe4f0', borderRadius: '12px', padding: '1.25rem' }}>
        <legend style={{ fontSize: '1.1rem', fontWeight: 700, padding: '0 0.5rem' }}>
          {question.text}
        </legend>

        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
          {options.map((option) => {
            const isSelected = selectedValue === option.id;

            return (
              <label
                key={option.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0.9rem',
                  borderRadius: '10px',
                  border: `1px solid ${isSelected ? '#2563eb' : '#cbd5e1'}`,
                  cursor: 'pointer',
                  background: isSelected ? '#eff6ff' : '#f8fafc',
                }}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={isSelected}
                  onChange={() => onSelect(option.id)}
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          style={{
            padding: '0.7rem 1.2rem',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#0f172a',
            fontWeight: 600,
            cursor: canGoBack ? 'pointer' : 'not-allowed',
            opacity: canGoBack ? 1 : 0.5,
          }}
        >
          Back
        </button>

        <button
          type="submit"
          disabled={!selectedValue}
          style={{
            padding: '0.7rem 1.4rem',
            borderRadius: '10px',
            border: 'none',
            background: selectedValue ? '#2563eb' : '#94a3b8',
            color: '#ffffff',
            fontWeight: 700,
            cursor: selectedValue ? 'pointer' : 'not-allowed',
          }}
        >
          {isLastQuestion ? 'See recommendation' : 'Next'}
        </button>
      </div>
    </form>
  );
}
