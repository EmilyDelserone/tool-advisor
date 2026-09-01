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
      className="question-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (selectedValue) {
          onNext();
        }
      }}
    >
      <fieldset className="question-fieldset">
        <legend className="question-legend">{question.text}</legend>

        <div className="option-list">
          {options.map((option) => {
            const isSelected = selectedValue === option.id;

            return (
              <label
                key={option.id}
                className={isSelected ? 'option is-selected' : 'option'}
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

      <div className="wizard-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={onBack}
          disabled={!canGoBack}
        >
          Back
        </button>

        <button type="submit" className="button button-primary" disabled={!selectedValue}>
          {isLastQuestion ? 'See recommendation' : 'Next'}
        </button>
      </div>
    </form>
  );
}
